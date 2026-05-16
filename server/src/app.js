import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import devLogger from "./middleware/devLogger.middleware.js";
import routes from "./routes/index.routes.js";
import {
  globalErrorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";
import passport from "passport";
import configurePassport from "./config/passport.js";

const app = express();
const isTestEnv = process.env.NODE_ENV === "test";

app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:8000", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400,
    secure: process.env.NODE_ENV === "production",
  }),
);

if (!isTestEnv) {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      success: false,
      message:
        "Too many requests from this IP, please try again after 15 minutes",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api", limiter);
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(devLogger);

configurePassport();
app.use(passport.initialize());

app.use(routes);

// 404 Handler - Should be after all routes
app.use(notFoundHandler);

// Global Error Handler - Should be last
app.use(globalErrorHandler);

export default app;
