import { Router } from "express";
import {
  loginUser,
  registerUser,
  getAllUsers,
  getUserInfoById,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.route("/").get(getAllUsers);
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/login").post(loginUser);
router.route("/:id").get(getUserInfoById);

export default router;
