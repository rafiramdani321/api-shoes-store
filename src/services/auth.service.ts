import { AppError } from "../utils/errors";
import ms from "ms";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

import { prisma } from "../libs/prisma";
import { verifyGoogleAccessToken } from "../utils/verifyGoogleAccessToken";
import { comparePassword, hashPassword } from "../utils/hash";
import {
  signEmailVerificationToken,
  verifyEmailVerificationToken,
} from "../utils/emailVerificationToken";
import { signAccessToken } from "../utils/accessToken";
import { signRefreshToken } from "../utils/refreshToken";
import { Role } from "../constants/role-permission";
import { validationResponses } from "../validations/index.validation";
import { env } from "../constants/env";
import {
  DeviceInfo,
  LoginInput,
  RegisterInput,
  RequireAuth,
} from "../types/auth.type";
import {
  loginValidation,
  registerValidation,
} from "../validations/validation-schema";
import UserRepository from "../repositories/user.repository";
import TokenRepository from "../repositories/token.repository";
import { sendVerificationEmail } from "./mail.service";
import { generateDeviceHash } from "../utils/generateDeviceHash";
import SessionRepository from "../repositories/session.repository";
import RoleService from "./role.service";
import UserService from "./user.service";
import TokenService from "./token.service";

export default class AuthService {
  static async register(data: RegisterInput) {
    const validation = registerValidation.safeParse(data);
    if (!validation.success) {
      throw new AppError(
        "Validation failed.",
        400,
        validationResponses(validation)
      );
    }

    const [existingUsername, existingEmail] = await Promise.all([
      UserRepository.findByUsername(data.username),
      UserRepository.findByEmail(data.email),
    ]);

    const dbErrors: { field: keyof RegisterInput; message: string }[] = [];

    if (existingUsername) {
      dbErrors.push({ field: "username", message: "Username already taken." });
    }

    if (existingEmail) {
      dbErrors.push({ field: "email", message: "Email already taken." });
    }

    if (dbErrors.length > 0) {
      throw new AppError("Validation failed.", 400, dbErrors);
    }

    const hashedPassword = data.password
      ? await hashPassword(data.password)
      : null;

    if (!hashedPassword) {
      throw new AppError("Something went wrong. Please try again.", 500);
    }

    let role;
    try {
      role = await RoleService.getByName(Role.CUSTOMER);
    } catch (error) {
      const newRole = {
        name: Role.CUSTOMER,
        created_by: "System",
      };
      role = await RoleService.addRole(newRole);
    }

    if (!role) {
      throw new AppError("Something went wrong. Please try again.", 500);
    }

    const { user, token } = await prisma.$transaction(async (tx) => {
      const user = await UserRepository.createUserTx(tx, {
        ...data,
        password: hashedPassword,
        is_verified: false,
        role_id: role.id,
        auth_provider: "local",
        image_url: env.IMAGE_DEFAULT_USER,
      });

      const expiresInMs = ms(
        env.EMAIL_TOKEN_VERIFICATION_EXPIRES_IN as ms.StringValue
      );

      const token = await TokenRepository.createTokenTx(tx, {
        token: signEmailVerificationToken(user.email),
        user_id: user.id,
        status: "ACTIVE",
        type: "EMAIL_ACTIVATION",
        expired_at: new Date(Date.now() + expiresInMs),
      });

      return { user, token };
    });

    try {
      await sendVerificationEmail(user.email, token.token, user.username);
    } catch (error) {
      await UserRepository.deleteById(user.id);
      throw new AppError(
        "Failed to send verification email. Please try again later.",
        500
      );
    }

    return {
      email: user.email,
      username: user.username,
      created_at: user.created_at,
    };
  }

