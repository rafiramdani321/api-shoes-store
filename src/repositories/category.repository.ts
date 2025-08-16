import { prisma } from "../libs/prisma";
import { CategoryCreate, CategoryUpdate } from "../types/category.type";

export default class CategoryRepository {
  static async findCategories() {
    return prisma.category.findMany();
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

  static async findCategoryById(id: string) {
    return prisma.category.findUnique({ where: { id } });
  }

  static async deleteCategoryById(id: string) {
    return prisma.category.delete({ where: { id } });
  }

  static async findCategoryByName(name: string) {
    return prisma.category.findUnique({ where: { name } });
  }

  static async findCategoryBySlug(slug: string) {
    return prisma.category.findUnique({ where: { slug } });
  }
}
