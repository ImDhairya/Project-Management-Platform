console.log("The backend project starting...");
import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
const port = process.env.PORT || 8080;

connectDB()
  .then(
    app.listen(port, () => {
      console.log(`The app is listening on http://localhost:${port}`);
    }),
  )
  .catch((err) => {
    console.log("The connection to db failed.", err);
    process.exit(1)
  });
