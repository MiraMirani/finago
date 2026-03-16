import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import type { AvailabilityResponseDto } from "../contracts";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { fetchAvailability } from "../api/api";
import { RoomCard } from "../components/RoomCard";

const searchSchema = z
  .object({
    checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    category: z.enum(["", "single", "double", "suite"]).optional(),
  })
  .refine((value) => value.checkInDate >= getTodayDateString(), {
    message: "Check-in must be today or later",
    path: ["checkInDate"],
  })
  .refine((value) => value.checkOutDate > value.checkInDate, {
    message: "Check-out must be after check-in",
    path: ["checkOutDate"],
  });

type SearchFormValues = z.infer<typeof searchSchema>;

function addDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function SearchRooms() {
  const navigate = useNavigate();
  const [availability, setAvailability] =
    useState<AvailabilityResponseDto | null>(null);
  const [lastSearchFilters, setLastSearchFilters] = useState<{
    checkInDate: string;
    checkOutDate: string;
    category: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      checkInDate: addDays(1),
      checkOutDate: addDays(3),
      category: "",
    },
  });

  const checkInDate = watch("checkInDate");
  const checkOutDate = watch("checkOutDate");
  const category = watch("category");

  const hasFiltersChangedSinceLastSearch =
    lastSearchFilters !== null &&
    (checkInDate !== lastSearchFilters.checkInDate ||
      checkOutDate !== lastSearchFilters.checkOutDate ||
      (category ?? "") !== lastSearchFilters.category);

  useEffect(() => {
    if (!hasFiltersChangedSinceLastSearch) {
      return;
    }

    setAvailability(null);
  }, [hasFiltersChangedSinceLastSearch]);

  const onSearch = handleSubmit(async (values) => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await fetchAvailability({
        checkInDate: values.checkInDate,
        checkOutDate: values.checkOutDate,
        category: values.category || undefined,
      });
      setAvailability(result);
      setLastSearchFilters({
        checkInDate: values.checkInDate,
        checkOutDate: values.checkOutDate,
        category: values.category ?? "",
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not load room availability",
      );
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          <Typography variant="h4">Find available rooms</Typography>
          <Typography color="text.secondary">
            Pick dates and optionally filter by room category.
          </Typography>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="checkInDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Check-in"
                      format="YYYY-MM-DD"
                      minDate={dayjs().startOf("day")}
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(value) =>
                        field.onChange(value ? value.format("YYYY-MM-DD") : "")
                      }
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: Boolean(errors.checkInDate),
                          helperText: errors.checkInDate?.message,
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="checkOutDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Check-out"
                      format="YYYY-MM-DD"
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(value) =>
                        field.onChange(value ? value.format("YYYY-MM-DD") : "")
                      }
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: Boolean(errors.checkOutDate),
                          helperText: errors.checkOutDate?.message,
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      label="Category (optional)"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    >
                      <MenuItem value="">Any category</MenuItem>
                      <MenuItem value="single">Single</MenuItem>
                      <MenuItem value="double">Double</MenuItem>
                      <MenuItem value="suite">Suite</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>

          <Box>
            <Button variant="contained" onClick={onSearch} disabled={isLoading}>
              {isLoading ? "Searching..." : "Search availability"}
            </Button>
          </Box>
        </Stack>
      </Paper>

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      {isLoading ? (
        <Paper sx={{ p: 4, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Paper>
      ) : null}

      {availability ? (
        <Paper sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "start", md: "center" }}
            >
              <Typography variant="h5">Available rooms</Typography>
              <Chip
                color="primary"
                variant="outlined"
                label={`${availability.nights} night${availability.nights === 1 ? "" : "s"}`}
              />
            </Stack>

            <Grid container spacing={2}>
              {availability.availableRooms.map((room) => {
                return (
                  <Grid key={room.roomId} size={{ xs: 12, md: 6 }}>
                    <RoomCard
                      room={room}
                      onSelect={() => {
                        const params = new URLSearchParams({
                          roomId: String(room.roomId),
                          checkInDate: availability.checkInDate,
                          checkOutDate: availability.checkOutDate,
                        });

                        navigate(`/booking/guest?${params.toString()}`);
                      }}
                    />
                  </Grid>
                );
              })}

              {availability.availableRooms.length === 0 ? (
                <Grid size={12}>
                  <Alert severity="warning">
                    No rooms are available for these dates. Try a different date
                    range.
                  </Alert>
                </Grid>
              ) : null}
            </Grid>
          </Stack>
        </Paper>
      ) : null}
    </Stack>
  );
}
