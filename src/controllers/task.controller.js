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

  const taskLookup = await Task.aggregate([
    {
      $match: {
        project: project._id,
      },
    },
    // {
    //   $lookup: {
    //     from: "tasks",
    //     localField: "_id",
    //     foreignField: "_id",
    //     as: "tasks",
    //   },
    // },
  ]);

  console.log(taskLookup, "V!");

  return res
    .status(202)
    .json(
      new ApiResponse(
        202,
        taskLookup,
        "The project tasks fetched successfully.",
      ),
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

  const updatedTask = await Project.updateOne(
    { _id: project._id },
    {
      $push: {
        tasks: createTask._id,
      },
    },
  );

  return res
    .status(202)
    .json(new ApiResponse(202, createTask, "The tasks are created."));
});

export const getTask = asyncHandler(async (req, res) => {
  const { taskId, id: projectId } = req.params;

  const tasks = await Task.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
        ...(taskId && { _id: new mongoose.Types.ObjectId(taskId) }),
      },
    },
  ]);

  if (!tasks.length) {
    return res
      .status(404)
      .json(new ApiResponse(404, [], "No tasks found for this project."));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tasks, "Fetched tasks successfully."));
});

export const updateProjectTask = asyncHandler(async (req, res) => {
  const { id, taskId } = req.params;

  const projecct = req.project;

  let attachments = [];
  const file = req.files;

  if (file) {
    file.forEach((el) => {
      console.log(el, "Heeey");
      attachments.push({
        url: `/uploads/${el.filename}`,
        mimeType: el.mimetype,
        size: el.size,
      });
    });
  }

  const updatedData = {};

  const { title, description, status, assingee } = req.body;

  if (title) updatedData.title = title;
  if (description) updatedData.description = description;
  if (status) updatedData.status = status;
  if (assingee) updatedData.assingee = assingee;
  if (attachments.length > 0) updatedData.attachments = attachments;

  const updateTask = await Task.updateOne({ _id: taskId }, updatedData);

  return res
    .status(200)
    .json(new ApiResponse(202, updateTask, "The task is updated succesfully "));
});
