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
  "/permissions",
  verifyAccessToken,
  checkPermission([Permission.VIEW_ROLE]),
  RoleController.getPermissions
);

routerRole.get(
  "/role-permissions",
  verifyAccessToken,
  checkPermission([Permission.VIEW_ROLE]),
  RoleController.getRolePermissions
);

routerRole.get(
  "/role-permissions/:id",
  verifyAccessToken,
  checkPermission([Permission.VIEW_ROLE]),
  RoleController.getRolePermissionById
);

routerRole.post(
  "/role-permissions",
  verifyAccessToken,
  checkPermission([Permission.CREATE_ROLE]),
  RoleController.addRolePermission
);

routerRole.put(
  "/role-permissions/:id",
  verifyAccessToken,
  checkPermission([Permission.UPDATE_ROLE]),
  RoleController.updateRolePermission
);

routerRole.delete(
  "/role-permissions/delete-many",
  verifyAccessToken,
  checkPermission([Permission.DELETE_ROLE]),
  RoleController.deleteManyRolePermission
);

routerRole.delete(
  "/role-permissions/:id",
  verifyAccessToken,
  checkPermission([Permission.DELETE_ROLE]),
  RoleController.deleteRolePermission
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
