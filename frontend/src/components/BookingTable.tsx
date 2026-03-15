import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { BookingListItemDto } from "../contracts";

interface BookingTableProps {
  bookings: BookingListItemDto[];
  isCancellingId: number | null;
  onCancelBooking: (bookingId: number) => void;
}

export function BookingTable({
  bookings,
  isCancellingId,
  onCancelBooking,
}: BookingTableProps) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Booking</TableCell>
          <TableCell>Guest</TableCell>
          <TableCell>Room</TableCell>
          <TableCell>Dates</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Source</TableCell>
          <TableCell>Created</TableCell>
          <TableCell align="right">Action</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {bookings.map((booking) => (
          <TableRow key={booking.bookingId}>
            <TableCell>#{booking.bookingId}</TableCell>
            <TableCell>
              {booking.guest.name}
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
              >
                {booking.guest.email}
              </Typography>
            </TableCell>
            <TableCell>
              {booking.room.roomNumber} ({booking.room.category})
            </TableCell>
            <TableCell>
              {booking.checkInDate} to {booking.checkOutDate}
            </TableCell>
            <TableCell>{booking.status}</TableCell>
            <TableCell>{booking.source}</TableCell>
            <TableCell>
              {new Date(booking.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell align="right">
              <Button
                size="small"
                variant="outlined"
                disabled={
                  booking.status === "cancelled" ||
                  isCancellingId === booking.bookingId
                }
                onClick={() => onCancelBooking(booking.bookingId)}
              >
                {booking.status === "cancelled"
                  ? "Cancelled"
                  : isCancellingId === booking.bookingId
                    ? "Cancelling..."
                    : "Cancel"}
              </Button>
            </TableCell>
          </TableRow>
        ))}

        {bookings.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8}>
              <Typography color="text.secondary">No bookings yet.</Typography>
            </TableCell>
          </TableRow>
        ) : null}
      </TableBody>
    </Table>
  );
}
