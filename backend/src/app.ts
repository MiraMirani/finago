import cors from "cors";
import express from "express";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { bookingRoutes } from "./routes/bookingRoutes";
import { roomRoutes } from "./routes/roomRoutes";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/api/v1/health", (_req, res) => {
    res.json({ 
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/api/v1/rooms", roomRoutes);
  app.use("/api/v1/bookings", bookingRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
