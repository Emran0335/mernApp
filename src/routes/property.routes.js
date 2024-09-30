import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createProperty,
  deleteProperty,
  getAllProperties,
  getPropertyDetail,
  updateProperty,
  getProperty
} from "../controllers/property.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/").get(getAllProperties);
router.route("/userProperty").get(getProperty);
router
  .route("/:propertyId")
  .get(getPropertyDetail)
  .patch(upload.single("thumbnail"), updateProperty)
  .delete(deleteProperty);
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
  createProperty
);

export default router;
