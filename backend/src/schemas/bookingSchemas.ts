import { z } from "zod";
import { calculateNights, todayIsoDate } from "../utils/dateUtils";

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const availabilityQuerySchema = z
  .object({
    checkInDate: isoDateSchema,
    checkOutDate: isoDateSchema,
    category: z.string().trim().min(1).max(80).optional(),
    skip: z.coerce.number().int().min(0).default(0),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict()
  .refine(
    (value) => calculateNights(value.checkInDate, value.checkOutDate) > 0,
    {
      message: "checkOutDate must be after checkInDate",
      path: ["checkOutDate"],
    },
  )
  .refine((value) => value.checkInDate >= todayIsoDate(), {
    message: "checkInDate cannot be in the past",
    path: ["checkInDate"],
  });

export const emptyQuerySchema = z.object({}).strict();

export const emptyBodySchema = z.union([z.undefined(), z.object({}).strict()]);

export const roomsQuerySchema = z
  .object({
    skip: z.coerce.number().int().min(0).default(0),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export const bookingsQuerySchema = z
  .object({
    skip: z.coerce.number().int().min(0).default(0),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export const createBookingBodySchema = z
  .object({
    roomId: z.number().int().positive(),
    checkInDate: isoDateSchema,
    checkOutDate: isoDateSchema,
    guest: z
      .object({
        name: z.string().trim().min(2).max(140),
        email: z.string().trim().email().max(255),
        phone: z.string().trim().max(30).optional(),
      })
      .strict(),
    source: z.string().trim().min(2).max(50).default("website"),
  })
  .strict()
  .refine(
    (value) => calculateNights(value.checkInDate, value.checkOutDate) > 0,
    {
      message: "checkOutDate must be after checkInDate",
      path: ["checkOutDate"],
    },
  )
  .refine((value) => value.checkInDate >= todayIsoDate(), {
    message: "checkInDate cannot be in the past",
    path: ["checkInDate"],
  });

export const bookingIdParamsSchema = z
  .object({
    id: z.coerce.number().int().positive(),
  })
  .strict();
