import { Prisma, Token } from "@prisma/client";
import { prisma } from "../libs/prisma";
import { CreateToken } from "../types/token.type";

export default class TokenRepository {
  static async createTokenTx(tx: Prisma.TransactionClient, data: CreateToken) {
    return tx.token.create({
      data: {
        token: data.token,
        user_id: data.user_id,
        status: data.status,
        type: data.type,
        expired_at: data.expired_at,
      },
    });
  }

  static async findManyByUserId(user_id: string) {
    return await prisma.token.findMany({
      where: { user_id },
    });
  }

  static async markStatusTokensExpired(now: Date) {
    return prisma.token.updateMany({
      where: {
        status: "ACTIVE",
        expired_at: { lt: now },
      },
      data: {
        status: "EXPIRED",
      },
    });
  }

  static async deleteTokensExpiredAndUsed(cleanupThreshold: Date) {
    return prisma.token.deleteMany({
      where: {
        status: { in: ["EXPIRED", "USED"] },
        expired_at: { lt: cleanupThreshold },
      },
    });
  }

  static async deleteById(id: string) {
    return prisma.token.delete({ where: { id } });
  }

  static async findByToken(token: string): Promise<Token | null> {
    return prisma.token.findUnique({ where: { token } });
  }

  static async markStatusByToken(
    token: string,
    status: Token["status"]
  ): Promise<Token> {
    return prisma.token.update({
      where: { token },
      data: { status },
    });
  }

  static async markStatusByTokenTx(
    tx: Prisma.TransactionClient,
    token: string,
    status: Token["status"]
  ): Promise<Token> {
    return tx.token.update({
      where: { token },
      data: { status },
    });
  }

  static async markAllTokensToExpiredByUserId(
    tx: Prisma.TransactionClient,
    user_id: string
  ) {
    return tx.token.updateMany({
      where: { user_id },
      data: {
        status: "EXPIRED",
      },
    });
  }
}
