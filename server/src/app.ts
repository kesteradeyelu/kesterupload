import express, { Application, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import emailRoutes from "./routes/emailRoutes";
import contactRoutes from "./routes/contactRoutes";
import uploadRoutes from "./routes/upload.routes";
import { connectDB } from "./config/db";
import serverless from "serverless-http";

dotenv.config();

const app: Application = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

connectDB();

app.get("/", (req: Request, res: Response) => {
  res.send("API is running...");
});

app.use(emailRoutes);
app.use(contactRoutes);
app.use(uploadRoutes);

// error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack:
      process.env.NODE_ENV === "production" ? "Production error" : err.stack,
    error: err,
  });
});

// ❌ Remove app.listen()
// ❌ Remove PORT

export const handler = serverless(app);
export default app;
