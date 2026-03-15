import { Router } from "express";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validate";
import {
  bookingIdParamsSchema,
  bookingsQuerySchema,
  createBookingBodySchema,
  emptyQuerySchema,
  emptyBodySchema,
} from "../schemas/bookingSchemas";
import { bookingService } from "../services/bookingService";

export const bookingRoutes = Router();

bookingRoutes.post(
  "/",
  validateQuery(emptyQuerySchema),
  validateBody(createBookingBodySchema),
  async (req, res, next) => {
    try {
      const payload = createBookingBodySchema.parse(req.body);
      const created = await bookingService.createBooking(payload);
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  },
);

bookingRoutes.post(
  "/:id/cancel",
  validateQuery(emptyQuerySchema),
  validateBody(emptyBodySchema),
  validateParams(bookingIdParamsSchema),
  async (req, res, next) => {
    try {
      const { id } = bookingIdParamsSchema.parse(req.params);
      const cancelled = await bookingService.cancelBooking(id);
      res.json(cancelled);
    } catch (error) {
      next(error);
    }
  },
);

bookingRoutes.get(
  "/",
  validateQuery(bookingsQuerySchema),
  validateBody(emptyBodySchema),
  async (req, res, next) => {
    try {
      const query = bookingsQuerySchema.parse(req.query);
      const bookings = await bookingService.listBookings(query);
      res.json(bookings);
    } catch (error) {
      next(error);
    }
  },
);
