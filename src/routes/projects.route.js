import { Router } from "express";
import { adminMember, verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addProjectMember,
  createProject,
  deleteProject,
  getProjectId,
  getProjectMembers,
  getUserProjects,
  updateMemberRole,
  updateProject,
} from "../controllers/project.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  createProjectValidator,
  updateMemberRoleValidator,
  updateProjectValidator,
} from "../validators/project.validator.js";
import { param, query } from "express-validator";

const router = Router();

router.route("/").get(verifyJWT, getUserProjects);

// 1 get project by id

router
  .route("/")
  .post(verifyJWT, createProjectValidator(), validate, createProject);

router
  .route("/:id")
  .get(
    verifyJWT,
    param("id").notEmpty().withMessage("Project ID is required"),
    getProjectId,
  );

router
  .route("/:id")
  .put(
    verifyJWT,
    adminMember,
    updateProjectValidator(),
    validate,
    updateProject,
  );

router
  .route("/:id")
  .delete(
    verifyJWT,
    adminMember,
    param("id").notEmpty().withMessage("Project ID is required"),
    deleteProject,
  );

router
  .route("/:id/members")
  .get(
    verifyJWT,
    param("id").notEmpty().withMessage("Project ID is required"),
    getProjectMembers,
  );
router
  .route("/:id/members")
  .post(
    verifyJWT,
    param("id").notEmpty().withMessage("Project ID is required"),
    addProjectMember,
  );

// create a post route that adds project members
// a put route to update a memebr role

router
  .route("/:id")
  .put(
    verifyJWT,
    adminMember,
    updateProjectValidator(),
    validate,
    updateProject,
  );

// to update the role of a member id
//project id memebers user id
router
  .route("/:id/members/:memberId")
  .put(
    verifyJWT,
    adminMember,
    updateMemberRoleValidator(),
    validate,
    updateMemberRole,
  );

export default router;
