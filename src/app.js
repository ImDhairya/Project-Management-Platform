import express from "express";
import dotenv from "dotenv";
import cors from "cors";
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
    allowedHeaders: ["Authorization", "Content-Type"]
  }),
);

app.get("/", (req, res) => {
  res.json({
    message: "Good day friend.",
  });
});

export default app;
