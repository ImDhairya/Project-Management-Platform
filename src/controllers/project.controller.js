import mongoose from "mongoose";
import { Project } from "../models/project.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api.error.js";
import { ApiResponse } from "../utils/api.response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { createProjectValidator } from "../validators/project.validator.js";

export const getUserProjects = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const userProjects = await Project.find({
    createdBy: userId,
  });

  return res
    .status(202)
    .json(new ApiResponse(202, userProjects || [], "User projects."));
});

export const createProject = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const { name, description, members, notes, isActive } = req.body;

  const projectData = {
    name,
    description,
    createdBy: userId,
    members,
    notes,
    isActive,
  };
  const project = await Project.create(projectData);
  return res
    .status(202)
    .json(
      new ApiResponse(
        201,
        { _id: project._id, ...project.toObject() },
        "Project created successfully",
      ),
    );
});

export const getProjectId = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await Project.findById(id);
  if (!project) {
    throw new ApiError("The project does not exists", 404);
  }

  return res
    .status(202)
    .json(new ApiResponse(202, project, "The project details"));
});

export const updateProject = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const existingProject = req.project;

  if (!existingProject) {
    throw new ApiError(`Project with id ${projectId} not found`, 404);
  }

  // check for adim roles later

  if (existingProject?.createdBy.toString() !== userId.toString()) {
    throw new ApiError(
      "The user is not the creator or does not have admin rights",
      403,
    );
  }

  const { name, description, members, notes, isActive } = req.body;
  const updatedData = {};
  if (name) updatedData.name = name;
  if (description) updatedData.description = description;
  if (members) updatedData.members = undefined;
  if (notes) updatedData.notes = notes;
  if (typeof isActive !== "undefined") updatedData.isActive = isActive;
  console.log(updatedData, "HHHFFF");
  const updatedProject = await Project.findByIdAndUpdate(
    existingProject._id,
    { $set: updatedData },
    { new: true },
  );

  return res
    .status(200)
    .json(new ApiResponse(202, updatedProject, "The project got updated"));
});

export const addProjectMember = asyncHandler(async (req, res) => {
  const projectId = req.params.id;

  const { memberId, role } = req.body;

  const objectId = new mongoose.Types.ObjectId(memberId);

  const existingProject = await Project.findOne({
    _id: projectId,
    "members.user": memberId,
  });

  if (existingProject) {
    return res.status(400).json({
      success: false,
      message: "Member already exists in this project.",
    });
  }

  const updateMemberProject = await Project.updateOne(
    { _id: projectId },
    {
      $push: {
        members: {
          user: objectId,
          role: role,
        },
      },
    },
  );

  return res
    .status(202)
    .json(
      new ApiResponse(
        202,
        updateMemberProject,
        "The members role updated successfully.",
      ),
    );
});

export const getProjectMembers = asyncHandler(async (req, res) => {
  const projectId = req.params.id;
  const project = await Project.findById(projectId);

  const usersData = await Promise.all(
    project.members.map(async (member) => {
      const user = await User.findById(member.user);
      return user;
    }),
  );

  return res
    .status(200)
    .json(new ApiResponse(200, usersData, "The project members data."));
});

export const updateMemberRole = asyncHandler(async (req, res) => {
  const { members } = req.body;

  if (!members) {
    throw new ApiError("Members field is required field ", 404);
  }
  const project = req.project;
  for (const member of members) {
    await Project.updateOne(
      { _id: project?._id, "members.user": member.user },
      { $set: { "members.$.role": member.role } },
    );
  }

  const newProject = await Project.findById(project._id);

  if (!newProject) {
    throw new ApiError("The project updation failed", 504);
  }

  return res
    .status(202)
    .json(
      new ApiResponse(
        202,
        newProject,
        "The members role updated successfully.",
      ),
    );
});

export const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedProject = await Project.findByIdAndDelete({ _id: id });

  return res
    .status(202)
    .json(
      new ApiResponse(202, deleteProject, "The project deleted successfully."),
    );

  console.log(deleteProject, "Abc");
});
