import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { prisma } from "./libs/prisma";
import routes from "./routes";
import { handleError } from "./utils/responses";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [process.env.FRONTEND_PUBLIC_BASE_URL];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  if (req.is("multipart/form-data")) {
    return next();
  }
  express.json({ limit: "10mb" })(req, res, next);
});

app.use("/api", routes);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    status: "error",
    message: "Route not found.",
  });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  handleError(err, res);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log("✅ Database Connected");

    // await import("./jobs/cleanExpiredTokensJob");

    console.log(`🚀 Server running at http://localhost:${PORT}`);
  } catch (error) {
    console.error("Connection error", error);
  }
});
