import { prisma } from "../libs/prisma";
import { createTokenProps } from "../types/token.type";

export default class TokenRepository {
  static async createToken(data: createTokenProps) {
    return prisma.tokenVerification.create({
      data: {
        token: data.token,
        user_id: data.user_id,
        expires_at: data.expires_at,
      },
    });
  }

  static async findTokensByUserId(user_id: string) {
    return await prisma.tokenVerification.findMany({
      where: { user_id },
    });
  }

  static async markStatusTokensExpired(now: Date) {
    return prisma.tokenVerification.updateMany({
      where: {
        status: "ACTIVE",
        expires_at: { lt: now },
      },
      data: {
        status: "EXPIRED",
      },
    });
  }

  static async deleteTokensExpiredAndUsed(cleanupThreshold: Date) {
    return prisma.tokenVerification.deleteMany({
      where: {
        status: { in: ["EXPIRED", "USED"] },
        expires_at: { lt: cleanupThreshold },
      },
    });
  }

  static async findTokenByToken(token: string) {
    return prisma.tokenVerification.findUnique({ where: { token } });
  }

  static async markTokenUsedByToken(token: string) {
    return prisma.tokenVerification.update({
      where: { token },
      data: { status: "USED" },
    });
  }

  static async markTokenExpiredByToken(token: string) {
    return prisma.tokenVerification.update({
      where: { token },
      data: { status: "EXPIRED" },
    });
  }

  static async markAllTokensToExpiredByUserId(user_id: string) {
    return prisma.tokenVerification.updateMany({
      where: { user_id },
      data: {
        status: "EXPIRED",
      },
    });
  }
}
