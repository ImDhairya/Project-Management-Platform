import { Router } from "express";
import { projectAdmin, verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createTasks,
  getTask,
  getTasks,
  updateProjectTask,
} from "../controllers/task.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  createTasksValidator,
  updateTaskValidator,
} from "../validators/project.validator.js";
import { Project } from "../models/project.model.js";
import path from "path";
import multer from "multer";

const router = Router();

const storage = multer.diskStorage({
  destination: "public/uploads/",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage }); // saves files in /uploads folder
// get task by project id
router.route("/:id").get(verifyJWT, projectAdmin, getTasks);

// add task by project id
router
  .route("/:id")
  .post(
    verifyJWT,
    projectAdmin,
    upload.single("attachments"),
    createTasksValidator(),
    validate,
    createTasks,
  );
// project id   t   task id

// get task details by project id and task id
router.route("/:id/t/:taskId").get(verifyJWT, getTask);

// // update the task for the project
router
  .route("/:id/t/:taskId")
  .put(
    verifyJWT,
    projectAdmin,
    upload.array("attachments", 10),
    updateTaskValidator(),
    validate,
    updateProjectTask,
  );

// // delete project task
// router
//   .route(":id/t/:taskId")
//   .delete(verifyJWT, projectAdmin, deleteProjectTask);

// //create a sub-task
// router.route(":id/st/:subTaskId").post(verifyJWT, projectAdmin, createSubTask);

// // delete a sub task
// router
//   .route(":id/st/:subTaskId")
//   .delete(verifyJWT, projectAdmin, deleteSubTask);

export default router;
