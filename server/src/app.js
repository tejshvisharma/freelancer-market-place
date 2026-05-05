import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import devLogger from "./middleware/devLogger.middleware.js";
import routes from "./routes/index.routes.js";
import { globalErrorHandler, notFoundHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(helmet());
app.use(cors());
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(devLogger);

app.use(routes);

// 404 Handler - Should be after all routes
app.use(notFoundHandler);

// Global Error Handler - Should be last
app.use(globalErrorHandler);

export default app;
