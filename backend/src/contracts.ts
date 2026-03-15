export type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface RoomDto {
  roomId: number;
  roomNumber: string;
  category: string;
}

export interface PaginationDto {
  skip: number;
  limit: number;
  total: number;
}

export interface ListRoomsResponseDto {
  rooms: RoomDto[];
  pagination: PaginationDto;
}

export interface AvailabilityResponseDto {
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  availableRooms: RoomDto[];
  pagination: PaginationDto;
}

export interface CreateBookingRequestDto {
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  guest: {
    name: string;
    email: string;
    phone?: string;
  };
  source?: string;
}

export interface CreateBookingResponseDto {
  bookingId: number;
  status: BookingStatus;
  checkInDate: string;
  checkOutDate: string;
  createdAt: string;
  room: RoomDto;
  guest: {
    guestId: number;
    name: string;
    email: string;
    phone: string | null;
  };
}

export interface CancelBookingResponseDto {
  bookingId: number;
  status: "cancelled";
  cancelledAt: string;
}

export interface BookingListItemDto {
  bookingId: number;
  status: BookingStatus;
  source: string;
  checkInDate: string;
  checkOutDate: string;
  createdAt: string;
  cancelledAt: string | null;
  room: RoomDto;
  guest: {
    guestId: number;
    name: string;
    email: string;
    phone: string | null;
  };
}

export interface ListBookingsResponseDto {
  bookings: BookingListItemDto[];
  pagination: PaginationDto;
}

export interface ApiErrorResponseDto {
  message: string;
  details?: unknown;
}
