import { Box, Button, Container, Typography } from "@mui/material";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { NavigationBar } from "./components/NavigationBar";
import { BookingForm } from "./pages/BookingForm";
import { BookingsList } from "./pages/BookingsList";
import { SearchRooms } from "./pages/SearchRooms";

export default function App() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", position: "relative", pb: 4 }}>
      <NavigationBar />

      <Container maxWidth="lg" sx={{ mt: { xs: 2, md: 4 } }}>
        <Routes>
          <Route path="/" element={<Navigate to="/booking/search" replace />} />
          <Route path="/booking/search" element={<SearchRooms />} />
          <Route path="/booking/guest" element={<BookingForm />} />
          <Route path="/staff/bookings" element={<BookingsList />} />
          <Route
            path="*"
            element={
              <Box sx={{ py: 10, textAlign: "center" }}>
                <Typography variant="h4">Page not found</Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  The route does not exist in this prototype.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate("/booking/search")}
                >
                  Go to booking flow
                </Button>
              </Box>
            }
          />
        </Routes>
      </Container>
    </Box>
  );
}
