import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
dotenv.config();

// Validate environment variables
import { validateEnv } from "./src/config/validateEnv.js";
// validateEnv();

// import  express app from  app.js file
import app from "./src/app.js";

// Connect to MongoDB
// connectDB();

// Start server
const PORT = process.env.PORT || 8000;
const baseUrl = process.env.BASE_URL || "http://localhost";
app.listen(PORT, () => {
  console.log(`✅ Server running on ${baseUrl}:${PORT}`);
});
