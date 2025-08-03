import { prisma } from "../libs/prisma";

export default class RoleRepository {
  static async findRoleByName(name: string) {
    return prisma.role.findUnique({ where: { name } });
  }
}
