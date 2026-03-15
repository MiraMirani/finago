import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import type { ListBookingsResponseDto } from "../contracts";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cancelBooking, fetchBookings } from "../api/api";
import { BookingTable } from "../components/BookingTable";

export function BookingsList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const createdBookingId = searchParams.get("created");
  const createdMessage = useMemo(() => {
    if (!createdBookingId) {
      return null;
    }

    const parsed = Number(createdBookingId);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return null;
    }

    return `Booking #${parsed} created successfully.`;
  }, [createdBookingId]);

  const [data, setData] = useState<ListBookingsResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancellingId, setIsCancellingId] = useState<number | null>(null);
  const [pendingCancellationId, setPendingCancellationId] = useState<
    number | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadBookings(): Promise<void> {
    setIsLoading(true);
    try {
      const response = await fetchBookings({ skip: 0, limit: 50 });
      setErrorMessage(null);
      setData(response);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not load bookings",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleCancelBooking(targetBookingId: number): void {
    setPendingCancellationId(targetBookingId);
  }

  async function confirmCancellation(): Promise<void> {
    if (pendingCancellationId === null) {
      return;
    }

    const targetBookingId = pendingCancellationId;
    setPendingCancellationId(null);
    setIsCancellingId(targetBookingId);
    try {
      await cancelBooking(targetBookingId);
      await loadBookings();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not cancel booking",
      );
    } finally {
      setIsCancellingId(null);
    }
  }

  const pendingCancellationBooking =
    pendingCancellationId === null
      ? null
      : (data?.bookings.find(
          (booking) => booking.bookingId === pendingCancellationId,
        ) ?? null);

  useEffect(() => {
    void loadBookings();
  }, []);

  return (
    <Stack spacing={2}>
      <Paper sx={{ p: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5">Bookings</Typography>
          <Button variant="text" onClick={() => navigate("/booking/search")}>
            Back to booking
          </Button>
        </Stack>
      </Paper>

      {createdMessage ? (
        <Alert severity="success">{createdMessage}</Alert>
      ) : null}

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : null}

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      {data ? (
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            Total bookings: <strong>{data.pagination.total}</strong>
          </Typography>

          <BookingTable
            bookings={data.bookings}
            isCancellingId={isCancellingId}
            onCancelBooking={handleCancelBooking}
          />
        </Paper>
      ) : null}

      <Dialog
        open={pendingCancellationId !== null}
        onClose={() => setPendingCancellationId(null)}
      >
        <DialogTitle>Confirm cancellation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {pendingCancellationBooking ? (
              <>
                Are you sure you want to cancel room{" "}
                <strong>{pendingCancellationBooking.room.roomNumber}</strong>
                {" "}for guest{" "}
                <strong>{pendingCancellationBooking.guest.name}</strong>
                ?
              </>
            ) : (
              "Are you sure you want to cancel this booking?"
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => setPendingCancellationId(null)}
          >
            Keep booking
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirmCancellation}
          >
            Cancel booking
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
