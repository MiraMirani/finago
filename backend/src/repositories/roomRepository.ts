import { Prisma } from "../generated/prisma";
import { prisma } from "../db/prisma";

export interface AvailableRoomRecord {
  roomId: number;
  roomNumber: string;
  category: string;
}

export interface AvailabilitySearchParams {
  checkInDate: string;
  checkOutDate: string;
  category?: string;
  skip: number;
  limit: number;
}

export interface ListRoomsResult {
  rooms: AvailableRoomRecord[];
  total: number;
}

export interface ListAvailableRoomsResult {
  rooms: AvailableRoomRecord[];
  total: number;
}

interface PrismaRoomSelection {
  id: number;
  roomNumber: string;
  category: string;
}

function mapPrismaRoom(room: PrismaRoomSelection): AvailableRoomRecord {
  return {
    roomId: room.id,
    roomNumber: room.roomNumber,
    category: room.category,
  };
}

export const roomRepository = {
  async listRooms(params: {
    skip: number;
    limit: number;
  }): Promise<ListRoomsResult> {
    const [rooms, total] = await prisma.$transaction([
      prisma.room.findMany({
        select: {
          id: true,
          roomNumber: true,
          category: true,
        },
        skip: params.skip,
        take: params.limit,
        orderBy: [{ category: "asc" }, { roomNumber: "asc" }],
      }),
      prisma.room.count(),
    ]);

    return {
      rooms: rooms.map(mapPrismaRoom),
      total,
    };
  },

  async listAvailableRooms(
    params: AvailabilitySearchParams,
  ): Promise<ListAvailableRoomsResult> {
    const checkInDate = new Date(params.checkInDate);
    const checkOutDate = new Date(params.checkOutDate);

    const where: Prisma.RoomWhereInput = {
      ...(params.category
        ? {
            category: {
              equals: params.category,
              mode: "insensitive" as const,
            },
          }
        : {}),
      bookings: {
        none: {
          status: { not: "cancelled" },
          checkInDate: { lt: checkOutDate },
          checkOutDate: { gt: checkInDate },
        },
      },
    };

    const [rooms, total] = await prisma.$transaction([
      prisma.room.findMany({
        select: {
          id: true,
          roomNumber: true,
          category: true,
        },
        where,
        skip: params.skip,
        take: params.limit,
        orderBy: [{ category: "asc" }, { roomNumber: "asc" }],
      }),
      prisma.room.count({ where }),
    ]);

    return {
      rooms: rooms.map(mapPrismaRoom),
      total,
    };
  },
};
