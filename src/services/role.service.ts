import RoleRepository from "../repositories/role.repository";

export default class RoleService {
  static async getRoleByName(name: string) {
    const role = await RoleRepository.findRoleByName(name);
    return role;
  }
}
