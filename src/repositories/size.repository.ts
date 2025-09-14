import { Prisma } from "@prisma/client";
import {
  SizeAllowedSortBy,
  SizeCreateType,
  SizeSortOrder,
  SizeUpdateType,
} from "../types/size.type";
import { prisma } from "../libs/prisma";

export default class SizeRepository {
  static async findSizes(
    page: number,
    limit: number,
    sortBy?: SizeAllowedSortBy,
    sortOrder: SizeSortOrder = "desc"
  ) {
    const skip = (page - 1) * limit;

    const orderBy: Prisma.SizeOrderByWithRelationInput = sortBy
      ? { [sortBy]: sortOrder }
      : { created_at: "desc" };

    const [data, total] = await Promise.all([
      prisma.size.findMany({
        skip,
        take: limit,
        orderBy,
      }),
      prisma.size.count(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async findSizeById(id: string) {
    return prisma.size.findUnique({
      where: { id },
      include: {
        ProductSize: true,
      },
    });
  }

  static async findSizeByIds(ids: string[]) {
    return prisma.size.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      include: {
        ProductSize: true,
      },
    });
  }

  static findSizeBySize(size: string) {
    return prisma.size.findUnique({ where: { size } });
  }

  static async createSize(data: SizeCreateType) {
    return prisma.size.create({
      data: {
        size: data.size,
        created_by: data.created_by,
      },
    });
  }

  static async updateSize(data: SizeUpdateType) {
    return prisma.size.update({
      where: { id: data.id },
      data: {
        size: data.size,
        updated_by: data.updated_by,
      },
    });
  }

  static async deleteSizeById(id: string) {
    return prisma.size.delete({ where: { id } });
  }

  static async deleteManySizeByIds(ids: string[]) {
    return prisma.size.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
