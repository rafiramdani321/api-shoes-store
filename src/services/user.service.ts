import UserRepository from "../repositories/user.repository";
import { AppError } from "../utils/errors";

export default class UserService {
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
}
