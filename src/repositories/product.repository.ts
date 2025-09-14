import { Prisma } from "@prisma/client";
import { prisma } from "../libs/prisma";
import {
  CreateProductImageType,
  CreateProductType,
  createSizeProductType,
  ProductsAllowedSearchBy,
  ProductsAllowedSortBy,
  ProductsSortOrder,
  UpdateProductType,
  updateSizeProductType,
} from "../types/product.type";

export class ProductRepository {
  static async findProducts(
    page: number,
    limit: number,
    searchBy?: ProductsAllowedSearchBy,
    search?: string,
    sortBy?: ProductsAllowedSortBy,
    sortOrder: ProductsSortOrder = "desc"
  ) {
    const skip = (page - 1) * limit;

    let where: Prisma.ProductWhereInput = {};

    if (search) {
      if (searchBy) {
        if (searchBy === "category") {
          where = {
            category: {
              name: { contains: search, mode: Prisma.QueryMode.insensitive },
            },
          };
        } else if (searchBy === "sub_category") {
          where = {
            sub_category: {
              name: { contains: search, mode: Prisma.QueryMode.insensitive },
            },
          };
        } else {
          where = {
            OR: [
              {
                title: { contains: search, mode: Prisma.QueryMode.insensitive },
              },
              {
                slug: { contains: search, mode: Prisma.QueryMode.insensitive },
              },
              {
                category: {
                  name: {
                    contains: search,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
              },
              {
                sub_category: {
                  name: {
                    contains: search,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
              },
            ],
          };
        }
      }
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput;

    if (sortBy === "category") {
      orderBy = {
        category: { name: sortOrder },
      };
    } else if (sortBy === "sub_category") {
      orderBy = {
        sub_category: { name: sortOrder },
      };
    } else if (sortBy) {
      orderBy = {
        [sortBy]: sortOrder,
      };
    } else {
      orderBy = { created_at: "desc" };
    }

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
        where,
        orderBy,
        include: {
          category: true,
          sub_category: true,
          ProductImage: true,
          ProductSize: {
            include: {
              size: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
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

  static async findProductById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        ProductSize: {
          include: {
            size: true,
          },
          orderBy: { updated_at: "desc" },
        },
        sub_category: true,
        ProductImage: true,
      },
    });
  }

  static async findProductsByIds(ids: string[]) {
    return prisma.product.findMany({
      where: { id: { in: ids } },
      include: {
        ProductImage: true,
      },
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

  static async updateProduct(data: UpdateProductType) {
    return await prisma.product.update({
      where: { id: data.id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        price: data.price,
        category_id: data.category_id,
        subcategory_id: data.subcategory_id,
        is_active: data.is_active,
      },
    });
  }

  static async deleteProductById(id: string) {
    return prisma.product.delete({
      where: { id },
    });
  }

  static async deleteManyProducts(ids: string[]) {
    return prisma.product.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  static async findProductImageById(id: string) {
    return prisma.productImage.findUnique({
      where: { id },
    });
  }

  static async createProductImagesByProductId(data: CreateProductImageType) {
    return await prisma.productImage.createMany({
      data: data.images.map((img) => ({
        product_id: data.product_id,
        url: img.url,
        fileId: img.fileId,
      })),
    });
  }

  static async findAllImagesByProductId(product_id: string) {
    return await prisma.productImage.findMany({
      where: {
        product_id,
      },
    });
  }

  static async deleteImageProductByFileId(id: string) {
    return prisma.productImage.delete({
      where: {
        id,
      },
    });
  }

  static async findAllSizeProductByProductId(product_id: string) {
    return await prisma.productSize.findMany({
      where: {
        product_id,
      },
    });
  }

  static async findSizeProductById(id: string) {
    return await prisma.productSize.findUnique({
      where: {
        id,
      },
    });
  }

  static async findSizeIdAndProductId(product_id: string, size_id: string) {
    return await prisma.productSize.findFirst({
      where: {
        product_id,
        size_id,
      },
    });
  }

  static async findSizesIdsByProducyId(product_id: string, sizeIds: string[]) {
    return await prisma.productSize.findMany({
      where: {
        product_id,
        size_id: { in: sizeIds },
      },
    });
  }

  static async createSizeAndStockByProductId(data: createSizeProductType) {
    return await prisma.productSize.createMany({
      data: data.sizes.map((s) => ({
        product_id: data.product_id,
        size_id: s.size_id,
        stock: s.stock,
      })),
    });
  }

  static async updateSizeAndStockById(data: updateSizeProductType) {
    return prisma.productSize.update({
      where: { id: data.id },
      data: {
        size_id: data.size_id,
        stock: data.stock,
      },
    });
  }

  static async deleteSizeProductById(id: string) {
    return await prisma.productSize.delete({
      where: {
        id,
      },
    });
  }
}
