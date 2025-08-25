import SizeRepository from "../repositories/size.repository";
import {
  GetSizeQueryBase,
  SizeAllowedSortBy,
  SizeCreateType,
  SizeSortOrder,
  SizeUpdateType,
} from "../types/size.type";
import { AppError } from "../utils/errors";
import { validationResponses } from "../validations/index.validation";
import { createOrUpdateSizeValidation } from "../validations/validation-schema";

export default class SizeService {
  static async getSizes(query: GetSizeQueryBase) {
    const page =
      query.page && query.page.trim() !== ""
        ? Math.max(parseInt(query.page), 1)
        : 1;

    const limit =
      query.limit && query.limit.trim() !== ""
        ? Math.max(parseInt(query.limit), 1)
        : 10;

    const allowedSortBy: SizeAllowedSortBy[] = [
      "size",
      "created_at",
      "updated_at",
    ];
    const sortBy = allowedSortBy.includes(query.sortBy as SizeAllowedSortBy)
      ? (query.sortBy as SizeAllowedSortBy)
      : undefined;

    const rawOrder = query.sortOrder?.toLocaleLowerCase();
    const sortOrder: SizeSortOrder = rawOrder === "asc" ? "asc" : "desc";

    return await SizeRepository.findSizes(page, limit, sortBy, sortOrder);
  }

  static async getSizeById(id: string) {
    if (!id || id === "") {
      throw new AppError("Id size required");
    }

    return await SizeRepository.findSizeById(id);
  }

  static async addSize(data: SizeCreateType) {
    const errorsValidation = createOrUpdateSizeValidation.safeParse(data);
    if (!errorsValidation.success) {
      const errors = validationResponses(errorsValidation);
      throw new AppError("Validation failed", 400, errors);
    }

    const dbErrors: { field: keyof SizeCreateType; message: string }[] = [];

    const existingSize = await SizeRepository.findSizeBySize(
      data.size.toLowerCase()
    );
    if (existingSize) {
      dbErrors.push({ field: "size", message: "Size already exist." });
    }

    if (dbErrors.length > 0) {
      throw new AppError("Validation failed", 400, dbErrors);
    }

    const newData: SizeCreateType = {
      size: data.size.toLowerCase(),
      created_by: data.created_by,
    };

    return await SizeRepository.createSize(newData);
  }

  static async updateSizeById(data: SizeUpdateType) {
    const errorsValidation = createOrUpdateSizeValidation.safeParse(data);
    if (!errorsValidation.success) {
      const errors = validationResponses(errorsValidation);
      throw new AppError("Validation failed", 400, errors);
    }

    const dbErros: { field: keyof SizeUpdateType; message: string }[] = [];

    const size = await SizeRepository.findSizeById(data.id);
    if (!size) {
      throw new AppError("Size not found", 404);
    }

    const existingSize = await SizeRepository.findSizeBySize(
      data.size.toLowerCase()
    );
    if (existingSize && existingSize.id !== data.id) {
      dbErros.push({ field: "size", message: "Size already exist" });
    }

    if (dbErros.length > 0) {
      throw new AppError("Validation failed", 400, dbErros);
    }

    const newData: SizeUpdateType = {
      id: data.id,
      size: data.size,
      updated_by: data.updated_by,
    };

    return await SizeRepository.updateSize(newData);
  }

  static async deleteSizeById(id: string) {
    if (!id || id === "") {
      throw new AppError("id size not found", 404);
    }

    const size = await SizeRepository.findSizeById(id);
    if (!size) {
      throw new AppError("Size not found", 404);
    }

    return await SizeRepository.deleteSizeById(id);
  }

  static async deleteManySizeByIds(ids: string[]) {
    if (ids.length < 0) {
      throw new AppError("Data sizes ids not found", 404);
    }

    return await SizeRepository.deleteManySizeByIds(ids);
  }
}