  static async verifyEmailAccountActivation(
    token: string | undefined,
    ip: string,
    userAgent: string
  ) {
    let payload;

    if (!token || typeof token !== "string") {
      throw new AppError("Token not found.", 404);
    }

    const existingToken = await TokenRepository.findByToken(token);
    if (!existingToken) {
      throw new AppError("Invalid Link. Please check your URL.", 400);
    }
    if (existingToken.type !== "EMAIL_ACTIVATION") {
      throw new AppError("Invalid token Type.", 400);
    }
    if (existingToken.status === "USED") {
      throw new AppError("Invalid Link. Token already used.", 400);
    }

    const now = new Date();
    if (existingToken.expired_at < now) {
      await TokenRepository.markStatusByToken(token, "EXPIRED");
      throw new AppError("Invalid Link, Token has expired", 400, [
        {
          field: "token_has_expired",
          message: "token_has_expired",
        },
      ]);
    }

    if (existingToken.status === "EXPIRED") {
      throw new AppError(
        "Token has expired. Please check the most recent message in email or you can resend new verification ",
        400,
        [
          {
            field: "token_has_expired",
            message: "token_has_expired",
          },
        ]
      );
    }

    try {
      payload = verifyEmailVerificationToken(token);
    } catch (innerError) {
      if (innerError instanceof TokenExpiredError) {
        await TokenRepository.markStatusByToken(token, "EXPIRED");
        throw new AppError("Token has expired (JWT Expired)", 400, [
          { field: "token_has_expired", message: "token_has_expired" },
        ]);
      } else if (innerError instanceof JsonWebTokenError) {
        throw new AppError("Invalid Token (JWT Broken)", 400);
      } else {
        throw new AppError("An error onccured with the token", 500);
      }
    }

    const deviceHash = generateDeviceHash(ip, userAgent);

    const { user, accessToken, refreshToken } = await prisma.$transaction(
      async (tx) => {
        const user = await UserRepository.updateIsVerifiedByEmailTx(
          tx,
          payload.email,
          true
        );

        const session = await SessionRepository.createOrUpdateTx(tx, {
          user_id: user.id,
          refresh_token: "",
          user_agent: userAgent,
          ip_address: ip,
          device_hash: deviceHash,
        });

        const JwtPayload = {
          user_id: user.id,
          email: user.email,
          username: user.username,
          role: user.role.name,
          token_version: session.token_version,
          session_id: session.id,
          device_hash: deviceHash,
        };

        const accessToken = signAccessToken(JwtPayload);
        const refreshToken = signRefreshToken(JwtPayload);

        await SessionRepository.updateRefreshTokenByIdTx(
          tx,
          session.id,
          refreshToken
        );
        await TokenRepository.markStatusByTokenTx(tx, token, "USED");

        return { user, accessToken, refreshToken };
      }
    );

    return {
      user,
      refreshToken,
      accessToken,
    };
  }

  static async resendTokenEmailVerification(email: string) {
    if (!email || email === null) {
      throw new AppError("Email is required.", 400);
    }

    const user = await UserService.getByEmail(email);
    if (user.is_verified) {
      throw new AppError("Account has been verified.", 400);
    }

    const tokens = await TokenService.getAllTokensByUserId(user.id);

    const { token } = await prisma.$transaction(async (tx) => {
      if (tokens && tokens.length > 0) {
        await TokenRepository.markAllTokensToExpiredByUserId(tx, user.id);
      }

      const expiresInMs = ms(
        env.EMAIL_TOKEN_VERIFICATION_EXPIRES_IN as ms.StringValue
      );

      const token = await TokenRepository.createTokenTx(tx, {
        token: signEmailVerificationToken(user.email),
        user_id: user.id,
        status: "ACTIVE",
        type: "EMAIL_ACTIVATION",
        expired_at: new Date(Date.now() + expiresInMs),
      });

      return { token };
    });

    try {
      await sendVerificationEmail(user.email, token.token, user.username);
    } catch (error) {
      await TokenRepository.deleteById(token.id);
      throw new AppError("Failed to send verification email.", 500);
    }

    return token;
  }

  static async login(data: LoginInput, deviceInfo: DeviceInfo) {
    const validation = loginValidation.safeParse(data);
    if (!validation.success) {
      throw new AppError(
        "Validation failed.",
        400,
        validationResponses(validation)
      );
    }

    const user = await UserRepository.findByEmail(data.email);
    if (!user) {
      throw new AppError("Email / Password incorrect.", 400);
    }

    if (!user.password || user.auth_provider === "google") {
      throw new AppError(
        "This account is linked with Google Login. Please login using Google.",
        400
      );
    }

    const isValidPassword = await comparePassword(data.password, user.password);
    if (!isValidPassword) {
      await new Promise((res) => setTimeout(res, 200));
      throw new AppError("Email / Password incorrect.", 400);
    }

    if (!user.is_verified) {
      throw new AppError(
        "Your email has not been activated. Please check your email or you can request a new activation link.",
        400,
        [
          {
            field: "request_new_verification",
            message: "request_new_verification",
          },
        ]
      );
    }

    const deviceHash = await generateDeviceHash(
      deviceInfo.ip,
      deviceInfo.userAgent
    );

    const { accessToken, refreshToken } = await prisma.$transaction(
      async (tx) => {
        const session = await SessionRepository.createOrUpdateTx(tx, {
          user_id: user.id,
          refresh_token: "",
          user_agent: deviceInfo.userAgent,
          ip_address: deviceInfo.ip,
          device_hash: deviceHash,
        });

        const JwtPayload = {
          user_id: user.id,
          email: user.email,
          username: user.username,
          role: user.role.name,
          token_version: session.token_version,
          session_id: session.id,
          device_hash: deviceHash,
        };

        const accessToken = signAccessToken(JwtPayload);
        const refreshToken = signRefreshToken(JwtPayload);

        await SessionRepository.updateRefreshTokenByIdTx(
          tx,
          session.id,
          refreshToken
        );

        return { accessToken, refreshToken };
      }
    );

    const { password, ...safeUser } = user;

    return {
      safeUser,
      accessToken,
      refreshToken,
    };
  }

