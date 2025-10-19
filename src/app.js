import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import healthCheckRouter from "./routes/healthcheck.route.js";
import authRouter from "./routes/auth.route.js";
import projectRouter from "./routes/projects.route.js";
import noteRouter from "./routes/notes.route.js";
import tasksRouter from "./routes/tasks.route.js";
import { ApiError } from "./utils/api.error.js";
import cookieParser from "cookie-parser";
import { asyncHandler } from "./utils/async-handler.js";
import {
  request_get_auth_code_url,
  get_access_token,
  get_profile_data,
} from "../src/utils/oauth.utils.js";
import googleAuthRouer from "./routes/google.auth.route.js";

dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 3000;
const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
  }),
);

app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
      data: err.data,
    });
  }
  return res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

app.use("/google/auth/", googleAuthRouer);
app.use("/api/v1/healthcheck/", healthCheckRouter);
app.use("/api/v1/auth/", authRouter);
app.use("/api/v1/projects/", projectRouter);
app.use("/api/v1/tasks/", tasksRouter);
app.use("/api/v1/notes/", noteRouter);

app.get("/", (req, res) => {
  return res.status(201).json({
    message: "The route is working. ",
  });
});

export default app;
