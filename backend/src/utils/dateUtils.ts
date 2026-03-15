const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function toUtcDate(dateText: string): Date {
  return new Date(`${dateText}T00:00:00.000Z`);
}

export function calculateNights(
  checkInDate: string,
  checkOutDate: string,
): number {
  const checkIn = toUtcDate(checkInDate);
  const checkOut = toUtcDate(checkOutDate);
  const diff = checkOut.getTime() - checkIn.getTime();
  return diff / MS_PER_DAY;
}




export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}
