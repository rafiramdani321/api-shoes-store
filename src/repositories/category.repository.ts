import { Prisma } from "@prisma/client";
import { prisma } from "../libs/prisma";
import {
  CategoriesAllowedSearchBy,
  CategoriesAllowedSortBy,
  CategoryCreate,
  CategoryUpdate,
  CategoriesSortOrder,
} from "../types/category.type";

export default class CategoryRepository {
  static async findCategories(
    page: number,
    limit: number,
    searchBy?: CategoriesAllowedSearchBy,
    search?: string,
    sortBy?: CategoriesAllowedSortBy,
    sortOrder: CategoriesSortOrder = "desc"
  ) {
    const skip = (page - 1) * limit;

    let where: Prisma.CategoryWhereInput = {};

    if (search) {
      if (searchBy) {
        where = {
          [searchBy]: { contains: search, mode: Prisma.QueryMode.insensitive },
        };
      } else {
        where = {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { slug: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        };
      }
    }

    const orderBy: Prisma.CategoryOrderByWithRelationInput = sortBy
      ? { [sortBy]: sortOrder }
      : { created_at: "desc" };

    const [data, total] = await Promise.all([
      prisma.category.findMany({
        skip,
        take: limit,
        where,
        orderBy,
        include: {
          SubCategory: true,
        },
      }),
      prisma.category.count({ where }),
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

  static async findCategoryById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        SubCategory: true,
      },
    });
  }

  static async findCategoryByName(name: string) {
    return prisma.category.findUnique({ where: { name } });
  }

  static async findCategoryBySlug(slug: string) {
    return prisma.category.findUnique({ where: { slug } });
  }

  static async createCategory(data: CategoryCreate) {
    return prisma.category.create({
      data: { name: data.name, slug: data.slug, created_by: data.created_by },
    });
  }

  static async updateCategoryById(data: CategoryUpdate) {
    return prisma.category.update({
      where: { id: data.id },
      data: {
        name: data.name,
        slug: data.slug,
        updated_by: data.updated_by,
      },
    });
  }

  static async deleteCategoryById(id: string) {
    return prisma.category.delete({ where: { id } });
  }

  static async deleteCategoryManyById(ids: string[]) {
    return prisma.category.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
