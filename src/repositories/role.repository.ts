import { prisma } from "../libs/prisma";

export default class RoleRepository {
  static async createRole(name: string) {
    return prisma.role.create({ data: { name } });
  }

  static async findRoleByName(name: string) {
    return prisma.role.findUnique({ where: { name } });
  }
}
