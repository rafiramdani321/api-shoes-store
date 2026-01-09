import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { PaymentController } from "../controllers/payment.controller";

const routerPayment = Router();

routerPayment.post("/:orderId", requireAuth, PaymentController.create);

export default routerPayment;
