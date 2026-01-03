import { Prisma } from "@prisma/client";
import { prisma } from "../libs/prisma";
import {
  CreateShippingAddress,
  UpdateShippingAddress,
} from "../types/shippingAddress.type";

export default class ShippingAddressRepository {
  static async findAllShippingAddressByUserId(user_id: string) {
    return prisma.userAddresses.findMany({
      where: { user_id },
      orderBy: [{ is_primary: "desc" }, { created_at: "desc" }],
    });
  }

  static async createShippingAddressByUserIdTx(
    tx: Prisma.TransactionClient,
    data: CreateShippingAddress
  ) {
    return tx.userAddresses.create({
      data: {
        user_id: data.user_id,
        recipent_name: data.recipent_name,
        label_address: data.label_address,
        phone_number_recipent: data.phone_number_recipent,
        address: data.address,
        province_id: data.province_id,
        province_name: data.province_name,
        city_id: data.city_id,
        city_name: data.city_name,
        postal_code: data.postal_code,
        is_primary: data.is_primary,
      },
    });
  }

  static async updateShippingAddressByIdAndUserIdTx(
    tx: Prisma.TransactionClient,
    data: UpdateShippingAddress
  ) {
    return tx.userAddresses.update({
      where: { id: data.id, user_id: data.user_id },
      data: {
        user_id: data.user_id,
        recipent_name: data.recipent_name,
        label_address: data.label_address,
        phone_number_recipent: data.phone_number_recipent,
        address: data.address,
        province_id: data.province_id,
        province_name: data.province_name,
        city_id: data.city_id,
        city_name: data.city_name,
        postal_code: data.postal_code,
        is_primary: data.is_primary,
      },
    });
  }

  static async deleteByIdAndUserIdTx(
    tx: Prisma.TransactionClient,
    id: string,
    user_id: string
  ) {
    return tx.userAddresses.delete({
      where: { id, user_id },
    });
  }

  static async resetIsPrimaryByUserIdTx(
    tx: Prisma.TransactionClient,
    user_id: string
  ) {
    return tx.userAddresses.updateMany({
      where: { user_id, is_primary: true },
      data: { is_primary: false },
    });
  }

  static async findByIdAndUserId(id: string, user_id: string) {
    return prisma.userAddresses.findFirst({
      where: { id, user_id },
    });
  }

  static async findAnyByUserIdTx(
    tx: Prisma.TransactionClient,
    user_id: string
  ) {
    return tx.userAddresses.findFirst({ where: { user_id } });
  }

  static async setPrimaryToTrueByIdTx(
    tx: Prisma.TransactionClient,
    id: string
  ) {
    return tx.userAddresses.update({
      where: { id },
      data: { is_primary: true },
    });
  }
}
