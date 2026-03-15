import type {
  CancelBookingResponseDto,
  CreateBookingRequestDto,
  CreateBookingResponseDto,
  ListBookingsResponseDto,
} from "../contracts";
import { Prisma } from "../generated/prisma";
import { prisma } from "../db/prisma";
import { bookingRepository } from "../repositories/bookingRepository";
import { ApiError } from "../utils/apiError";
import { calculateNights } from "../utils/dateUtils";

export const bookingService = {
  async createBooking(
    payload: CreateBookingRequestDto,
  ): Promise<CreateBookingResponseDto> {
    const nights = calculateNights(payload.checkInDate, payload.checkOutDate);

    if (nights <= 0) {
      throw new ApiError(400, "checkOutDate must be after checkInDate");
    }

    try {
      return await prisma.$transaction(async (client) => {
        const room = await bookingRepository.lockRoomForBooking(
          client,
          payload.roomId,
        );

        if (!room) {
          throw new ApiError(404, "Room not found");
        }

        const existing = await bookingRepository.hasOverlappingBooking(client, {
          roomId: payload.roomId,
          checkInDate: payload.checkInDate,
          checkOutDate: payload.checkOutDate,
        });

        if (existing) {
          throw new ApiError(
            409,
            "Selected room is no longer available for this date range.",
          );
        }

        const guest = await bookingRepository.upsertGuest(
          client,
          payload.guest,
        );

        const booking = await bookingRepository.createBooking(client, {
          guestId: guest.id,
          roomId: room.roomId,
          checkInDate: payload.checkInDate,
          checkOutDate: payload.checkOutDate,
          source: payload.source ?? "website",
        });

        return {
          bookingId: booking.id,
          status: booking.status,
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate,
          createdAt: booking.createdAt,
          room: {
            roomId: room.roomId,
            roomNumber: room.roomNumber,
            category: room.category,
          },
          guest: {
            guestId: guest.id,
            name: payload.guest.name,
            email: payload.guest.email.toLowerCase(),
            phone: payload.guest.phone?.trim() || null,
          },
        };
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2003") {
          throw new ApiError(404, "Room not found");
        }
      }

      throw error;
    }
  },

  async cancelBooking(bookingId: number): Promise<CancelBookingResponseDto> {
    return prisma.$transaction(async (client) => {
      const booking = await bookingRepository.getBookingForUpdate(
        client,
        bookingId,
      );

      if (!booking) {
        throw new ApiError(404, "Booking not found");
      }

      if (booking.status === "cancelled") {
        return {
          bookingId,
          status: "cancelled",
          cancelledAt: booking.cancelledAt ?? new Date().toISOString(),
        };
      }

      const updated = await bookingRepository.markBookingCancelled(
        client,
        bookingId,
      );

      return {
        bookingId,
        status: "cancelled",
        cancelledAt: updated.cancelledAt,
      };
    });
  },

  async listBookings(input: {
    skip: number;
    limit: number;
  }): Promise<ListBookingsResponseDto> {
    const { bookings, total } = await bookingRepository.listBookings(input);

    return {
      bookings,
      pagination: {
        skip: input.skip,
        limit: input.limit,
        total,
      },
    };
  },
};
