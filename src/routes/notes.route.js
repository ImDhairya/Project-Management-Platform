import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getProjectNote,
  createNote,
  updateNote,
  deleteNote,
} from "../controllers/note.controller.js";

const router = Router();

router.route("/:id").get(verifyJWT, getProjectNote);

router.route("/:id").post(verifyJWT, createNote);

router.route("/:id/n/:noteId").put(verifyJWT, updateNote);

router.route("/:id/n/:noteId").delete(verifyJWT, deleteNote);

export default router;
