import { Router } from "express";
import RoleController from "../controllers/role.controller";
import { verifyAccessToken } from "../middleware/verifyAccessToken";
import { checkPermission } from "../middleware/checkPermission";
import { Permission } from "../constants";

const routerRole = Router();

routerRole.get(
  "/",
  verifyAccessToken,
  checkPermission([Permission.VIEW_ROLE]),
  RoleController.getRoles
);
routerRole.get(
  "/:id",
  verifyAccessToken,
  checkPermission([Permission.VIEW_ROLE]),
  RoleController.getRoleById
);
routerRole.post(
  "/",
  verifyAccessToken,
  checkPermission([Permission.CREATE_ROLE]),
  RoleController.addRole
);
routerRole.put(
  "/:id",
  verifyAccessToken,
  checkPermission([Permission.UPDATE_ROLE]),
  RoleController.updateRole
);
routerRole.delete(
  "/delete-many",
  verifyAccessToken,
  checkPermission([Permission.DELETE_ROLE]),
  RoleController.deleteManyRoles
);
routerRole.delete(
  "/:id",
  verifyAccessToken,
  checkPermission([Permission.DELETE_ROLE]),
  RoleController.deleteRole
);

export default routerRole;
