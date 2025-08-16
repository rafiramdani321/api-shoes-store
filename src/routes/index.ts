import { Router } from "express";
import routerAuth from "./auth.route";
import routerCategory from "./category.route";

const routes = Router();

routes.use("/auth", routerAuth);
routes.use("/category", routerCategory);

export default routes;
