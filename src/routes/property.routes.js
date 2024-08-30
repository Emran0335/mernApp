import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createProperty,
  deleteProperty,
  getAllProperties,
  getPropertyDetail,
  updateProperty,
} from "../controllers/property.controller.js";

const router = Router();

router.route("/").get(getAllProperties);
router.route("/:propertyId").get(verifyJWT, getPropertyDetail);
router.route("/").post(
  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1,
    },
    {
      name: "videoFile",
      maxCount: 1,
    },
  ]),
  verifyJWT,
  createProperty
);
router.route("/:id").patch(
  verifyJWT,
  upload.fields([
    {
      name: "photo",
      maxCount: 1,
    },
  ]),
  updateProperty
);
router.route("/:id").delete(verifyJWT, deleteProperty);

export default router;
