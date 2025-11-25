import { NextFunction, Request, Response } from "express";
import RoleService from "../services/role.service";
import { errorResponse, handleSuccess } from "../utils/responses";
import { AppError } from "../utils/errors";
import { getClientInfo } from "../utils/getClientInfo";
import {
  RoleCreateType,
  RolePermissionCreateType,
  RolePermissionUpdateType,
  RoleUpdateType,
} from "../types/role.type";
import {
  createRoleLogger,
  createRolePermissionLogger,
  deleteManyRolePermissionLogger,
  deleteManyRolesLogger,
  deleteRoleLogger,
  deleteRolePermissionLogger,
  updateRoleLogger,
  updateRolePermissionLogger,
} from "../libs/logger/index.logger";

export default class RoleController {
  static async getRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await RoleService.getRoles(req.query);
      return handleSuccess(res, "Fetching roles success", 200, response);
    } catch (error: any) {
      next(error);
    }
  }

  static async getRoleById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const response = await RoleService.getRoleById(id);
      return handleSuccess(res, "Fetcing role by id success", 200, response);
    } catch (error: any) {
      next(error);
    }
  }

  static async addRole(req: Request, res: Response, next: NextFunction) {
    const { ip, userAgent } = getClientInfo(req);
    const data = await req.body;
    const user = req.user;
    try {
      const newData: RoleCreateType = {
        name: data?.name,
        created_by: req?.user?.email!,
      };
      await RoleService.addRole(newData);

      createRoleLogger.info({
        event: "create_role_success",
        email: user?.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return handleSuccess(res, "Create new role success", 201);
    } catch (error: any) {
      createRoleLogger.error({
        event: "create_role_failed",
        email: data?.email || "unknown",
        message: error.message,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });
      next(error);
    }
  }

  static async updateRole(req: Request, res: Response, next: NextFunction) {
    const { ip, userAgent } = getClientInfo(req);
    const user = req.user;
    const data = req.body;
    const { id } = req.params;
    try {
      const newData: RoleUpdateType = {
        id: id,
        name: data?.name,
        updated_by: req?.user?.email!,
      };
      await RoleService.updateRole(newData);

      updateRoleLogger.info({
        event: "update_role_success",
        email: user?.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return handleSuccess(res, "Update role success", 200);
    } catch (error: any) {
      updateRoleLogger.error({
        event: "update_role_failed",
        email: data?.email || "unknown",
        message: error.message,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });
      next(error);
    }
  }

  static async deleteRole(req: Request, res: Response, next: NextFunction) {
    const { ip, userAgent } = getClientInfo(req);
    const user = req.user;
    const { id } = req.params;
    try {
      await RoleService.deleteRole(id);

      deleteRoleLogger.info({
        event: "delete_role_success",
        email: user?.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return handleSuccess(res, "Role deleted success", 200);
    } catch (error: any) {
      deleteRoleLogger.error({
        event: "delete_role_failed",
        email: user?.email || "unknown",
        message: error.message,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });
      next(error);
    }
  }

  static async deleteManyRoles(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { ip, userAgent } = getClientInfo(req);
    const user = req.user;
    try {
      const response = await RoleService.deleteManyRole(req.body.ids);

      deleteManyRolesLogger.info({
        event: "delete_roles_success",
        email: user?.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return handleSuccess(res, "deleted roles success", 200, response);
    } catch (error: any) {
      deleteManyRolesLogger.error({
        event: "delete_roles_failed",
        email: user?.email || "unknown",
        message: error.message,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });
      next(error);
    }
  }

  static async getPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await RoleService.getPermissions(req.query);
      return handleSuccess(res, "Fetching permissions success", 200, response);
    } catch (error: any) {
      next(error);
    }
  }

  static async getRolePermissions(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const response = await RoleService.getRolePermissions(req.query);
      return handleSuccess(
        res,
        "Fetching role permissions success",
        200,
        response
      );
    } catch (error: any) {
      next(error);
    }
  }

  static async getRolePermissionById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;
    try {
      const response = await RoleService.getRolePermissionById(id);
      return handleSuccess(
        res,
        "Fetching role permissions by id success",
        200,
        response
      );
    } catch (error: any) {
      next(error);
    }
  }

  static async addRolePermission(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { ip, userAgent } = getClientInfo(req);
    const data = await req.body;
    const user = req.user;

    try {
      const newData: RolePermissionCreateType = {
        role_id: data?.role_id,
        permission_id: data?.permission_id,
      };

      await RoleService.addRolePermission(newData);

      createRolePermissionLogger.info({
        event: "create_rolePermission_success",
        email: user?.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return handleSuccess(res, "Create new role permission success", 201);
    } catch (error: any) {
      createRolePermissionLogger.error({
        event: "create_rolePermission_failed",
        email: data?.email || "unknown",
        message: error.message,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });
      next(error);
    }
  }

  static async updateRolePermission(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { ip, userAgent } = getClientInfo(req);
    const user = req.user;
    const data = req.body;
    const { id } = req.params;

    try {
      const newData: RolePermissionUpdateType = {
        id,
        role_id: data?.role_id,
        permission_id: data?.permission_id,
      };

      await RoleService.updateRolePermission(newData);
      updateRolePermissionLogger.info({
        event: "update_rolePermission_success",
        email: user?.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return handleSuccess(res, "Update role permission succcess", 200);
    } catch (error: any) {
      updateRolePermissionLogger.error({
        event: "update_rolePermission_failed",
        email: data?.email || "unknown",
        message: error.message,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });
      next(error);
    }
  }

  static async deleteRolePermission(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { ip, userAgent } = getClientInfo(req);
    const user = req.user;
    const { id } = req.params;
    try {
      await RoleService.deleteRolePermissionById(id);

      deleteRolePermissionLogger.info({
        event: "delete_rolePermission_success",
        email: user?.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return handleSuccess(res, "Role permission deleted success", 200);
    } catch (error: any) {
      deleteRolePermissionLogger.error({
        event: "update_rolePermission_failed",
        email: user?.email || "unknown",
        message: error.message,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });
      next(error);
    }
  }

  static async deleteManyRolePermission(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { ip, userAgent } = getClientInfo(req);
    const user = req.user;
    try {
      const response = await RoleService.deleteManyRolePermissions(
        req.body.ids
      );

      deleteManyRolePermissionLogger.info({
        event: "delete_many_rolePermission_success",
        email: user?.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return handleSuccess(
        res,
        "deleted role permissions success",
        200,
        response
      );
    } catch (error: any) {
      deleteManyRolePermissionLogger.error({
        event: "delete_many_rolePermission_failed",
        email: user?.email || "unknown",
        message: error.message,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });
      next(error);
    }
  }
}