  static async logout(data: RequireAuth) {
    if (!data || !data.user_id || !data.session_id) {
      throw new AppError("Invalid user session.", 401);
    }

    const user = await UserService.getById(data.user_id);

    await prisma.$transaction(async (tx) => {
      await SessionRepository.updateRefreshTokenByIdTx(
        tx,
        data.session_id,
        null
      );
      await SessionRepository.incrementTokenVersionByIdTx(tx, data.session_id);
    });

    const { password, Session, ...safeUser } = user;
    return safeUser;
  }

  static async refreshToken(
    currentUser: RequireAuth,
    currentRefreshToken: string
  ) {
    if (
      !currentUser.user_id ||
      !currentRefreshToken ||
      !currentUser.session_id
    ) {
      throw new AppError("Unauthorized access: missing user or token", 401);
    }

    const user = await UserService.getById(currentUser.user_id);

    const userSession = user.Session.find(
      (s) =>
        s.id === currentUser.session_id &&
        s.refresh_token === currentRefreshToken
    );
    if (!userSession) {
      throw new AppError("Refresh token missmatch", 401);
    }

    const updateSession = await SessionRepository.incrementTokenVersionById(
      userSession.id
    );

    const newAccessToken = signAccessToken({
      user_id: user.id,
      email: user.email,
      username: user.username,
      role: user.role.name,
      token_version: updateSession.token_version,
      session_id: updateSession.id,
      device_hash: updateSession.device_hash,
    });

    return { newAccessToken };
  }

  static async loginWithGoogle(token: string, deviceInfo: DeviceInfo) {
    const googleUser = await verifyGoogleAccessToken(token);
    if (!googleUser?.email) {
      throw new AppError("Google account has no email associated.", 400);
    }

    let user;
    user = await UserRepository.findByEmail(googleUser.email);
    if (!user) {
      let role;
      role = await RoleService.getByName(Role.CUSTOMER);
      if (!role) {
        const newData = {
          name: Role.CUSTOMER,
          created_by: "System",
        };
        role = await RoleService.addRole(newData);
        if (!role) {
          throw new AppError("Add role failed", 400);
        }
      }

      user = await UserRepository.createUser({
        username: googleUser.name || googleUser.email.split("@")[0],
        email: googleUser.email,
        password: "",
        role_id: role.id,
        is_verified: true,
        auth_provider: "google",
        image_url: googleUser.picture || env.IMAGE_DEFAULT_USER,
        google_id: googleUser.sub,
      });
    }

    if (!user.is_verified) {
      await UserRepository.updateIsVerifiedByEmail(user.email, true);
    }

    const deviceHash = await generateDeviceHash(
      deviceInfo.ip,
      deviceInfo.userAgent
    );

    const session = await SessionRepository.createOrUpdate({
      user_id: user.id,
      device_hash: deviceHash,
      refresh_token: "",
      user_agent: deviceInfo.userAgent,
      ip_address: deviceInfo.ip,
    });

    const JwtPayload = {
      user_id: user.id,
      email: user.email,
      username: user.username,
      role: user.role.name,
      token_version: session.token_version,
      session_id: session.id,
      device_hash: deviceHash,
    };

    const accessToken = signAccessToken(JwtPayload);
    const refreshToken = signRefreshToken(JwtPayload);

    await SessionRepository.updateRefreshTokenById(session.id, refreshToken);

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      accessToken,
      refreshToken,
    };
  }
}
