import { Router } from "express";
import { PaymentWebhookController } from "../controllers/payment.webhook.controller";

const routerPaymentWebhook = Router();

routerPaymentWebhook.post("/", PaymentWebhookController.handle);

export default routerPaymentWebhook;
