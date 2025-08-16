import RoleRepository from "../repositories/role.repository";
import { AppError } from "../utils/errors";

export default class RoleService {
  static async addRole(name: string) {
    if (!name || name === "") {
      throw new AppError("Role name is required.");
    }
    const role = await RoleRepository.createRole(name);
    return role;
  }

  static async getRoleByName(name: string) {
    const role = await RoleRepository.findRoleByName(name);
    return role;
  }
}
