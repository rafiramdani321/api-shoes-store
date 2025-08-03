import { Router } from "express";
import routerAuth from "./auth.route";

const routes = Router();

routes.use("/auth", routerAuth);

export default routes;
