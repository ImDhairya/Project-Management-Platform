import mongoose, { Schema } from "mongoose";
import { AvailableTaskStatuses } from "../utils/constants.js";

const taskSchema = new Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
    index: true,
  },

  title: {
    type: String,
    required: [true, "Task title is required"],
    trim: true,
  },

  description: {
    type: String,
    trim: true,
  },

  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  status: {
    type: String,
    enum: AvailableTaskStatuses,
    default: "todo",
  },

  attachments: [
    {
      url: String,
      mimeType: String,
      size: Number, // store in bytes
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  subtasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubTask",
    },
  ],

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export const Task = new mongoose.model("Task", taskSchema);
