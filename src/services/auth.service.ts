import bcrypt from "bcrypt";
import { createUserProps } from "../types/user.type";
import { AppError } from "../utils/errors";
import {
  loginValidation,
  registerValidation,
} from "../validations/validation-schema";
import RoleService from "./role.service";
import { Role } from "../constants";
import UserRepository from "../repositories/user.repository";
import {
  signAccessToken,
  signRefreshToken,
  signTokenEmailVerification,
  verifyTokenEmailVerification,
} from "../libs/jwt";
import TokenRepository from "../repositories/token.repository";
import { sendVerificationEmail } from "./mail.service";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { generateDeviceHash } from "../utils/generateDeviceHash";
import SessionRepository from "../repositories/session.repository";
import {
  DeviceInfoProps,
  LoginProps,
  UserRefreshTokenProps,
  VerifyAccessTokenProps,
} from "../types/auth.type";
import { validationResponses } from "../validations/index.validation";

export default class AuthService {
  static async registerUser(data: createUserProps) {
    const errorsValidation = registerValidation.safeParse(data);
    if (!errorsValidation.success) {
      const errors = validationResponses(errorsValidation);
      throw new AppError("Validation failed.", 400, errors);
    }

    const dbErrors: { field: keyof createUserProps; message: string }[] = [];

    const existingUsername = await UserRepository.findUserByUsername(
      data.username
    );
    if (existingUsername) {
      dbErrors.push({ field: "username", message: "Username already taken." });
    }

    const existingEmail = await UserRepository.findUserByEmail(data.email);
    if (existingEmail) {
      dbErrors.push({ field: "email", message: "Email already taken." });
    }

    if (dbErrors.length > 0) {
      throw new AppError("Validation failed.", 400, dbErrors);
    }

    const hashPassword = await bcrypt.hash(data.password, 10);

    let role;
    role = await RoleService.getRoleByName(Role.CUSTOMER);
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

    const newUserData = await UserRepository.createUser({
      ...data,
      password: hashPassword,
      role_id: role.id,
    });

    const token = signTokenEmailVerification(newUserData.email, "1h");
    const one_hour = 60 * 60 * 1000;
    const newTokenData = {
      user_id: newUserData.id,
      token,
      expires_at: new Date(Date.now() + one_hour),
    };

    await TokenRepository.createToken(newTokenData);
    await sendVerificationEmail(newUserData.email, newUserData.username, token);

    return newUserData;
  }

  static async verifyEmailAccountActivation(
    token: string,
    ip: string,
    userAgent: string
  ) {
    let payload;

    if (!token) {
      throw new AppError("Invalid token url.", 404);
    }

    const existingToken = await TokenRepository.findTokenByToken(token);
    if (!existingToken) {
      throw new AppError("Invalid Link. Please check your URL.", 400);
    }
    if (existingToken.status === "USED") {
      throw new AppError("Invalid Link. Token already used.", 400);
    }

    const now = new Date();
    if (existingToken.expires_at < now) {
      await TokenRepository.markTokenExpiredByToken(token);
      throw new AppError("Invalid Link, Token has expired", 400, [
        {
          field: "token_has_expired",
          message: "token_has_expired",
        },
      ]);
    }

    try {
      payload = verifyTokenEmailVerification(token);
    } catch (innerError) {
      if (innerError instanceof TokenExpiredError) {
        await TokenRepository.markTokenExpiredByToken(token);
        throw new AppError("Token has expired (JWT Expired)", 400, [
          { field: "token_has_expired", message: "token_has_expired" },
        ]);
      } else if (innerError instanceof JsonWebTokenError) {
        throw new AppError("Invalid Token (JWT Broken)", 400);
      } else {
        throw new AppError("An error onccured with the token", 500);
      }
    }

    const user = await UserRepository.updateIsVerifiedByEmail(payload.email);
    const deviceHash = generateDeviceHash(ip, userAgent);

    const session = await SessionRepository.createOrUpdateSession({
      user_id: user.id,
      refresh_token: "",
      user_agent: userAgent,
      ip_address: ip,
      device_hash: deviceHash,
    });

    const JwtPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role.name,
      tokenVersion: session.token_version,
      sessionId: session.id,
      deviceHash,
    };

