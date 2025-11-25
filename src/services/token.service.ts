import TokenRepository from "../repositories/token.repository";
import { AppError } from "../utils/errors";

export default class TokenService {
  static async getAllTokensByUserId(user_id: string) {
    if (!user_id || user_id === null) {
      throw new AppError("user id is required.", 400);
    }

    const tokens = await TokenRepository.findManyByUserId(user_id);
    if (!tokens || tokens.length === 0) {
      throw new AppError("Tokens not found.", 404);
    }

    return tokens;
  }
}
