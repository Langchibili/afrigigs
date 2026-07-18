"use client";

/**
 * components/shared/SwipeModeBar.jsx
 * A swipeable pill shown just below the header. Displays "Swipe to hire
 * someone instead" while in work mode, or "Swipe to find work instead"
 * while in hire mode. Dragging the handle past the threshold calls
 * toggleMode(), which flips lib/mode-context and re-themes the app
 * (green for work, orange for hire).
 */
import { Box, Typography, useTheme } from "@mui/material";
import { motion, useMotionValue } from "framer-motion";
import { ArrowRightLeft } from "lucide-react";
import { useMode } from "@/lib/mode-context";

const TRACK_WIDTH = 300;
const HANDLE_SIZE = 40;
const PADDING = 4;

export default function SwipeModeBar() {
  const { mode, toggleMode } = useMode();
  const theme = useTheme();
  const x = useMotionValue(0);
  const maxDrag = TRACK_WIDTH - HANDLE_SIZE - PADDING * 2;

  const label = mode === "work" ? "Swipe to hire someone instead" : "Swipe to find work instead";
  const handleColor = theme.palette.primary.main;

  function handleDragEnd(_, info) {
    if (info.offset.x > maxDrag * 0.55 || info.offset.x < -maxDrag * 0.55) {
      toggleMode();
    }
    x.set(0);
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 1.5 }}>
      <Box
        sx={{
          position: "relative",
          width: TRACK_WIDTH,
          maxWidth: "90vw",
          height: HANDLE_SIZE + PADDING * 2,
          borderRadius: 999,
          backgroundColor: "rgba(255,255,255,0.05)",
          border: (t) => `1px solid ${t.palette.divider}`,
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            textAlign: "center",
            fontWeight: 600,
            pointerEvents: "none",
            color: "text.secondary",
          }}
        >
          {label}
        </Typography>
        <motion.div
          drag="x"
          dragConstraints={{ left: -maxDrag, right: maxDrag }}
          dragElastic={0.15}
          onDragEnd={handleDragEnd}
          style={{
            x,
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            borderRadius: "50%",
            background: handleColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "grab",
            marginLeft: PADDING,
            zIndex: 1,
            touchAction: "pan-y",
          }}
          whileTap={{ cursor: "grabbing", scale: 1.05 }}
        >
          <ArrowRightLeft size={16} color="#0A0A0A" />
        </motion.div>
      </Box>
    </Box>
  );
}
