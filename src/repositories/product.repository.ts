import { prisma } from "../libs/prisma";
import {
  CreateProductImageType,
  CreateProductType,
  createSizeProductType,
  ProductsAllowedSearchBy,
  ProductsAllowedSortBy,
  ProductsAllowedSortByProductBySlug,
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

    if (!search) {
      const [data, total] = await Promise.all([
        prisma.product.findMany({
          skip,
          take: limit,
          orderBy: sortBy
            ? sortBy === "category"
              ? { category: { name: sortOrder } }
              : sortBy === "sub_category"
              ? { sub_category: { name: sortOrder } }
              : { [sortBy]: sortOrder }
            : { created_at: "desc" },
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            sub_category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            ProductImage: true,
            ProductSize: {
              select: {
                id: true,
                size: {
                  select: {
                    id: true,
                    size: true,
                    created_at: true,
                    created_by: true,
                    updated_at: true,
                    updated_by: true,
                  },
                },
                product_id: true,
              },
            },
          },
        }),
        prisma.product.count(),
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

    let whereClause = "";
    if (searchBy === "title") {
      whereClause = `lower(p.title) % lower($1)`;
    } else if (searchBy === "slug") {
      whereClause = `lower(p.slug) % lower($1)`;
    } else if (searchBy === "category") {
      whereClause = `lower(c.name) % lower($1) OR lower(c.slug) % lower($1)`;
    } else if (searchBy === "sub_category") {
      whereClause = `lower(sc.name) % lower($1) OR lower(sc.slug) % lower($1)`;
    } else {
      whereClause = `
      lower(p.title) % lower($1)
      OR lower(p.slug) % lower($1)
      OR lower(c.name) % lower($1)
      OR lower(c.slug) % lower($1)
      OR lower(sc.name) % lower($1)
      OR lower(sc.slug) % lower($1)
    `;
    }

    const sortColumnMap: Record<ProductsAllowedSortBy, string> = {
      title: "p.title",
      slug: "p.slug",
      price: "p.price",
      category: "c.name",
      sub_category: "sc.name",
      created_at: "p.created_at",
      updated_at: "p.updated_at",
    };

    const sortColumn = sortBy ? sortColumnMap[sortBy] : "p.created_at";
    const sortDirection = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const orderByClause = sortBy
      ? `${sortColumn} ${sortDirection}, similarity(lower(p.title), lower($1)) DESC`
      : `similarity(lower(p.title), lower($1)) DESC`;

    const data = await prisma.$queryRawUnsafe<any[]>(
      `
        SELECT 
          p.*,
          jsonb_build_object(
            'id', c.id,
            'name', c.name,
            'slug', c.slug
          ) as category,
          jsonb_build_object(
            'id', sc.id,
            'name', sc.name,
            'slug', sc.slug
          ) as sub_category,
          COALESCE(
            json_agg(DISTINCT pi) FILTER (WHERE pi.id IS NOT NULL), '[]'
          ) as "ProductImage",
          COALESCE(
            json_agg(DISTINCT jsonb_build_object(
              'id', ps.id,
              'product_id', ps.product_id,
              'size', s
            )) FILTER (WHERE ps.id IS NOT NULL), '[]'
          ) as "ProductSize"
        FROM "Product" p
        LEFT JOIN "Category" c ON p.category_id = c.id
        LEFT JOIN "SubCategory" sc ON p.subcategory_id = sc.id
        LEFT JOIN "ProductImage" pi ON pi.product_id = p.id
        LEFT JOIN "ProductSize" ps ON ps.product_id = p.id
        LEFT JOIN "Size" s ON ps.size_id = s.id
        WHERE ${whereClause}
        GROUP BY p.id, c.id, sc.id
        ORDER BY ${orderByClause}
        LIMIT $2 OFFSET $3
      `,
      search,
      limit,
      skip
    );

    const totalResult = await prisma.$queryRawUnsafe<any[]>(
      `
    SELECT COUNT(*)::int as count
    FROM "Product" p
    LEFT JOIN "Category" c ON p.category_id = c.id
    LEFT JOIN "SubCategory" sc ON p.subcategory_id = sc.id
    WHERE ${whereClause}
    `,
      search
    );

    const total = totalResult[0]?.count ?? 0;

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

  static async findProductsByCategorySlug(
    category_slug: string,
    page: number,
    limit: number,
    search?: string,
    sortBy: ProductsAllowedSortByProductBySlug = "created_at",
    sortOrder: ProductsSortOrder = "desc",
    minPrice?: number,
    maxPrice?: number,
    sizes?: string[]
  ) {
    const skip = (page - 1) * limit;

    let searchIds: string[] | undefined = undefined;

    if (search) {
      const rawResults = await prisma.$queryRawUnsafe<{ id: string }[]>(
        `
         SELECT p.id
         FROM "Product" p
         JOIN "Category" c ON p.category_id = c.id
         LEFT JOIN "SubCategory" sc ON p.subcategory_id = sc.id
         WHERE
           c.slug = $2
           AND (
             p.title ILIKE '%' || $1 || '%'
             OR p.slug ILIKE '%' || $1 || '%'
             OR c.slug ILIKE '%' || $1 || '%'
             OR sc.slug ILIKE '%' || $1 || '%'
             OR similarity(p.title, $1) > 0.2
             OR similarity(p.slug, $1) > 0.2
             OR similarity(c.slug, $1) > 0.2
             OR similarity(sc.slug, $1) > 0.2
           )
         ORDER BY
           (
            similarity(p.title, $1) + 
            similarity(p.slug, $1) +
            similarity(c.slug, $1) +
            similarity(sc.slug, $1)
           ) DESC
         LIMIT 1000
        `,
        search,
        category_slug
      );

      searchIds = rawResults.map((r) => r.id);
      if (searchIds.length === 0) {
        return {
          data: [],
          meta: {
            total: 0,
            page,
            limit,
            totalPages: 0,
          },
        };
      }
    }

    const where: any = {
      category: { slug: category_slug },
    };

    if (sizes && sizes.length > 0) {
      where.ProductSize = {
        some: { size_id: { in: sizes } },
      };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }

    if (searchIds) {
      where.id = { in: searchIds };
    }

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        include: {
          category: true,
          sub_category: true,
          ProductImage: true,
          ProductSize: {
            select: {
              id: true,
              product_id: true,
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

  static async findProductsBySubCategorySlug() {}

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

  static async findSizeProductIdAndProductId(id: string, product_id: string) {
    return await prisma.productSize.findUnique({
      where: {
        id,
        product_id,
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
