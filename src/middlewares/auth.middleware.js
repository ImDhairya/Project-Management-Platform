import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api.error.js";
import { ApiResponse } from "../utils/api.response.js";
import { asyncHandler } from "../utils/async-handler.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const Token =
    (await req.cookies?.accessToken) ||
    req.headers["Authorization"]?.replace("Bearer ", "");

  if (!Token) {
    throw new ApiError("Unauthorized request", 403);
  }

  try {
    const deodedToken = jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET);

    if (!deodedToken) {
      throw new ApiError("The jwt verification failed.", 403);
    }

    const user = await User.findById(deodedToken?._id).select(
      "-password -refreshToken -isEmailVerified -forgotPasswordToken -forgotPasswordExpiry -emailVerificationToken -emailVerificationExpiry",
    );

    if (!user) {
      throw new ApiError("The user is not found", 401);
    }

    req.user = user;

    next();
  } catch (error) {
    throw new ApiError("Error in getting the api user", 401, error);
  }
});
