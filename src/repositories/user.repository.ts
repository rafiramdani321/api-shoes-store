import { Prisma } from "@prisma/client";
import { prisma } from "../libs/prisma";
import { CreateUserInput } from "../types/auth.type";
import {
  UserAllowedSearchBy,
  UserAllowedSortBy,
  UserSortOrder,
  UserUpdate,
} from "../types/user.type";

export default class UserRepository {
  static async findUsers(
    page: number,
    limit: number,
    searchBy?: UserAllowedSearchBy,
    search?: string,
    sortBy?: UserAllowedSortBy,
    sortOrder: UserSortOrder = "desc"
  ) {
    const skip = (page - 1) * limit;

    let where: Prisma.UserWhereInput = {};

    if (search) {
      if (searchBy) {
        where = {
          [searchBy]: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        };
      } else {
        where = {
          OR: [
            {
              username: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              fullname: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              email: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        };
      }
    }

    const orderBy: Prisma.UserOrderByWithRelationInput = sortBy
      ? { [sortBy]: sortOrder }
      : { created_at: "desc" };

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        where,
        orderBy,
        include: {
          role: true,
          Session: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async createUser(data: CreateUserInput) {
    return prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: data.password ?? null,
        role_id: data.role_id ?? "",
        image_url: data.image_url ?? null,
        is_verified: data.is_verified ?? false,
        google_id: data.google_id,
        auth_provider: data.auth_provider,
      },
      include: {
        role: {
          include: {
            RolePermission: {
              include: { permission: true },
            },
          },
        },
      },
    });
  }

  static async createUserTx(
    tx: Prisma.TransactionClient,
    data: CreateUserInput
  ) {
    return tx.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: data.password ?? null,
        role_id: data.role_id ?? "",
        image_url: data.image_url ?? null,
        is_verified: data.is_verified ?? false,
        google_id: data.google_id,
        auth_provider: data.auth_provider,
      },
      include: {
        role: {
          include: {
            RolePermission: {
              include: { permission: true },
            },
          },
        },
      },
    });
  }

  static async updateUserById(data: UserUpdate) {
    return prisma.user.update({
      where: { id: data.id },
      data: {
        username: data.username,
        fullname: data.fullname,
        gender: data.gender,
        phone_number: data.phone_number,
        date_of_birth: data.date_of_birth,
      },
    });
  }

  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          include: {
            RolePermission: {
              include: {
                permission: true,
              },
            },
          },
        },
        Session: true,
        Cart: true,
      },
    });
  }

  static async findByUsername(username: string) {
    return prisma.user.findUnique({ where: { username } });
  }

  static async findByPhoneNumber(phoneNumber: string) {
    return await prisma.user.findUnique({
      where: { phone_number: phoneNumber },
    });
  }

  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            RolePermission: {
              include: { permission: true },
            },
          },
        },
      },
    });
  }

  static async updateIsVerifiedByEmail(email: string, is_verified: boolean) {
    return prisma.user.update({
      where: { email },
      data: { is_verified },
      include: {
        role: {
          include: {
            RolePermission: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });
  }

  static async updateIsVerifiedByEmailTx(
    tx: Prisma.TransactionClient,
    email: string,
    is_verified: boolean
  ) {
    return tx.user.update({
      where: { email },
      data: { is_verified },
      include: {
        role: {
          include: {
            RolePermission: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });
  }

  static async deleteById(id: string) {
    return prisma.user.delete({ where: { id } });
  }

  static async updateImageProfile(data: {
    user_id: string;
    image: {
      url: string;
      fileId: string;
    };
  }) {
    return prisma.user.update({
      where: { id: data.user_id },
      data: {
        image_url: data.image.url,
        image_file_id: data.image.fileId,
      },
    });
  }

  static async deleteImageProfileByUserId(user_id: string, image_url: string) {
    return prisma.user.update({
      where: { id: user_id },
      data: {
        image_url,
        image_file_id: null,
      },
    });
  }

  static async updateNewPendingEmailByUserId(
    userId: string,
    newEmail: string | null
  ) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        pending_new_email: newEmail,
      },
    });
  }

  static async updateNewPendingEmailByUserIdTx(
    tx: Prisma.TransactionClient,
    userId: string,
    newEmail: string | null
  ) {
    return tx.user.update({
      where: { id: userId },
      data: {
        pending_new_email: newEmail,
      },
    });
  }

  static async updateEmailMeByUserIdTx(
    tx: Prisma.TransactionClient,
    userId: string,
    newEmail: string
  ) {
    return tx.user.update({
      where: { id: userId },
      data: {
        email: newEmail,
        pending_new_email: null,
      },
    });
  }

  static async setMyPasswordByUserIdTx(
    tx: Prisma.TransactionClient,
    password: string,
    userId: string
  ) {
    return tx.user.update({
      where: { id: userId },
      data: {
        password,
      },
      include: {
        role: true,
      },
    });
  }

  static async changePasswordByUserIdTx(
    tx: Prisma.TransactionClient,
    userId: string,
    newPassword: string
  ) {
    return tx.user.update({
      where: { id: userId },
      data: {
        password: newPassword,
      },
    });
  }
}
