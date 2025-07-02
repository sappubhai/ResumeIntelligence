import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupAuth } from "./auth";

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Trust proxy for secure headers
app.set("trust proxy", 1);

// Setup authentication
await setupAuth(app);

// Register API routes
const server = await registerRoutes(app);

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  log(`Error ${status}: ${message}`);
  res.status(status).json({ error: message });
});

// Setup Vite in development
if (app.get("env") === "development") {
  await setupVite(app, server);
} else {
  serveStatic(app);
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  log(`serving on port ${PORT}`);
});