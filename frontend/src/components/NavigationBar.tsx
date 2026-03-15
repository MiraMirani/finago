import { AppBar, Box, Button, Stack, Toolbar, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import finagoLogo from "../assets/finago-logo.png";

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
      sx={{ backdropFilter: "blur(12px)", height: 82 }}
    >
      <Toolbar
        sx={{
          minHeight: "82px !important",
          height: 82,
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(109, 40, 217, 0.16)",
        }}
      >
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Box
            component="img"
            src={finagoLogo}
            alt="Finago logo"
            sx={{
              width: 140,
              height: 82,
              objectFit: "contain",
              display: "block",
            }}
          />
          <Box>
            <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                Staff Dashboard
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
