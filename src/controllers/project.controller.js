import { Project } from "../models/project.model.js";
import { ApiResponse } from "../utils/api.response.js";
import { asyncHandler } from "../utils/async-handler.js";

export const getUserProjects = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const userProjects = await Project.findOne({
    createdBy: userId,
  });

  return res
    .status(202)
    .json(new ApiResponse(202, userProjects || [], "User projects."));
});