    const refreshToken = signRefreshToken(JwtPayload, "7d");
    const accessToken = signAccessToken(JwtPayload, "15m");

    await SessionRepository.updateRefreshTokenById(session.id, refreshToken);
    await TokenRepository.markTokenUsedByToken(token);

    return {
      user,
      refreshToken,
      accessToken,
    };
  }

  static async resendTokenEmailVerification(email: string) {
    if (!email || email === null) {
      throw new AppError(
        "Cannot read properties of undefined (reading 'email')",
        400
      );
    }
    const user = await UserRepository.findUserByEmail(email);
    if (!user) {
      throw new AppError("User not found.", 404);
    }

    if (user.is_verified) {
      throw new AppError("Account has been verified.", 400);
    }

    const token = signTokenEmailVerification(email);
    const one_hour = 60 * 60 * 1000;
    const newTokenData = {
      user_id: user.id,
      token,
      expires_at: new Date(Date.now() + one_hour),
    };

    const createToken = await TokenRepository.createToken(newTokenData);
    await sendVerificationEmail(user.email, user.username, token);

    return createToken;
  }

  static async loginUser(data: LoginProps, deviceInfo: DeviceInfoProps) {
    const errorsValidation = loginValidation.safeParse(data);
    if (!errorsValidation.success) {
      const errors = validationResponses(errorsValidation);
      throw new AppError("Validation failed.", 400, errors);
    }

    const user = await UserRepository.findUserByEmail(data.email);
    if (!user) {
      throw new AppError("Email / Password incorrect.", 400);
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
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

    const session = await SessionRepository.createOrUpdateSession({
      user_id: user.id,
      device_hash: deviceInfo.deviceHash,
      refresh_token: "",
      user_agent: deviceInfo.userAgent,
      ip_address: deviceInfo.ip,
    });

    const JwtPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role.name,
      tokenVersion: session.token_version,
      sessionId: session.id,
      deviceHash: deviceInfo.deviceHash,
    };

    const accessToken = signAccessToken(JwtPayload, "15m");
    const refreshToken = signRefreshToken(JwtPayload, "7d");

    await SessionRepository.updateRefreshTokenById(session.id, refreshToken);

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      accessToken,
      refreshToken,
    };
  }

  static async logoutUser(data: VerifyAccessTokenProps) {
    if (!data || !data.id || !data.sessionId) {
      throw new AppError("Invalid user session.", 401);
    }

    const user = await UserRepository.findUserById(data.id);
    if (!user) {
      throw new AppError("User not found.", 404);
    }

    await SessionRepository.updateRefreshTokenById(data.sessionId, null);
    await SessionRepository.incrementTokenVersionById(data.sessionId);

    return;
  }

  static async refreshToken(
    currentUser: UserRefreshTokenProps,
    currentRefreshToken: string
  ) {
    if (!currentUser.id || !currentRefreshToken || !currentUser.sessionId) {
      throw new AppError("Unauthorized access: missing user or token", 401);
    }

    const user = await UserRepository.findUserById(currentUser.id);
    if (!user) {
      throw new AppError("user not found.", 404);
    }

    const userSession = user.Session.find(
      (s) =>
        s.id === currentUser.sessionId &&
        s.refresh_token === currentRefreshToken
    );
    if (!userSession) {
      throw new AppError("Refresh token missmatch", 401);
    }

    const updateSession = await SessionRepository.incrementTokenVersionById(
      userSession.id
    );

    const newAccessToken = signAccessToken(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role.name,
        tokenVersion: updateSession.token_version,
        sessionId: updateSession.id,
        deviceHash: userSession.device_hash,
      },
      "15m"
    );

    return { newAccessToken };
  }
}
