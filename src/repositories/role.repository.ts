import { Prisma } from "@prisma/client";
import { prisma } from "../libs/prisma";
import {
  PermissionAllowedSearchBy,
  PermissionAllowedSortBy,
  PermissionSortOrder,
  RoleAllowedSortBy,
  RoleCreateType,
  RolePermissionAllowedSearchBy,
  RolePermissionAllowedSortBy,
  RolePermissionCreateType,
  RolePermissionSortOrder,
  RolePermissionUpdateType,
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

  static async findPermissions(
    page: number,
    limit: number,
    searchBy?: PermissionAllowedSearchBy,
    search?: string,
    sortBy?: PermissionAllowedSortBy,
    sortOrder: PermissionSortOrder = "desc"
  ) {
    const skip = (page - 1) * limit;

    let where: Prisma.PermissionWhereInput = {};

    if (search) {
      if (searchBy) {
        where = {
          [searchBy]: { contains: search, mode: Prisma.QueryMode.insensitive },
        };
      } else {
        where = {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            {
              module: { contains: search, mode: Prisma.QueryMode.insensitive },
            },
          ],
        };
      }
    }

    const orderBy: Prisma.PermissionOrderByWithRelationInput = sortBy
      ? { [sortBy]: sortOrder }
      : { created_at: "desc" };

    const [data, total] = await Promise.all([
      prisma.permission.findMany({
        skip,
        take: limit,
        where,
        orderBy,
      }),
      prisma.permission.count({ where }),
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

  static async findRolePermissions(
    page: number,
    limit: number,
    searchBy?: RolePermissionAllowedSearchBy,
    search?: string,
    sortBy?: RolePermissionAllowedSortBy,
    sortOrder: RolePermissionSortOrder = "desc"
  ) {
    const skip = (page - 1) * limit;

    let where: Prisma.RolePermissionWhereInput = {};

    if (search) {
      if (searchBy) {
        if (searchBy === "role_name") {
          where = {
            role: {
              name: { contains: search, mode: Prisma.QueryMode.insensitive },
            },
          };
        } else if (searchBy === "permission_name") {
          where = {
            permission: {
              name: { contains: search, mode: Prisma.QueryMode.insensitive },
            },
          };
        } else if (searchBy === "permission_module") {
          where = {
            permission: {
              module: { contains: search, mode: Prisma.QueryMode.insensitive },
            },
          };
        }
      } else {
        where = {
          OR: [
            {
              role: {
                name: { contains: search, mode: Prisma.QueryMode.insensitive },
              },
            },
            {
              permission: {
                name: { contains: search, mode: Prisma.QueryMode.insensitive },
              },
            },
            {
              permission: {
                module: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            },
          ],
        };
      }
    }

    let orderBy: Prisma.RolePermissionOrderByWithRelationInput;
    if (sortBy === "role_name") {
      orderBy = {
        role: {
          name: sortOrder,
        },
      };
    } else if (sortBy === "permission_name") {
      orderBy = {
        permission: {
          name: sortOrder,
        },
      };
    } else if (sortBy === "permission_module") {
      orderBy = {
        permission: {
          module: sortOrder,
        },
      };
    } else if (sortBy) {
      orderBy = {
        [sortBy]: sortOrder,
      };
    } else {
      orderBy = { created_at: "desc" };
    }

    const [data, total] = await Promise.all([
      prisma.rolePermission.findMany({
        skip,
        take: limit,
        where,
        orderBy,
        include: {
          role: true,
          permission: true,
        },
      }),
      prisma.rolePermission.count({ where }),
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

  static async findRolePermissionById(id: string) {
    return prisma.rolePermission.findUnique({
      where: {
        id,
      },
      include: {
        permission: true,
        role: true,
      },
    });
  }

  static async findRolePermissionByRoleIdAndPermissionId(
    role_id: string,
    permission_id: string
  ) {
    return prisma.rolePermission.findUnique({
      where: {
        role_id_permission_id: {
          role_id,
          permission_id,
        },
      },
    });
  }

  static async addRolePermission(data: RolePermissionCreateType) {
    return prisma.rolePermission.create({
      data: {
        role_id: data.role_id,
        permission_id: data.permission_id,
      },
    });
  }

  static async updateRolePermission(data: RolePermissionUpdateType) {
    return prisma.rolePermission.update({
      where: { id: data.id },
      data: {
        role_id: data.role_id,
        permission_id: data.permission_id,
      },
    });
  }

  static async deleteRolePermission(id: string) {
    return prisma.rolePermission.delete({ where: { id } });
  }

  static async deleteManyRolePermission(ids: string[]) {
    return prisma.rolePermission.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
