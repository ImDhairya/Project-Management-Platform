import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getUserProjects } from "../controllers/project.controller.js";

const router = Router();

router.route("/my-projects").get(verifyJWT, getUserProjects);

export default router;
