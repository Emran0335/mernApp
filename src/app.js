import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import userRouter from "./routes/user.routes.js"
import propertyRouter from "./routes/property.routes.js"

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(
  express.json({
    limit: "16kb",
  })
);
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"));
app.use(cookieParser())

// all routes should be added here
app.use("/api/v1/users", userRouter);
app.use("/api/v1/propertise", propertyRouter)

export { app };
