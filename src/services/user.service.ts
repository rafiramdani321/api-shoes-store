import { env } from "../constants/env";
import ms from "ms";
import UserRepository from "../repositories/user.repository";
import {
  GetUserQueryBase,
  UserAllowedSearchBy,
  UserAllowedSortBy,
  UserSortOrder,
  UserUpdate,
} from "../types/user.type";
import { AppError } from "../utils/errors";
import {
  deleteFileFromUploadthingByFileId,
  uploadFilesToUploadThing,
} from "../utils/uploadthing";
import { validationResponses } from "../validations/index.validation";
import {
  changeMyPasswordValidation,
  setPasswordValidation,
  updateEmailMeValidation,
  updateMe,
} from "../validations/validation-schema";
import TokenRepository from "../repositories/token.repository";
import {
  signEmailVerificationToken,
  verifyEmailVerificationToken,
} from "../utils/emailVerificationToken";
import { sendVerificationEmail } from "./mail.service";
import { prisma } from "../libs/prisma";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { generateDeviceHash } from "../utils/generateDeviceHash";
import SessionRepository from "../repositories/session.repository";
import { signAccessToken } from "../utils/accessToken";
import { signRefreshToken } from "../utils/refreshToken";
import { comparePassword, hashPassword } from "../utils/hash";

export default class UserService {
  static async getUsers(query: GetUserQueryBase) {
    const page =
      query.page && query.page.trim() !== ""
        ? Math.max(parseInt(query.page), 1)
        : 1;

    const limit =
      query.limit && query.limit.trim() !== ""
        ? Math.max(parseInt(query.limit), 1)
        : 10;

    const search = query.search?.toString();

    const allowedSearchBy: UserAllowedSearchBy[] = [
      "username",
      "fullname",
      "email",
    ];
    const searchBy = allowedSearchBy.includes(
      query.searchBy as UserAllowedSearchBy
    )
      ? (query.searchBy as UserAllowedSearchBy)
      : undefined;

    const allowedSortBy: UserAllowedSortBy[] = [
      "username",
      "fullname",
      "email",
      "created_at",
      "updated_at",
    ];
    const sortBy = allowedSortBy.includes(query.sortBy as UserAllowedSortBy)
      ? (query.sortBy as UserAllowedSortBy)
      : undefined;

    const rawOrder = query.sortOrder?.toLocaleLowerCase();
    const sortOrder: UserSortOrder = rawOrder === "asc" ? "asc" : "desc";

    return await UserRepository.findUsers(
      page,
      limit,
      searchBy,
      search,
      sortBy,
      sortOrder
    );
  }

  static async getById(id: string) {
    if (!id || id === null) {
      throw new AppError("Id user is required.", 400);
    }

    const user = await UserRepository.findById(id);
    if (!user) {
      throw new AppError("User not found.", 404);
    }

    return user;
  }

  static async getByEmail(email: string) {
    if (!email || email === null) {
      throw new AppError("Email is required.", 400);
    }

    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new AppError("User not found.", 404);
    }

