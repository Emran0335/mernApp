import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  loginUser,
  registerUser,
  getAllUsers,
  getUserInfoById,
  getUserProperties
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
router.route("/history").get(verifyJWT, getUserProperties);
router.route("/:userId").get(verifyJWT, getUserInfoById);

export default router;
