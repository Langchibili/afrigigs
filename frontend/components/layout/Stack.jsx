"use client";

/**
 * components/layout/Stack.jsx
 * Thin wrapper over CSS flexbox. Part of the custom layout primitive set
 * (Stack / GridBox / Container) that replaces MUI's Grid/Grid2 — that
 * component is never imported anywhere in this project.
 */
import { Box, useTheme } from "@mui/material";

export default function Stack({
  direction = "row",
  gap = 2,
  align,
  justify,
  wrap,
  sx,
  children,
  ...rest
}) {
  const theme = useTheme();

  const directionSx =
    typeof direction === "object"
      ? Object.fromEntries(
          Object.entries(direction).map(([bp, v]) =>
            bp === "xs" ? ["flexDirection", v] : [theme.breakpoints.up(bp), { flexDirection: v }]
          )
        )
      : { flexDirection: direction };

  return (
    <Box
      sx={{
        display: "flex",
        ...directionSx,
        gap: theme.spacing(gap),
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap,
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}
