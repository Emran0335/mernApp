import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  createProperty,
  deleteProperty,
  getAllProperties,
  getPropertyDetail,
  updateProperty,
} from "../controllers/property.controller.js";

const router = Router();

router.route("/").get(getAllProperties);
router.route("/:id").get(getPropertyDetail);
router.route("/").post(
  upload.fields([
    {
      name: "photo",
      maxCount: 1,
    },
  ]),
  createProperty
);
router.route("/:id").patch(
  upload.fields([
    {
      name: "photo",
      maxCount: 1,
    },
  ]),
  updateProperty
);
router.route("/:id").delete(deleteProperty);

export default router;
