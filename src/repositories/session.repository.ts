import { Prisma } from "@prisma/client";
import { prisma } from "../libs/prisma";
import { createOrUpdateSessionProps } from "../types/session.type";

export default class SessionRepository {
  static async createOrUpdate(data: createOrUpdateSessionProps) {
    return prisma.session.upsert({
      where: {
        user_id_device_hash: {
          user_id: data.user_id,
          device_hash: data.device_hash,
        },
      },
      update: {
        refresh_token: data.refresh_token,
        ip_address: data.ip_address,
        user_agent: data.user_agent,
      },
      create: {
        user_id: data.user_id,
        refresh_token: data.refresh_token,
        user_agent: data.user_agent,
        ip_address: data.ip_address,
        device_hash: data.device_hash,
      },
    });
  }

  static async createOrUpdateTx(
    tx: Prisma.TransactionClient,
    data: createOrUpdateSessionProps
  ) {
    return tx.session.upsert({
      where: {
        user_id_device_hash: {
          user_id: data.user_id,
          device_hash: data.device_hash,
        },
      },
      update: {
        refresh_token: data.refresh_token,
        ip_address: data.ip_address,
        user_agent: data.user_agent,
      },
      create: {
        user_id: data.user_id,
        refresh_token: data.refresh_token,
        user_agent: data.user_agent,
        ip_address: data.ip_address,
        device_hash: data.device_hash,
      },
    });
  }

  static async findSessionsByUserId(userId: string) {
    return prisma.session.findMany({
      where: {
        user_id: userId,
      },
    });
  }

  static async findSessionById(id: string) {
    return prisma.session.findUnique({
      where: { id },
    });
  }

  static async updateRefreshTokenById(id: string, refreshToken: string | null) {
    return prisma.session.update({
      where: { id },
      data: { refresh_token: refreshToken },
    });
  }

  static async updateRefreshTokenByIdTx(
    tx: Prisma.TransactionClient,
    id: string,
    refreshToken: string | null
  ) {
    return tx.session.update({
      where: { id },
      data: { refresh_token: refreshToken },
    });
  }

  static async incrementTokenVersionById(id: string) {
    return prisma.session.update({
      where: { id },
      data: {
        token_version: { increment: 1 },
      },
    });
  }

  static async incrementTokenVersionByIdTx(
    tx: Prisma.TransactionClient,
    id: string
  ) {
    return tx.session.update({
      where: { id },
      data: {
        token_version: { increment: 1 },
      },
    });
  }

  static async deleteAllSessionByUserIdTx(
    tx: Prisma.TransactionClient,
    userId: string
  ) {
    return tx.session.deleteMany({
      where: {
        user_id: userId,
      },
    });
  }
}
