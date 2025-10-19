import { Router } from "express";
import {
  googleAuthProvider,
  handleGoogleAuthProvider,
} from "../controllers/google.auth.controller.js";

const router = Router();

router.route("/").get(googleAuthProvider);

router.route("/verify/").get(handleGoogleAuthProvider);

export default router;
