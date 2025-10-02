import mongoose, { Schema } from "mongoose";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        role: {
          type: String,
          enum: AvailableUserRoles,
          default: UserRolesEnum.MEMBER,
        },

        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],

    notes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Note",
      },
    ],

    memberCount: {
      type: Number,
      default: 0, // can be updated automatically on member add/remove
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    timeseries: true,
  },
);

// projectSchema.pre('save', async function (next) {
//   if(this.)
// })

projectSchema.pre("save", async function (next) {
  if (!this.isModified("members")) {
    return next();
  }

  this.memberCount = this.members.length;

  
});

export const Project = mongoose.model("Project", projectSchema);
