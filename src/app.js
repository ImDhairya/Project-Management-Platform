import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import healthCheckRouter from "./routes/healthcheck.route.js";
dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 3000;
const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
  }),
);
app.use("/api/v1/healthcheck/", healthCheckRouter);

app.get("/", (req, res) => {
  return res.status(201).json({
    message: "The route is working. ",
  });
});


export default app;
