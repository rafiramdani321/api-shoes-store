import { prisma } from "../libs/prisma";
import { CreateProductType } from "../types/product.type";

export class ProductRepository {
  static async createProduct(data: CreateProductType) {
    return prisma.product.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        price: data.price,
        is_active: data.is_active,
        category_id: data.category_id,
        subcategory_id: data.subcategory_id,
        ProductImage: {
          create: data.images,
        },
        ProductSize: {
          create: data.sizes,
        },
        created_by: data.created_by,
      },
      include: {
        ProductImage: true,
        ProductSize: true,
      },
    });
  }

  static async findProductById(id: string) {
    return prisma.product.findUnique({
      where: { id },
    });
  }

  static async findProductByTitle(title: string) {
    return prisma.product.findUnique({
      where: { title },
    });
  }

  static async findProductBySlug(slug: string) {
    return prisma.product.findUnique({
      where: { slug },
    });
  }
}
