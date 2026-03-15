import { Router } from "express";
import { validateBody, validateQuery } from "../middleware/validate";
import {
  availabilityQuerySchema,
  emptyBodySchema,
  roomsQuerySchema,
} from "../schemas/bookingSchemas";
import { roomService } from "../services/roomService";

export const roomRoutes = Router();

roomRoutes.get(
  "/",
  validateQuery(roomsQuerySchema),
  validateBody(emptyBodySchema),
  async (req, res, next) => {
    try {
      const query = roomsQuerySchema.parse(req.query);
      const response = await roomService.listRooms(query);
      res.json(response);
    } catch (error) {
      next(error);
    }
  },
);

roomRoutes.get(
  "/availability",
  validateQuery(availabilityQuerySchema),
  validateBody(emptyBodySchema),
  async (req, res, next) => {
    try {
      const query = availabilityQuerySchema.parse(req.query);
      const availability = await roomService.getAvailability(query);
      res.json(availability);
    } catch (error) {
      next(error);
    }
  },
);

