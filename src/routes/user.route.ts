import { Router } from "express";
import UserController from "../controllers/user.controller";
import { requireAuth } from "../middleware/requireAuth";
import { checkPermission } from "../middleware/checkPermission";
import { Permission } from "../constants/role-permission";
import multer from "multer";

const routerUser = Router();
const upload = multer({ storage: multer.memoryStorage() });

routerUser.get("/me", requireAuth, UserController.getMe);
routerUser.put("/update-me", requireAuth, UserController.updateMe);
routerUser.delete("/image", requireAuth, UserController.deleteImageProfile);
routerUser.put("/change-email", requireAuth, UserController.updateEmailMe);
routerUser.get(
  "/",
  requireAuth,
  checkPermission([Permission.VIEW_USERS]),
  UserController.getUsers
);
routerUser.post(
  "/update-me/image",
  requireAuth,
  upload.array("images"),
  UserController.updateMeImageProfile
);
routerUser.get(
  "/verify-new-email/:token",
  UserController.verifyNewEmailActivation
);
routerUser.put("/set-mypassword", requireAuth, UserController.setMyPassword);
routerUser.put(
  "/change-password",
  requireAuth,
  UserController.changeMyPassword
);

export default routerUser;
