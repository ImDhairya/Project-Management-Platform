import mongoose, { Schema } from "mongoose";

const subTaskSchema = new Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      require: true,
    },

    title: {
      type: String,
      required: [true, "Subtask title is required."],
      trim: true,
    },

    isCompleted: {
      type: Boolean,
      default: false,
    },

    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export const SubTask = new mongoose.model("SubTask", subTaskSchema);
