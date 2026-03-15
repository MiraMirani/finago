import type {
  AvailabilityResponseDto,
  ListRoomsResponseDto,
  RoomDto,
} from "../contracts";
import { roomRepository } from "../repositories/roomRepository";
import { ApiError } from "../utils/apiError";
import { calculateNights } from "../utils/dateUtils";

export const roomService = {
  async listRooms(input: {
    skip: number;
    limit: number;
  }): Promise<ListRoomsResponseDto> {
    const { rooms, total } = await roomRepository.listRooms(input);

    return {
      rooms: rooms.map((room) => ({
        roomId: room.roomId,
        roomNumber: room.roomNumber,
        category: room.category,
      })),
      pagination: {
        skip: input.skip,
        limit: input.limit,
        total,
      },
    };
  },

  async getAvailability(input: {
    checkInDate: string;
    checkOutDate: string;
    category?: string;
    skip: number;
    limit: number;
  }): Promise<AvailabilityResponseDto> {
    const nights = calculateNights(input.checkInDate, input.checkOutDate);

    if (nights <= 0) {
      throw new ApiError(400, "checkOutDate must be after checkInDate");
    }

    const { rooms, total } = await roomRepository.listAvailableRooms(input);

    const availableRooms: RoomDto[] = rooms;

    return {
      checkInDate: input.checkInDate,
      checkOutDate: input.checkOutDate,
      nights,
      availableRooms,
      pagination: {
        skip: input.skip,
        limit: input.limit,
        total,
      },
    };
  },
};