    return user;
  }

  static async updateMe(data: UserUpdate) {
    const errorsValidation = updateMe.safeParse(data);
    if (!errorsValidation.success) {
      const errors = validationResponses(errorsValidation);
      throw new AppError("Validation failed.", 400, errors);
    }

    await this.getById(data.id);

    const [existingUsername, existingPhoneNumber] = await Promise.all([
      UserRepository.findByUsername(data.username),
      UserRepository.findByPhoneNumber(data.phone_number),
    ]);
    const dbErrors: { field: keyof UserUpdate; message: string }[] = [];

    if (existingUsername && existingUsername.id !== data.id) {
      dbErrors.push({ field: "username", message: "Username already exist." });
    }
    if (existingPhoneNumber && existingPhoneNumber.id !== data.id) {
      dbErrors.push({
        field: "phone_number",
        message: "Phone number already taken.",
      });
    }

    if (dbErrors.length > 0) {
      throw new AppError("Validation failed.", 400, dbErrors);
    }

    const newData: UserUpdate = {
      ...data,
      date_of_birth: data.date_of_birth
        ? new Date(data.date_of_birth)
        : undefined,
    };
    const update = await UserRepository.updateUserById(newData);
    const { password, ...safeUser } = update;
    return safeUser;
  }

  static async updateMeImageProfile(data: {
    userId: string;
    files: Express.Multer.File[];
  }) {
    if (!data.userId) {
      throw new AppError("User id is required.", 404);
    }

    const user = await this.getById(data.userId);
    const oldFileId = user.image_file_id;

    if (data.files.length < 0 || data.files.length !== 1) {
      throw new AppError("Image not found", 404);
    }

    const file = data.files[0];

    if (file.size > 4 * 1024 * 1024) {
      throw new AppError("Each image must be <= 4MB", 400);
    }

    if (
      !["image/jpg", "image/jpeg", "image/png", "image/webp"].includes(
        file.mimetype
      )
    ) {
      throw new AppError("Only JPG, PNG, WEBP allowed.", 400);
    }

    let uploaded;
    try {
      uploaded = await uploadFilesToUploadThing([file]);
    } catch (error) {
      throw new AppError("Failed to upload image.", 500);
    }

    const newFileId = uploaded[0].fileId;
    const newUrl = uploaded[0].url;

    try {
      await UserRepository.updateImageProfile({
        user_id: data.userId,
        image: {
          url: newUrl,
          fileId: newFileId,
        },
      });
    } catch (error) {
      await deleteFileFromUploadthingByFileId(newFileId);
      throw new AppError("Failed to update profile image.", 500);
    }

    if (oldFileId) {
      await deleteFileFromUploadthingByFileId(oldFileId).catch(() => {
        console.error("Failed to delete old profile image.", oldFileId);
      });
    }

    return {
      url: newUrl,
      fileId: newFileId,
    };
  }

  static async deleteImageProfile(userId: string) {
    if (!userId || userId === "") {
      throw new AppError("User id is required.", 404);
    }

    const user = await this.getById(userId);
    const oldFileId = user.image_file_id;
    const default_image = env.IMAGE_DEFAULT_USER;

    try {
      await UserRepository.deleteImageProfileByUserId(user.id, default_image);
    } catch (error) {
      throw new AppError("Failed to delete image profle.", 500);
    }

    if (oldFileId) {
      await deleteFileFromUploadthingByFileId(oldFileId).catch(() => {
        console.error("Failed to delete old profile image.", oldFileId);
      });
    }

    return true;
  }

  static async updateEmailMe(data: { email: string; user_id: string }) {
    const validation = updateEmailMeValidation.safeParse(data);
    if (!validation.success) {
      throw new AppError(
        "Validation failed.",
        400,
        validationResponses(validation)
      );
    }

    const existingEmail = await UserRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new AppError("Email already registered.", 400);
    }

    const expiresInMs = ms(
      env.EMAIL_TOKEN_VERIFICATION_EXPIRES_IN as ms.StringValue
    );

    const { user, token } = await prisma.$transaction(async (tx) => {
      const user = await UserRepository.updateNewPendingEmailByUserIdTx(
        tx,
        data.user_id,
        data.email
      );

      const token = await TokenRepository.createToken({
        token: signEmailVerificationToken(data.email),
        user_id: data.user_id,
        status: "ACTIVE",
        type: "EMAIL_ACTIVATION",
        expired_at: new Date(Date.now() + expiresInMs),
      });

      return { user, token };
    });

    try {
      const url = `${env.FRONTEND_PUBLIC_BASE_URL}/verify-new-email/${token.token}`;
      await sendVerificationEmail(data.email, user.username, url);
    } catch (error) {
      await TokenRepository.deleteById(token.id);
      await UserRepository.updateNewPendingEmailByUserId(user.id, null);
      throw new AppError(
        "Failed to send verification email. Please try again later. TY",
        500
      );
    }

    return true;
  }

  static async verifyNewEmailActivation(
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
      throw new AppError("Invalid link. Please check your URL.", 400);
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
      await UserRepository.updateNewPendingEmailByUserId(
        existingToken.user_id,
        null
      );
      throw new AppError(
        "Token has expired. Please request new update email.",
        400
      );
    }

    if (existingToken.status === "EXPIRED") {
      throw new AppError("Token has expired. Please request new update email.");
    }

    try {
      payload = verifyEmailVerificationToken(token);
    } catch (innerError) {
      if (innerError instanceof TokenExpiredError) {
        await UserRepository.updateNewPendingEmailByUserId(
          existingToken.user_id,
          null
        );
        await TokenRepository.markStatusByToken(token, "EXPIRED");
        throw new AppError("Token has expired (JWT Expired).", 400);
      } else if (innerError instanceof JsonWebTokenError) {
        throw new AppError("Invalid Token (JWT Broken).", 400);
      } else {
        throw new AppError("An error onccured with the token.", 500);
      }
    }

    const user = await this.getById(existingToken.user_id);

    const currentSession = await SessionRepository.findSessionsByUserId(
      user.id
    );
    if (currentSession.length === 0) {
      throw new AppError("Sessions not found.", 404);
    }

    const deviceHash = generateDeviceHash(ip, userAgent);

    const { accessToken, refreshToken } = await prisma.$transaction(
      async (tx) => {
        await SessionRepository.deleteAllSessionByUserIdTx(tx, user.id);
        await UserRepository.updateEmailMeByUserIdTx(
          tx,
          user.id,
          payload.email
        );

        const createNewSession = await SessionRepository.createOrUpdateTx(tx, {
          user_id: user.id,
          refresh_token: "",
          user_agent: userAgent,
          ip_address: ip,
          device_hash: deviceHash,
        });

        const JwtPayload = {
          user_id: user.id,
          email: payload.email,
          username: user.username,
          role: user.role.name,
          token_version: createNewSession.token_version,
          session_id: createNewSession.id,
          device_hash: deviceHash,
        };

        const accessToken = signAccessToken(JwtPayload);
        const refreshToken = signRefreshToken(JwtPayload);

        await SessionRepository.updateRefreshTokenByIdTx(
          tx,
          createNewSession.id,
          refreshToken
        );
        await TokenRepository.markStatusByTokenTx(tx, token, "USED");

        return { accessToken, refreshToken };
      }
    );

    const updateUser = await this.getById(user.id);

    return {
      user: updateUser,
      refreshToken,
      accessToken,
    };
  }

  static async setMyPassword(data: {
    userId: string;
    password: string;
    confirmPassword: string;
  }) {
    const { userId, password } = data;

    if (!userId || userId === null) {
      throw new AppError("Unathorized.", 401);
    }

    const validation = setPasswordValidation.safeParse(data);
    if (!validation.success) {
      throw new AppError(
        "Validation failed.",
        400,
        validationResponses(validation)
      );
    }

    const oldUser = await this.getById(userId);
    if (oldUser.password) {
      throw new AppError("Password already exists.", 400);
    }
    if (oldUser.auth_provider !== "google") {
      throw new AppError("Invalid auth provider.", 400);
    }

    const hashedPassword = password ? await hashPassword(password) : null;
    if (!hashedPassword) {
      throw new AppError("Something went wrong. Please try again later.", 500);
    }

    const { user } = await prisma.$transaction(async (tx) => {
      const user = await UserRepository.setMyPasswordByUserIdTx(
        tx,
        hashedPassword,
        userId
      );

      await SessionRepository.deleteAllSessionByUserIdTx(tx, userId);

      return { user };
    });

    return user;
  }

  static async changeMyPassword(data: {
    userId: string;
    oldPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) {
    const { userId, oldPassword, newPassword, confirmNewPassword } = data;

    if (!userId || userId === null) {
      throw new AppError("Unauthorized.", 401);
    }

    const validation = changeMyPasswordValidation.safeParse(data);
    if (!validation.success) {
      throw new AppError(
        "Validation failed.",
        400,
        validationResponses(validation)
      );
    }

    const existUser = await this.getById(userId);
    if (!existUser.password) {
      throw new AppError("This account is linked with Google Login.");
    }

    const isValidOldPassword = await comparePassword(
      oldPassword,
      existUser.password
    );
    if (!isValidOldPassword) {
      await new Promise((res) => setTimeout(res, 200));
      throw new AppError("Old password incorrect.", 400);
    }

    const hashedNewPassword = newPassword
      ? await hashPassword(newPassword)
      : null;

    if (!hashedNewPassword) {
      throw new AppError("Something went wrong. Please try again later.", 500);
    }

    const { user } = await prisma.$transaction(async (tx) => {
      const user = await UserRepository.changePasswordByUserIdTx(
        tx,
        existUser.id,
        hashedNewPassword
      );

      await SessionRepository.deleteAllSessionByUserIdTx(tx, user.id);

      return { user };
    });

    return user;
  }
}
