import { add } from "winston";
import { prisma } from "../libs/prisma";
import ShippingAddressRepository from "../repositories/shippingAddress.repository";
import {
  CreateShippingAddress,
  UpdateShippingAddress,
} from "../types/shippingAddress.type";
import { AppError } from "../utils/errors";
import { validationResponses } from "../validations/index.validation";
import { createOrUpdateShippingAddressValidation } from "../validations/validation-schema";
import UserService from "./user.service";

export default class ShippingAddressService {
  static async getShippingAddress(user_id: string) {
    const user = await UserService.getById(user_id);

    const shippingAddress =
      await ShippingAddressRepository.findAllShippingAddressByUserId(user.id);
    return shippingAddress;
  }

  static async getByIdAndUserId(id: string, user_id: string) {
    const address = await ShippingAddressRepository.findByIdAndUserId(
      id,
      user_id
    );
    if (!address) {
      throw new AppError("Shipping address not found.", 404);
    }

    return address;
  }

  static async addShippingAddress(data: CreateShippingAddress) {
    if (!data.user_id) {
      throw new AppError("Unauthorized.", 401);
    }

    const errorsValidation =
      createOrUpdateShippingAddressValidation.safeParse(data);
    if (!errorsValidation.success) {
      const errors = validationResponses(errorsValidation);
      throw new AppError("Validation failed.", 400, errors);
    }

    const user = await UserService.getById(data.user_id);

    if (user.userAddresses.length >= 3) {
      throw new AppError("you can only add a maximum of 3 addresses", 400);
    }

    const isFirstAddress = user.userAddresses.length === 0;
    const isPrimaryFinal = isFirstAddress ? true : Boolean(data.is_primary);

    return await prisma.$transaction(async (tx) => {
      if (isPrimaryFinal) {
        await ShippingAddressRepository.resetIsPrimaryByUserIdTx(tx, user.id);
      }

      await ShippingAddressRepository.createShippingAddressByUserIdTx(tx, {
        ...data,
        user_id: user.id,
        is_primary: isPrimaryFinal,
      });
    });
  }

  static async updateShippingAddress(data: UpdateShippingAddress) {
    const errorsValidation =
      createOrUpdateShippingAddressValidation.safeParse(data);
    if (!errorsValidation.success) {
      throw new AppError(
        "Validation failed.",
        400,
        validationResponses(errorsValidation)
      );
    }

    const user = await UserService.getById(data.user_id);

    const address = await this.getByIdAndUserId(data.id, user.id);

    const totalAddress = user.userAddresses.length;
    const isPrimaryRequest = Boolean(data.is_primary);

    let isPrimaryFinal = address.is_primary;

    if (totalAddress === 1) {
      isPrimaryFinal = true;
    } else if (isPrimaryRequest) {
      isPrimaryFinal = true;
    } else if (address.is_primary && isPrimaryRequest === false) {
      throw new AppError("You must have at least one primary address.", 400);
    }

    return await prisma.$transaction(async (tx) => {
      if (isPrimaryFinal) {
        await ShippingAddressRepository.resetIsPrimaryByUserIdTx(tx, user.id);
      }

      await ShippingAddressRepository.updateShippingAddressByIdAndUserIdTx(tx, {
        ...data,
        id: address.id,
        user_id: user.id,
        is_primary: isPrimaryFinal,
      });
    });
  }

  static async deleteShippingAddress(id: string, user_id: string) {
    const user = await UserService.getById(user_id);

    const address = await this.getByIdAndUserId(id, user.id);

    const totalAddresses = user.userAddresses.length;

    if (totalAddresses === 1) {
      throw new AppError("You must at least one shipping address.", 400);
    }

    return prisma.$transaction(async (tx) => {
      await ShippingAddressRepository.deleteByIdAndUserIdTx(
        tx,
        address.id,
        user.id
      );

      if (address.is_primary) {
        const nextPrimary = await ShippingAddressRepository.findAnyByUserIdTx(
          tx,
          user.id
        );

        if (nextPrimary) {
          await ShippingAddressRepository.setPrimaryToTrueByIdTx(
            tx,
            nextPrimary.id
          );
        }
      }
    });
  }

  static async setIsPrimary(id: string, user_id: string) {
    if (!id) {
      throw new AppError("Invalid address id.", 500);
    }

    const user = await UserService.getById(user_id);

    const address = await this.getByIdAndUserId(id, user.id);

    return prisma.$transaction(async (tx) => {
      await ShippingAddressRepository.resetIsPrimaryByUserIdTx(tx, user.id);
      await ShippingAddressRepository.setPrimaryToTrueByIdTx(tx, address.id);
    });
  }
}
