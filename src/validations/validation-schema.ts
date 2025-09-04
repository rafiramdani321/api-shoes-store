import z from "zod";

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
    .max(15, "Name is too long, max 15 characters"),
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
