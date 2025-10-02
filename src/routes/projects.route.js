import { Router } from "express";
import { AdminMember, verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createProject,
  deleteProject,
  getProjectId,
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

router
  .route("/")
  .post(verifyJWT, createProjectValidator(), validate, createProject);

router
  .route("/:id")
  .put(
    verifyJWT,
    AdminMember,
    updateProjectValidator(),
    validate,
    updateProject,
  );

router
  .route("/:id")
  .put(
    verifyJWT,
    AdminMember,
    updateProjectValidator(),
    validate,
    updateProject,
  );

// to update the role of a member id
router
  .route("/:id/members/:memberId")
  .put(
    verifyJWT,
    AdminMember,
    updateMemberRoleValidator(),
    validate,
    updateMemberRole,
  );

router
  .route("/:id")
  .get(
    verifyJWT,
    param("id").notEmpty().withMessage("Project ID is required"),
    getProjectId,
  );

router
  .route("/:id")
  .delete(
    verifyJWT,
    AdminMember,
    param("id").notEmpty().withMessage("Project ID is required"),
    deleteProject,
  );
export default router;
