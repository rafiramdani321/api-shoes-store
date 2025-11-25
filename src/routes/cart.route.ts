import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import CartController from "../controllers/cart.controller";

const routerCart = Router();

routerCart.get("/", requireAuth, CartController.getCartsByUserId);
routerCart.post("/", requireAuth, CartController.addCart);
routerCart.delete("/:id", requireAuth, CartController.deleteCartItemById);

export default routerCart;
