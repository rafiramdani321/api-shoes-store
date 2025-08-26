import { Prisma } from "@prisma/client";
import { prisma } from "../libs/prisma";
import {
  RoleAllowedSortBy,
  RoleCreateType,
  RoleSortOrder,
  RoleUpdateType,
} from "../types/role.type";

export default class RoleRepository {
  static async findRoles(
    page: number,
    limit: number,
    search?: string,
    sortBy?: RoleAllowedSortBy,
    sortOrder: RoleSortOrder = "desc"
  ) {
    const skip = (page - 1) * limit;

    let where: Prisma.RoleWhereInput = {};
    if (search) {
      where = {
        name: { contains: search, mode: Prisma.QueryMode.insensitive },
      };
    }

    const orderBy: Prisma.RoleOrderByWithRelationInput = sortBy
      ? { [sortBy]: sortOrder }
      : { created_at: "desc" };

    const [data, total] = await Promise.all([
      prisma.role.findMany({
        skip,
        take: limit,
        where,
        orderBy,
      }),
      prisma.role.count({ where }),
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

  static async findRoleById(id: string) {
    return prisma.role.findUnique({ where: { id } });
  }

  static async findRoleByName(name: string) {
    return prisma.role.findUnique({ where: { name } });
  }

  static async createRole(data: RoleCreateType) {
    return prisma.role.create({
      data: { name: data.name, created_by: data.created_by },
    });
  }

  static async updateRoleById(data: RoleUpdateType) {
    return prisma.role.update({
      where: { id: data.id },
      data: {
        name: data.name,
        updated_by: data.updated_by,
      },
    });
  }

  static async deleteRoleById(id: string) {
    return prisma.role.delete({ where: { id } });
  }

  static async deleteRoleManyByIds(ids: string[]) {
    return prisma.role.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
