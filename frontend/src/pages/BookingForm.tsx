import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { ApiClientError, createBooking } from "../api/api";

const guestSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().max(30).optional(),
});

type GuestFormValues = z.infer<typeof guestSchema>;

const bookingSelectionSchema = z
  .object({
    roomId: z.coerce.number().int().positive(),
    checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })
  .refine((value) => value.checkOutDate > value.checkInDate, {
    message: "Check-out must be after check-in",
    path: ["checkOutDate"],
  });

export function BookingForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<{
    message: string;
    statusCode?: number;
  } | null>(null);

  const selectionResult = bookingSelectionSchema.safeParse({
    roomId: searchParams.get("roomId"),
    checkInDate: searchParams.get("checkInDate"),
    checkOutDate: searchParams.get("checkOutDate"),
  });

  if (!selectionResult.success) {
    return <Navigate to="/booking/search" replace />;
  }

  const selection = selectionResult.data;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestFormValues>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const created = await createBooking({
        roomId: selection.roomId,
        checkInDate: selection.checkInDate,
        checkOutDate: selection.checkOutDate,
        guest: values,
      });

      navigate(`/staff/bookings?created=${created.bookingId}`);
    } catch (error) {
      if (error instanceof ApiClientError) {
        setSubmitError({
          message: error.message,
          statusCode: error.statusCode,
        });
      } else {
        setSubmitError({
          message: "Could not create booking. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  });

  const isConflictError = submitError?.statusCode === 409;

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Paper sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={2}>
            <Typography variant="h4">Guest details</Typography>
            <Typography color="text.secondary">
              Create booking with guest information.
            </Typography>

            {submitError ? (
              <Alert
                severity={isConflictError ? "warning" : "error"}
                action={
                  isConflictError ? (
                    <Button
                      color="inherit"
                      onClick={() => navigate("/booking/search")}
                    >
                      Return to search
                    </Button>
                  ) : undefined
                }
              >
                {submitError.message}
              </Alert>
            ) : null}

            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Full name"
                  {...register("name")}
                  error={Boolean(errors.name)}
                  helperText={errors.name?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Email"
                  {...register("email")}
                  error={Boolean(errors.email)}
                  helperText={errors.email?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Phone"
                  {...register("phone")}
                  error={Boolean(errors.phone)}
                  helperText={errors.phone?.message}
                />
              </Grid>
            </Grid>

            <Box display="flex" justifyContent="space-between">
              <Button
                variant="text"
                onClick={() => navigate("/booking/search")}
              >
                Back to search
              </Button>
              <Button
                variant="contained"
                onClick={onSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <CircularProgress size={22} color="inherit" />
                ) : (
                  "Create booking"
                )}
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Paper sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Typography variant="h6">Booking summary</Typography>
            <Typography variant="body2">
              Check-in: {selection.checkInDate}
            </Typography>
            <Typography variant="body2">
              Check-out: {selection.checkOutDate}
            </Typography>
            <Typography variant="body2">Room id: {selection.roomId}</Typography>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
}
