import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api.error.js";
import { ApiResponse } from "../utils/api.response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { UserRolesEnum } from "../utils/constants.js";
import { Project } from "../models/project.model.js";

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
    console.log(error, "FFFUUerr");
    throw new ApiError("Error in getting the api user", 401, error);
  }
});

export const adminMember = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;

  const projectId = req.params?.id;

  const existingProject = await Project.findById(projectId);

  if (!existingProject) {
    throw new ApiError(`Project with id ${projectId} not found`, 404);
  }

  const member = existingProject.members.find(
    (m) => m.user.toString() == userId.toString(),
  );

  console.log(existingProject, "FFF");
  if (!member || member.role !== UserRolesEnum.PROJECT_ADMIN) {
    throw new ApiError("Not authorized", 403);
  }

  req.project = existingProject;

  next();
});

export const projectAdmin = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;

  const projectId = req.params?.id;

  const existingProject = await Project.findById(projectId);

  if (!existingProject) {
    throw new ApiError(`Project with id ${projectId} not found`, 404);
  }

  const member = existingProject.members.find(
    (m) => m.user.toString() == userId.toString(),
  );

  if (!member || member.role !== UserRolesEnum.ADMIN) {
    throw new ApiError("Not authorized", 403);
  }

  req.project = existingProject;

  next();
});
