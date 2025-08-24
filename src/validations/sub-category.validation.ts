import z from "zod";

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
