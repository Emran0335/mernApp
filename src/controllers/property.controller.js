import mongoose, { isValidObjectId } from "mongoose";
import { Property } from "../models/property.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";

const getAllProperties = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
  } = req.query;
  if (!query || query.trim() === "") {
    throw new ApiError(400, "Query is required");
  }
  const properties = await Property.aggregate([
    {
      $match: {
        $or: [
          {
            title: { $regex: query, $options: "i" },
          },
          {
            description: { $regex: query, $options: "i" },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "creator",
        foreignField: "_id",
        as: "creator",
        pipeline: [
          {
            $project: {
              avatar: 1,
              name: 1,
              email: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        creator: {
          $first: "$creator",
        },
      },
    },
    {
      $project: {
        _id: 1,
        creator: 1,
        videoFile: 1,
        thumbnail: 1,
        createdAt: 1,
        description: 1,
        title: 1,
      },
    },
    {
      $sort: {
        [sortBy]: sortType === "asc" ? 1 : -1,
      },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: parseInt(limit),
    },
  ]);
  if (!properties?.length) {
    throw new ApiError(404, "No properties found for given query");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, properties, "All properties fetched successfully")
    );
});

const getPropertyDetail = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  if (!propertyId || !isValidObjectId(propertyId)) {
    throw new ApiError(400, "Invalid property Id");
  }
  const property = await Property.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(propertyId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "creator",
        foreignField: "_id",
        as: "creator",
      },
    },
    {
      $addFields: {
        creator: {
          $first: "$creator",
        },
      },
    },
    {
      $project: {
        name: 1,
        avatar: 1,
        videoFile: 1,
        thumbnail: 1,
        creator: 1
      },
    },
  ]);

  if (!property) {
    throw new ApiError(500, "properties are not found!");
  }
  await User.findByIdAndUpdate(req.user?._id, {
    $addToSet: {
      propertyHistory: propertyId,
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, property[0], "Property retrieved successfully!")
    );
});

const createProperty = asyncHandler(async (req, res) => {
  const { title, description, propertyType, location, price } = req.body;
  if (
    [title, description, propertyType, location, price].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required!");
  }

  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
  if (!thumbnailLocalPath) {
    unlinkPath(videoFileLocalPath, thumbnailLocalPath);
    throw new ApiError(400, "Thumbnail is required");
  }
  const videoFileLocalPath = req.files?.videoFile[0]?.path;
  if (!videoFileLocalPath) {
    unlinkPath(videoFileLocalPath, thumbnailLocalPath);
    throw new ApiError(400, "Video file is required");
  }
  const thumbnail = await uploadCloudinary(thumbnailLocalPath);
  const videoFile = await uploadCloudinary(videoFileLocalPath);

  if (!videoFile || !thumbnail) {
    throw new ApiError(400, "VideoFile or thumbnail is missing!");
  }

  const newProperty = await Property.create({
    title,
    description,
    propertyType,
    location,
    price,
    videoFile: videoFile?.url,
    thumbnail: thumbnail?.url,
    creator: req.user?._id,
  });
  if (!newProperty) {
    throw new ApiError(
      500,
      "Something went wrong while creating newProperty for the user"
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newProperty, "Property created successfully!"));
});

const updateProperty = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, propertyType, location, price } = req.body;
    const photoLocalPath = req.files?.photo[0]?.path;
    const photo = await uploadCloudinary(photoLocalPath);

    const updatedPropertise = await Property.findByIdAndUpdate(
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
    const propertyToDelete = await Property.findById({ _id: id }).populate(
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
