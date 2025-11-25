import { Router } from "express";
import RoleController from "../controllers/role.controller";
import { requireAuth } from "../middleware/requireAuth";
import { checkPermission } from "../middleware/checkPermission";
import { Permission } from "../constants/role-permission";

const routerRole = Router();

routerRole.get(
  "/",
  requireAuth,
  checkPermission([Permission.VIEW_ROLE]),
  RoleController.getRoles
);

routerRole.get(
  "/permissions",
  requireAuth,
  checkPermission([Permission.VIEW_ROLE]),
  RoleController.getPermissions
);

routerRole.get(
  "/role-permissions",
  requireAuth,
  checkPermission([Permission.VIEW_ROLE]),
  RoleController.getRolePermissions
);

routerRole.get(
  "/role-permissions/:id",
  requireAuth,
  checkPermission([Permission.VIEW_ROLE]),
  RoleController.getRolePermissionById
);

routerRole.post(
  "/role-permissions",
  requireAuth,
  checkPermission([Permission.CREATE_ROLE]),
  RoleController.addRolePermission
);

routerRole.put(
  "/role-permissions/:id",
  requireAuth,
  checkPermission([Permission.UPDATE_ROLE]),
  RoleController.updateRolePermission
);

routerRole.delete(
  "/role-permissions/delete-many",
  requireAuth,
  checkPermission([Permission.DELETE_ROLE]),
  RoleController.deleteManyRolePermission
);

routerRole.delete(
  "/role-permissions/:id",
  requireAuth,
  checkPermission([Permission.DELETE_ROLE]),
  RoleController.deleteRolePermission
);

routerRole.get(
  "/:id",
  requireAuth,
  checkPermission([Permission.VIEW_ROLE]),
  RoleController.getRoleById
);
routerRole.post(
  "/",
  requireAuth,
  checkPermission([Permission.CREATE_ROLE]),
  RoleController.addRole
);
routerRole.put(
  "/:id",
  requireAuth,
  checkPermission([Permission.UPDATE_ROLE]),
  RoleController.updateRole
);
routerRole.delete(
  "/delete-many",
  requireAuth,
  checkPermission([Permission.DELETE_ROLE]),
  RoleController.deleteManyRoles
);
routerRole.delete(
  "/:id",
  requireAuth,
  checkPermission([Permission.DELETE_ROLE]),
  RoleController.deleteRole
);

export default routerRole;
