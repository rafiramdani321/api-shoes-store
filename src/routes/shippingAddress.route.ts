import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import ShippingAddressController from "../controllers/shippingAddress.controller";
import { validateRequest } from "../middleware/validateRequest";
import { createOrUpdateShippingAddressValidation } from "../validations/validation-schema";

const routerShippingAddress = Router();

routerShippingAddress.use(requireAuth);

routerShippingAddress.get("/", ShippingAddressController.getShippingAddress);
routerShippingAddress.post(
  "/",
  validateRequest(createOrUpdateShippingAddressValidation),
  ShippingAddressController.addShippingAddress
);
routerShippingAddress.get(
  "/:id",
  ShippingAddressController.getShippingAddressByIdAndUserId
);
routerShippingAddress.patch(
  "/:id/set-primary",
  ShippingAddressController.setIsPrimary
);
routerShippingAddress.put(
  "/:id",
  validateRequest(createOrUpdateShippingAddressValidation),
  ShippingAddressController.updateShippingAddress
);
routerShippingAddress.delete(
  "/:id",
  ShippingAddressController.deleteShippingAddress
);

export default routerShippingAddress;
