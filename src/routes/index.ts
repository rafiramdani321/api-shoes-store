import { Router } from "express";
import routerAuth from "./auth.route";
import routerCategory from "./category.route";
import routerSubCategory from "./subcategory.route";
import routerSize from "./size.route";
import routerRole from "./role.route";
import routerProduct from "./product.route";
import routerCart from "./cart.route";
import routerUser from "./user.route";
import routerShippingAddress from "./shippingAddress.route";
import routerOrder from "./order.route";
import routerPayment from "./payment.route";
import routerPaymentWebhook from "./payment.webhook.route";

const routes = Router();

routes.use("/auth", routerAuth);
routes.use("/users", routerUser);
routes.use("/categories", routerCategory);
routes.use("/sub-categories", routerSubCategory);
routes.use("/sizes", routerSize);
routes.use("/roles", routerRole);
routes.use("/products", routerProduct);
routes.use("/carts", routerCart);
routes.use("/shipping-address", routerShippingAddress);
routes.use("/orders", routerOrder);
routes.use("/payment", routerPayment);
routes.use("/midtrans/webhooks", routerPaymentWebhook);

export default routes;
