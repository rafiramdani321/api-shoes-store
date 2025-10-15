import { prisma } from "../libs/prisma";
import { createUserProps } from "../types/user.type";

export default class UserRepository {
  static async createUser(data: createUserProps) {
    return prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: data.password ?? "",
        role_id: data.role_id,
        image_url: data.image_url ?? "",
        is_verified: data.is_verified ?? false,
        google_id: data.google_id,
        auth_provider: data.auth_provider ?? "local",
      },
      include: {
        role: true,
      },
    });
  }

  static async findUserById(id: string) {
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

  static async findUserByUsername(username: string) {
    return prisma.user.findUnique({ where: { username } });
  }

  static async findUserByEmail(email: string) {
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

  static async updateIsVerifiedByEmail(email: string) {
    return prisma.user.update({
      where: { email },
      data: { is_verified: true },
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
}
