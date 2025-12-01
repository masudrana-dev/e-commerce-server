index.mjs
import express from "express";
const app = express();
import "dotenv/config";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import { readdirSync } from "fs";
import dbConnect from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";

// For local development only
const port = process.env.PORT || 5000;

// Allowed origins
const allowedOrigins = [
  process.env.ADMIN_URL,
  process.env.CLIENT_URL,
  "https://orebiclient.reactbd.com",
  "https://orebiadmin.reactbd.com",
  "http://localhost:5174",
  "http://localhost:5173",
  "http://localhost:8081",
  "http://10.0.2.2:8081",
  "http://10.0.2.2:8000",
].filter(Boolean);

console.log("Allowed CORS Origins:", allowedOrigins);
console.log("NODE_ENV:", process.env.NODE_ENV);

// CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      // Development: allow everything
      if (process.env.NODE_ENV === "development") {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Connect MongoDB + Cloudinary
dbConnect();
connectCloudinary();

// Load routes dynamically
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routesPath = path.resolve(__dirname, "./routes");
const routeFiles = readdirSync(routesPath);

routeFiles.map(async (file) => {
  if (file.endsWith(".js")) {
    const routeModule = await import(`./routes/${file}`);
    app.use("/", routeModule.default);
  }
});

// Base route
app.get("/", (req, res) => {
  res.send("API is running successfully.");
});

// LOCAL DEV ONLY
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Local server running on port ${port}`);
  });
}

// REQUIRED BY VERCEL
export default app;
