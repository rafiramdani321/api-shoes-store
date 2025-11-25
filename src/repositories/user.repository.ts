import { Prisma } from "@prisma/client";
import { prisma } from "../libs/prisma";
import { CreateUserInput } from "../types/auth.type";

export default class UserRepository {
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
}
