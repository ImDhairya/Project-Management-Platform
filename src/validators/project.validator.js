import { body, param } from "express-validator";
import {
  AvailableTaskStatuses,
  AvailableUserRoles,
} from "../utils/constants.js";

const createProjectValidator = () => {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("The name cannot be empty")
      .isLength({ min: 3 })
      .withMessage("The project name must be atlease 3 characters long"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("The description field can not be empty."),
    body("members.*.user")
      .isMongoId()
      .withMessage("Each member must have a valid user id."),
    body("members.*.role")
      .optional()
      .isIn(AvailableUserRoles)
      .withMessage("Role must be one of admin, project_admin, or member."),
    body("notes")
      .trim()
      .optional()
      .isMongoId()
      .withMessage("The notes id should be a mongodb id."),
    body("isActive")
      .optional()
      .isIn([true, false])
      .withMessage("The active field must be a boolean."),
  ];
};

const updateMemberRoleValidator = () => {
  return [
    body("members.*.user")
      .isMongoId()
      .withMessage("Each member must have a valid user id."),
    body("members.*.role")
      .isIn(AvailableUserRoles)
      .withMessage("Role must be one of admin, project_admin, or member."),
  ];
};

const updateProjectValidator = () => {
  return [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 3 })
      .withMessage("The project name must be atlease 3 characters long"),
    body("description").optional().trim(),
    body("members.*.user")
      .optional()
      .isMongoId()
      .withMessage("Each member must have a valid user id."),
    body("members.*.role")
      .optional()
      .isIn(AvailableUserRoles)
      .withMessage("Role must be one of admin, project_admin, or member."),
    body("notes")
      .optional()
      .isMongoId()
      .withMessage("The notes id should be a mongodb id."),
    body("isActive")
      .optional()
      .isIn([true, false])
      .withMessage("The active field must be a boolean."),
  ];
};

const createTasksValidator = () => {
  return [
    body("title")
      .notEmpty()
      .withMessage("Title is required")
      .isString()
      .withMessage("Title must be a string"),

    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string"),

    body("status")
      .optional()
      .isIn(["todo", "in_progress", "done"])
      .withMessage("Status must be one of: todo, in_progress, done"),

    body("assignee")
      .optional()
      .isMongoId()
      .withMessage("Assignee must be a valid MongoDB ObjectId"),

    body("attachments")
      .optional()
      .isArray()
      .withMessage("Attachments must be an array"),
  ];
};

// const updateTaskValidator = [
//   param("taskId").isMongoId().withMessage("Invalid taskId"),
//   ...createTasksValidator(),
// ];

const updateTaskValidator = () => {
  return [
    param("taskId").isMongoId().withMessage("Invalid taskId"),
    ...createTasksValidator(),
  ];
};

const createSubTaskValidator = () => {
  return [
    body("title")
      .notEmpty()
      .withMessage("Subtask title is required")
      .isString()
      .withMessage("Subtask title must be a string"),

    body("completed")
      .optional()
      .isBoolean()
      .withMessage("Completed must be a boolean"),
  ];
};

const updateSubTaskValidator = [
  param("subTaskId").isMongoId().withMessage("Invalid subTaskId"),
  body("title").optional().isString(),
  body("completed").optional().isBoolean(),
];

export {
  createProjectValidator,
  updateProjectValidator,
  updateMemberRoleValidator,
  createTasksValidator,
  updateTaskValidator,
  createSubTaskValidator,
  updateSubTaskValidator,
};
