import mongoose, { Schema } from "mongoose";

const noteSchema = new Schema(
  {
    project: {
      type: mongoose.Types.ObjectId,
      required: true,
    },

    note: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export const Notes = mongoose.Model("Note", noteSchema);
