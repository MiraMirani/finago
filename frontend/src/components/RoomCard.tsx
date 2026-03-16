import { Button, Paper, Stack, Typography } from "@mui/material";
import type { RoomDto } from "../contracts";

interface RoomCardProps {
  room: RoomDto;
  onSelect: () => void;
}

export function RoomCard({ room, onSelect }: RoomCardProps) {
  return (
    <Paper
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      sx={{
        p: 2,
        borderColor: "divider",
        borderWidth: 2,
        borderStyle: "solid",
        cursor: "pointer",
        transition: "border-color 120ms ease, box-shadow 120ms ease",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: 1,
        },
      }}
    >
      <Stack spacing={1.5}>
        <Typography variant="h6">
          Room {room.roomNumber} · {room.category}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Room ID: {room.roomId}
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={(event) => {
            event.stopPropagation();
            onSelect();
          }}
        >
          Select room
        </Button>
      </Stack>
    </Paper>
  );
}
