import { Prisma } from "../generated/prisma";
import type { BookingListItemDto, BookingStatus } from "../contracts";
import { prisma } from "../db/prisma";
import type { TransactionClient } from "../db/transaction";

export interface GuestInput {
  name: string;
  email: string;
  phone?: string;
}

export interface BookingRecord {
  id: number;
  guestId: number;
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  status: BookingStatus;
  source: string;
  createdAt: string;
  cancelledAt: string | null;
}

export interface LockedRoomRecord {
  roomId: number;
  roomNumber: string;
  category: string;
}

export interface ListBookingsResult {
  bookings: BookingListItemDto[];
  total: number;
}

function toDate(dateText: string): Date {
  return new Date(`${dateText}T00:00:00.000Z`);
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export const bookingRepository = {
  async lockRoomForBooking(
    client: TransactionClient,
    roomId: number,
  ): Promise<LockedRoomRecord | null> {
    const rows = await client.$queryRaw<LockedRoomRecord[]>(Prisma.sql`
      SELECT
        r.id AS "roomId",
        r.room_number AS "roomNumber",
        r.category
      FROM rooms r
      WHERE r.id = ${roomId}
      FOR UPDATE
    `);

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  },

  async hasOverlappingBooking(
    client: TransactionClient,
    input: {
      roomId: number;
      checkInDate: string;
      checkOutDate: string;
    },
  ): Promise<boolean> {
    const existing = await client.booking.findFirst({
      where: {
        roomId: input.roomId,
        status: { not: "cancelled" },
        checkInDate: { lt: toDate(input.checkOutDate) },
        checkOutDate: { gt: toDate(input.checkInDate) },
      },
      select: { id: true },
    });

    return existing !== null;
  },

  async upsertGuest(
    client: TransactionClient,
    guest: GuestInput,
  ): Promise<{ id: number }> {
    const normalizedEmail = guest.email.toLowerCase();
    const normalizedPhone = guest.phone?.trim();

    const createdOrUpdated = await client.guest.upsert({
      where: { email: normalizedEmail },
      update: {
        name: guest.name,
        phone: normalizedPhone ? normalizedPhone : null,
      },
      create: {
        name: guest.name,
        email: normalizedEmail,
        phone: normalizedPhone ? normalizedPhone : null,
      },
      select: {
        id: true,
      },
    });

    return { id: createdOrUpdated.id };
  },

  async createBooking(
    client: TransactionClient,
    input: {
      guestId: number;
      roomId: number;
      checkInDate: string;
      checkOutDate: string;
      source: string;
    },
  ): Promise<BookingRecord> {
    const booking = await client.booking.create({
      data: {
        guestId: input.guestId,
        roomId: input.roomId,
        checkInDate: toDate(input.checkInDate),
        checkOutDate: toDate(input.checkOutDate),
        status: "confirmed",
        source: input.source,
      },
      select: {
        id: true,
        guestId: true,
        roomId: true,
        checkInDate: true,
        checkOutDate: true,
        status: true,
        source: true,
        createdAt: true,
        cancelledAt: true,
      },
    });

    return {
      id: Number(booking.id),
      guestId: booking.guestId,
      roomId: booking.roomId,
      checkInDate: toIsoDate(booking.checkInDate),
      checkOutDate: toIsoDate(booking.checkOutDate),
      status: booking.status as BookingStatus,
      source: booking.source,
      createdAt: booking.createdAt.toISOString(),
      cancelledAt: booking.cancelledAt
        ? booking.cancelledAt.toISOString()
        : null,
    };
  },

  async getBookingForUpdate(
    client: TransactionClient,
    bookingId: number,
  ): Promise<{
    id: number;
    status: BookingStatus;
    cancelledAt: string | null;
  } | null> {
    const rows = await client.$queryRaw<
      Array<{
        id: bigint;
        status: BookingStatus;
        cancelledAt: Date | null;
      }>
    >(Prisma.sql`
      SELECT
        id,
        status,
        cancelled_at AS "cancelledAt"
      FROM bookings
      WHERE id = ${BigInt(bookingId)}
      FOR UPDATE
    `);

    if (rows.length === 0) {
      return null;
    }

    return {
      id: Number(rows[0].id),
      status: rows[0].status,
      cancelledAt: rows[0].cancelledAt
        ? rows[0].cancelledAt.toISOString()
        : null,
    };
  },

  async markBookingCancelled(
    client: TransactionClient,
    bookingId: number,
  ): Promise<{ cancelledAt: string }> {
    const updated = await client.booking.update({
      where: { id: BigInt(bookingId) },
      data: {
        status: "cancelled",
        cancelledAt: new Date(),
      },
      select: {
        cancelledAt: true,
      },
    });

    return {
      cancelledAt: (updated.cancelledAt ?? new Date()).toISOString(),
    };
  },

  async listBookings(params: {
    skip: number;
    limit: number;
  }): Promise<ListBookingsResult> {
    const [bookings, total] = await prisma.$transaction([
      prisma.booking.findMany({
        skip: params.skip,
        take: params.limit,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        include: {
          room: true,
          guest: true,
        },
      }),
      prisma.booking.count(),
    ]);

    return {
      bookings: bookings.map((booking) => ({
        bookingId: Number(booking.id),
        status: booking.status as BookingStatus,
        source: booking.source,
        checkInDate: toIsoDate(booking.checkInDate),
        checkOutDate: toIsoDate(booking.checkOutDate),
        createdAt: booking.createdAt.toISOString(),
        cancelledAt: booking.cancelledAt
          ? booking.cancelledAt.toISOString()
          : null,
        room: {
          roomId: booking.room.id,
          roomNumber: booking.room.roomNumber,
          category: booking.room.category,
        },
        guest: {
          guestId: booking.guest.id,
          name: booking.guest.name,
          email: booking.guest.email,
          phone: booking.guest.phone,
        },
      })),
      total,
    };
  },
};
