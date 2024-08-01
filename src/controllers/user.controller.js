import UserModel from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadCloudinary } from "../utils/cloudinary.js";

// for creating of the token of the user
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await UserModel.findOne(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    await user.save({ validateBeforeSave: false });

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating token");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if ([name, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  const existedUser = await UserModel.findOne({ $or: [{ name }, { email }] });
  if (existedUser) {
    throw new ApiError(409, "User with name or email already exists!");
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required!");
  }
  const avatar = await uploadCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file not retrieved from cloudinary");
  }
  const user = await UserModel.create({
    name: name,
    email: email,
    password: password,
    avatar: avatar.url,
  });

  const createdUser = await UserModel.findById(user._id).select(
    "-password -refreshToken"
  );
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    throw new ApiError(500, "Name and Email are required!");
  }
  const user = await UserModel.findOne({email});
  if (!user) {
    throw new ApiError(404, "User does not exist!");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials!");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );
  const loggedInUser = await UserModel.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken: accessToken,
          refreshToken: refreshToken,
        },
        "User loggedIn successfully!"
      )
    );
});

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await UserModel.find({}).limit(req.query._end);
    return res
      .status(200)
      .json(new ApiResponse(200, users, "All users are found!"));
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, "Data is not available!"));
  }
});

const getUserInfoById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await UserModel.findOne({ _id: id }).populate("allProperties");

  if (!user) {
    throw new ApiError(404, "User not found!");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, user, "User information is retrieved successfully!")
    );
});

export { getAllUsers, getUserInfoById, loginUser, registerUser };

