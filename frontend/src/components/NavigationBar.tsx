import HotelRoundedIcon from "@mui/icons-material/HotelRounded";
import { AppBar, Box, Button, Stack, Toolbar, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

export function NavigationBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const onBookingFlow = location.pathname.startsWith("/booking");
  const onStaffView = location.pathname.startsWith("/staff");

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="transparent"
      sx={{ backdropFilter: "blur(12px)" }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(109, 40, 217, 0.16)",
        }}
      >
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <HotelRoundedIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
              Finago Hotel
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Search deals on hotels, homes, and much more...
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button
            variant={onBookingFlow ? "contained" : "text"}
            onClick={() => navigate("/booking/search")}
          >
            Booking
          </Button>
          <Button
            variant={onStaffView ? "contained" : "text"}
            onClick={() => navigate("/staff/bookings")}
          >
            History
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
