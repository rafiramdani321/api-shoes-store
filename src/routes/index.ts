import { Router } from "express";
import routerAuth from "./auth.route";
import routerCategory from "./category.route";
import routerSubCategory from "./subcategory.route";
import routerSize from "./size.route";
import routerRole from "./role.route";

const routes = Router();

routes.use("/auth", routerAuth);
routes.use("/categories", routerCategory);
routes.use("/sub-categories", routerSubCategory);
routes.use("/sizes", routerSize);
routes.use("/roles", routerRole);

export default routes;
