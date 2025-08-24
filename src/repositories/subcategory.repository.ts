import { Prisma } from "@prisma/client";
import {
  SubCategoriesAllowedSearchBy,
  SubCategoriesAllowedSortBy,
  SubCategoriesSortOrder,
  SubCategoryCreate,
  SubCategoryUpdate,
} from "../types/sub-category.type";
import { prisma } from "../libs/prisma";

export default class SubCategoryRepository {
  static async findSubCategories(
    page: number,
    limit: number,
    searchBy?: SubCategoriesAllowedSearchBy,
    search?: string,
    sortBy?: SubCategoriesAllowedSortBy,
    sortOrder: SubCategoriesSortOrder = "desc"
  ) {
    const skip = (page - 1) * limit;

    let where: Prisma.SubCategoryWhereInput = {};

    if (search) {
      if (searchBy) {
        if (searchBy === "category") {
          where = {
            category: {
              name: { contains: search, mode: Prisma.QueryMode.insensitive },
            },
          };
        } else {
          where = {
            [searchBy]: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          };
        }
      } else {
        where = {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { slug: { contains: search, mode: Prisma.QueryMode.insensitive } },
            {
              category: {
                name: { contains: search, mode: Prisma.QueryMode.insensitive },
              },
            },
          ],
        };
      }
    }

    let orderBy: Prisma.SubCategoryOrderByWithRelationInput;

    if (sortBy === "category") {
      orderBy = {
        category: {
          name: sortOrder,
        },
      };
    } else if (sortBy) {
      orderBy = {
        [sortBy]: sortOrder,
      };
    } else {
      orderBy = { created_at: "desc" };
    }

    const [data, total] = await Promise.all([
      prisma.subCategory.findMany({
        skip,
        take: limit,
        where,
        orderBy,
        include: {
          category: true,
        },
      }),
      prisma.subCategory.count({ where }),
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

  static async findSubCategoryById(id: string) {
    return prisma.subCategory.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  static async findSubCategoryByName(name: string) {
    return prisma.subCategory.findUnique({
      where: { name },
      include: {
        category: true,
      },
    });
  }

  static async findSubCategoryBySlug(slug: string) {
    return prisma.subCategory.findUnique({
      where: { slug },
      include: {
        category: true,
      },
    });
  }

  static async createSubCategory(data: SubCategoryCreate) {
    return prisma.subCategory.create({
      data: {
        name: data.name,
        slug: data.slug,
        category_id: data.category_id,
        created_by: data.created_by,
      },
    });
  }

  static async updateSubCategoryById(data: SubCategoryUpdate) {
    return prisma.subCategory.update({
      where: { id: data.id },
      data: {
        name: data.name,
        slug: data.slug,
        category_id: data.category_id,
        updated_by: data.updated_by,
      },
    });
  }

  static async deleteSubCategoryById(id: string) {
    return prisma.subCategory.delete({ where: { id } });
  }

  static async deleteManySubCatagoryById(ids: string[]) {
    return prisma.subCategory.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
