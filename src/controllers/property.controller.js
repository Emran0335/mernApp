import mongoose from "mongoose";
import PropertyModel from "../models/property.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import UserModel from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary";
import { upload } from "../middlewares/multer.middleware.js";

const getAllProperties = asyncHandler(async (req, res) => {
  const {
    _end,
    _order,
    _start,
    _sort,
    title_like = "",
    propertyType = "",
  } = req.query;

  const query = {};
  if (propertyType !== "") {
    query.propertyType = propertyType;
  }
  if (title_like) {
    query.title = { $regex: title_like, $options: "i" };
  }
  try {
    const count = await PropertyModel.countDocuments({ query });
    const properties = await PropertyModel.find(query)
      .limit(_end)
      .skip(_start)
      .sort({ [_sort]: _order });
    res.header("x-total-count", count);
    res.header("Access-Control-Expose-Headers", "x-total-count");

    return res
      .status(200)
      .json(new ApiResponse(200, properties, "Propertise are found!"));
  } catch (error) {
    throw new ApiError(500, "Invalid query!");
  }
});

const getPropertyDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const propertyExists = await PropertyModel.findOne({ _id: id }).populate(
    "creator"
  );

  if (!propertyExists) {
    throw new ApiError(500, "properties are not found!");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        propertyExists,
        "All properties are retrieved successfully!5"
      )
    );
});

const createProperty = asyncHandler(async (req, res) => {
  try {
    const { title, description, propertyType, location, price, email } =
      req.body;
    if (
      [title, email, description, propertyType, location, price].some(
        (field) => field?.trim() === ""
      )
    ) {
      throw new ApiError(400, "All fields are required!");
    }
    const session = await mongoose.startSession();
    session.startTransaction();

    const user = await UserModel.findOne({ email }).session(session);
    console.log(user);
    const photoLocalPath = req.files?.photo[0]?.path;
    const photo = await uploadCloudinary(photoLocalPath);
    if (!photo) {
      throw new ApiError(400, "Photo file not retrieved from cloudinary!");
    }

    const newProperty = await PropertyModel.create({
      title,
      description,
      propertyType,
      location,
      price,
      photo: photo.url,
      creator: user._id,
    });
    if (!newProperty) {
      throw new ApiError(
        500,
        "Something went wrong while newProperty the user"
      );
    }

    user.allProperties.push(newProperty._id);
    await user.save({ session });
    await session.commitTransaction();

    return res
      .status(201)
      .json(
        new ApiResponse(201, newProperty, "Property created successfully!")
      );
  } catch (error) {
    throw new ApiError(500, "property creation failed!");
  }
});

const updateProperty = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, propertyType, location, price } = req.body;
    const photoLocalPath = req.files?.photo[0]?.path;
    const photo = await uploadCloudinary(photoLocalPath);

    const updatedPropertise = await PropertyModel.findByIdAndUpdate(
      { _id: id },
      {
        title,
        description,
        propertyType,
        location,
        price,
        photo: photo.url || "",
      }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, updatedPropertise, "Propertise are updated!"));
  } catch (error) {
    throw new ApiError(500, "property update failed!");
  }
});

const deleteProperty = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const propertyToDelete = await PropertyModel.findById({ _id: id }).populate(
      "creator"
    );

    if (!propertyToDelete) {
      throw new ApiError(500, "property not found!");
    }
    const session = await mongoose.startSession();
    session.startTransaction();

    propertyToDelete.remove({ session });
    propertyToDelete.creator.allProperties.pull(propertyToDelete);

    await propertyToDelete.creator.save({ session });
    await session.commitTransaction();

    return res
      .status(200)
      .json(
        new ApiResponse(200, propertyToDelete, "deletion done successfully!")
      );
  } catch (error) {
    throw new ApiError(500, "Deletion failed!");
  }
});

export {
  getAllProperties,
  getPropertyDetail,
  createProperty,
  updateProperty,
  deleteProperty,
};
