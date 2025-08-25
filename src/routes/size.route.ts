import { Router } from "express";
import SizeController from "../controllers/size.controller";
import { verifyAccessToken } from "../middleware/verifyAccessToken";
import { checkPermission } from "../middleware/checkPermission";
import { Permission } from "../constants";

const routerSize = Router();

routerSize.get("/", SizeController.getSizes);
routerSize.get("/:id", SizeController.getSizeById);
routerSize.post(
  "/",
  verifyAccessToken,
  checkPermission([Permission.CREATE_SIZE]),
  SizeController.addSize
);
routerSize.put(
  "/:id",
  verifyAccessToken,
  checkPermission([Permission.UPDATE_SIZE]),
  SizeController.updateSize
);
routerSize.delete(
  "/delete-many",
  verifyAccessToken,
  checkPermission([Permission.DELETE_SIZE]),
  SizeController.deleteManySizeByIds
);
routerSize.delete(
  "/:id",
  verifyAccessToken,
  checkPermission([Permission.DELETE_SIZE]),
  SizeController.deleteSizeById
);

export default routerSize;
