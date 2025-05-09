import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed";
import { addEmailFieldToUsers } from "./migrations/add-email-field";
import cors from "cors";
import fileUpload from "express-fileupload";
import { healthCheck } from "./health";

const app = express();

// Basic error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// CORS setup
app.use(cors({
  origin: process.env.NODE_ENV === "production" 
    ? process.env.FRONTEND_URL || true 
    : true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Health check endpoint
app.get("/api/health", healthCheck);

// File upload middleware
app.use(fileUpload({
  createParentPath: true,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  abortOnLimit: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Run migrations first
    if (!process.env.SKIP_DB_MIGRATIONS) {
      log("Running database migrations...");
      const emailMigrationResult = await addEmailFieldToUsers();
      if (emailMigrationResult.success) {
        log("Email migration completed successfully");
      } else {
        log(`Email migration issue: ${emailMigrationResult.message}`);
      }
    } else {
      log("Skipping database migrations...");
    }
    
    // Then seed the database with initial data
    if (!process.env.SKIP_DB_SEED) {
      await seedDatabase();
      log("Database seeded successfully");
    } else {
      log("Skipping database seed...");
    }

    const server = await registerRoutes(app);

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Serve the app on the port specified by Railway
    const PORT = process.env.PORT || 3000;
    server.listen({
      port: PORT,
      host: "0.0.0.0",
    }, () => {
      log(`Server is running on port ${PORT}`);
      log(`Health check available at http://0.0.0.0:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
