import type {
  AvailabilityResponseDto,
  ListBookingsResponseDto,
  CancelBookingResponseDto,
  CreateBookingRequestDto,
  CreateBookingResponseDto,
  RoomDto,
} from "../contracts";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api/v1";

interface ErrorPayload {
  message: string;
  details?: unknown;
}

export class ApiClientError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, payload: ErrorPayload) {
    super(payload.message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
    this.details = payload.details;
  }
}

async function request<TResponse>(
  path: string,
  init?: RequestInit,
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? ((await response.json()) as TResponse | ErrorPayload)
    : null;

  if (!response.ok) {
    const errorPayload = payload as Partial<ErrorPayload> | null;
    throw new ApiClientError(response.status, {
      message: errorPayload?.message ?? "Request failed",
      details: errorPayload?.details,
    });
  }

  return payload as TResponse;
}

export async function fetchRooms(): Promise<RoomDto[]> {
  const response = await request<{ rooms: RoomDto[] }>("/rooms");
  return response.rooms;
}

export async function fetchAvailability(params: {
  checkInDate: string;
  checkOutDate: string;
  category?: string;
}): Promise<AvailabilityResponseDto> {
  const search = new URLSearchParams({
    checkInDate: params.checkInDate,
    checkOutDate: params.checkOutDate,
  });

  if (params.category) {
    search.set("category", params.category);
  }

  return request<AvailabilityResponseDto>(
    `/rooms/availability?${search.toString()}`,
  );
}

export function createBooking(
  payload: CreateBookingRequestDto,
): Promise<CreateBookingResponseDto> {
  return request<CreateBookingResponseDto>("/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function cancelBooking(
  bookingId: number,
): Promise<CancelBookingResponseDto> {
  return request<CancelBookingResponseDto>(`/bookings/${bookingId}/cancel`, {
    method: "POST",
  });
}

export function fetchBookings(params?: {
  skip?: number;
  limit?: number;
}): Promise<ListBookingsResponseDto> {
  const search = new URLSearchParams();

  if (typeof params?.skip === "number") {
    search.set("skip", String(params.skip));
  }

  if (typeof params?.limit === "number") {
    search.set("limit", String(params.limit));
  }

  const query = search.toString();
  const path = query ? `/bookings?${query}` : "/bookings";

  return request<ListBookingsResponseDto>(path);
}
