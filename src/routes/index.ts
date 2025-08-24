import { Router } from "express";
import routerAuth from "./auth.route";
import routerCategory from "./category.route";
import routerSubCategory from "./subcategory.route";

const routes = Router();

routes.use("/auth", routerAuth);
routes.use("/categories", routerCategory);
routes.use("/sub-categories", routerSubCategory);

export default routes;
