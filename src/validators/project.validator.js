import { body } from "express-validator";
import { AvailableUserRoles } from "../utils/constants.js";

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
      .notEmpty()
      .withMessage("The nots id is needed to be there.")
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

export {
  createProjectValidator,
  updateProjectValidator,
  updateMemberRoleValidator,
};
