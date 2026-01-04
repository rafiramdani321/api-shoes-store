import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { OrderController } from "../controllers/order.controller";

const routerOrder = Router();

routerOrder.get("/", requireAuth, OrderController.getAll);
routerOrder.get("/:id", requireAuth, OrderController.getById);
routerOrder.post("/", requireAuth, OrderController.createOrder);
routerOrder.post("/:id/cancel", requireAuth, OrderController.cancelById);

export default routerOrder;
