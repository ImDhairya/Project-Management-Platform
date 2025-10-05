import mongoose from "mongoose";
import { Project } from "../models/project.model.js";
import { ApiError } from "../utils/api.error.js";
import { ApiResponse } from "../utils/api.response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { Task } from "../models/tasks.model.js";

export const getTasks = asyncHandler(async (req, res) => {
  const project = req.project;

  if (!project?.tasks) {
    throw new ApiResponse(
      303,
      {},
      "The project does not have nay tasks alloted yet..",
    );
  }

  const taskLookup = await Project.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(project._id) },
    },
    {
      $lookup: {
        from: "tasks",
        localField: "_id",
        foreignField: "_id",
        as: "tasks",
      },
    },
  ]);

  console.log(taskLookup, "V!");

  return res
    .status(202)
    .json(
      new ApiResponse(202, project, "The project tasks fetched successfully."),
    );
});

export const createTasks = asyncHandler(async (req, res) => {
  const project = req.project;
  const user = req.user;

  const file = req.file;
  const { title, description, status, assignee } = req.body;
  // const {attachments} = req.

  // if (project.tasks) {
  //   throw new ApiError(
  //     "The project already has tasks please update them.",
  //     402,
  //   );
  // }

  let attachments = [];
  if (file) {
    attachments.push({
      url: `/uploads/${file.filename}`,
      mimeType: file.mimetype,
      size: file.size,
    });
  }
  const createTask = await Task.create({
    project: project._id,
    title,
    description,
    status,
    assignee,
    attachments,
    createdBy: user._id,
  });

  console.log(createTask, "ts");

  // const updatedTask = await Project.updateOne(
  //   { _id: project._id },
  //   {
  //     tasks: tasks,
  //   },
  // );
  // $push: { tasks: { $each: tasks } },

  return res
    .status(202)
    .json(new ApiResponse(202, createTask, "The tasks are created."));
});

export const getTask = asyncHandler(async (req, res) => {
  const taskId = req.params.taskId;
  const projectId = req.params.projectId;

  const createTask = await Task.findOne({});
});
