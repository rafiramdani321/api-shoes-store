import { Router } from "express";
import { verifyAccessToken } from "../middleware/verifyAccessToken";
import CartController from "../controllers/cart.controller";

const routerCart = Router();

routerCart.get("/", verifyAccessToken, CartController.getCartsByUserId);
routerCart.post("/", verifyAccessToken, CartController.addCart);

export default routerCart;
