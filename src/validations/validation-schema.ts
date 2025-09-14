import z, { string } from "zod";

export const registerValidation = z
  .object({
    username: z
      .string()
      .nonempty("Username is required.")
      .min(4, "Username must be at least 4 characters.")
      .max(20, "Username is too long, max 15 characters"),
    email: z
      .string()
      .nonempty("Email is required.")
      .email("Invalid email format."),
    password: z
      .string()
      .nonempty("Password is required.")
      .min(8, "Password must be at least 8 characters.")
      .regex(/[a-z]/, "Password must include at least one lowercase letter.")
      .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
      .regex(/\d/, "Password must include at least one number.")
      .regex(/[\W_]/, "Password must include at least one special character."),
    confirmPassword: z.string().nonempty("Confirm password is required."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Confirm password do not match.",
    path: ["confirmPassword"],
  });

export const loginValidation = z.object({
  email: z.string().nonempty("Email is required."),
  password: z.string().nonempty("Password is required."),
});

export const addOrUpdateCategoryValidation = z.object({
  name: z
    .string()
    .nonempty("Name is required.")
    .min(2, "Name must be at least 2 characters")
    .max(15, "Name is too long, max 15 characters"),
  slug: z
    .string()
    .nonempty("Slug is required.")
    .min(2, "SLug must be at least 2 characters"),
});

export const createOrUpdatesubCategoryValidation = z.object({
  name: z
    .string()
    .nonempty("Name is required.")
    .min(2, "Name must be at least 2 characters")
    .max(30, "Name is too long, max 15 characters"),
  slug: z
    .string()
    .nonempty("Slug is required.")
    .min(2, "SLug must be at least 2 characters"),
  category_id: z.string().nonempty("Category is required"),
});

export const createOrUpdateSizeValidation = z.object({
  size: z
    .string()
    .nonempty("Size is required.")
    .min(1, "Size must be at least 1 characters")
    .max(10, "Size is too long, max 10 characters"),
});

export const createOrUpdateRoleValidation = z.object({
  name: z
    .string()
    .nonempty("Name is required")
    .min(1, "Name must be at least 2 characters")
    .max(20, "Name is too long, max 20 characters"),
});

export const createOrUpdateRolePermission = z.object({
  role_id: z.string().nonempty(),
  permission_id: z.string().nonempty(),
});

export const createProductValidation = z.object({
  title: z
    .string()
    .nonempty("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(50, "Title is too long."),
  slug: z
    .string()
    .nonempty("Slug is required")
    .min(3, "Slug must be at least 3 characters")
    .max(100, "Slug is too long."),
  description: z
    .string()
    .nonempty("Description is required")
    .max(500, "Description is too long"),
  price: z.coerce
    .number()
    .refine((val) => !isNaN(val), { message: "Price must be a number" })
    .refine((val) => val > 0, { message: "Price must be greater than 0" }),
  category_id: z.string().nonempty("Category is required"),
  subcategory_id: z.string(),
  sizes: z
    .array(
      z.object({
        size_id: z.string().nonempty("Size is required"),
        stock: z.coerce
          .number()
          .refine((val) => !isNaN(val), { message: "Stock must be a number" })
          .refine((val) => val > 0, {
            message: "Stock must be greater than 0",
          }),
      })
    )
    .min(1, "At least one size is required"),
});

export const updateProductValidation = z.object({
  title: z
    .string()
    .nonempty("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(50, "Title is too long."),
  slug: z
    .string()
    .nonempty("Slug is required")
    .min(3, "Slug must be at least 3 characters")
    .max(100, "Slug is too long."),
  description: z
    .string()
    .nonempty("Description is required")
    .max(500, "Description is too long"),
  price: z.coerce
    .number()
    .refine((val) => !isNaN(val), { message: "Price must be a number" })
    .refine((val) => val > 0, { message: "Price must be greater than 0" }),
  category_id: z.string().nonempty("Category is required"),
  subcategory_id: z.string(),
});

export const createProductSizesValidation = z.object({
  sizes: z
    .array(
      z.object({
        size_id: z.string().nonempty("Size is required"),
        stock: z.coerce
          .number()
          .refine((val) => !isNaN(val), { message: "Stock must be a number" })
          .refine((val) => val > 0, {
            message: "Stock must be greated than 0",
          }),
      })
    )
    .min(1, "At least one size is required"),
});

export const updateProductSizeValidation = z.object({
  size_id: z.string().nonempty("size is required"),
  stock: z.coerce
    .number()
    .refine((val) => !isNaN(val), { message: "Stock must be a number" })
    .refine((val) => val > 0, { message: "Stock must be greater than 0" }),
});
