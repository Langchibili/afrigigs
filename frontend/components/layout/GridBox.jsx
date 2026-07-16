"use client";

/**
 * components/layout/GridBox.jsx
 * Thin wrapper over native CSS Grid. Accepts `columns` as either a number
 * or a breakpoint-keyed object ({ xs: 1, sm: 2, md: 3, lg: 4 }). Resolves
 * to display:grid; grid-template-columns: repeat(n, 1fr); with breakpoints
 * pulled from theme.breakpoints, so spacing stays token-consistent while
 * the layout math (asymmetric/featured layouts, masonry-style galleries)
 * stays fully custom — this is why MUI's Grid is not used in the project.
 */
import { Box, useTheme } from "@mui/material";

export default function GridBox({
  columns = 1,
  gap = 3,
  rowGap,
  columnGap,
  autoFlow,
  sx,
  children,
  ...rest
}) {
  const theme = useTheme();

  const templateColumns =
    typeof columns === "object"
      ? Object.fromEntries(
          Object.entries(columns).map(([bp, n]) =>
            bp === "xs"
              ? ["gridTemplateColumns", `repeat(${n}, 1fr)`]
              : [theme.breakpoints.up(bp), { gridTemplateColumns: `repeat(${n}, 1fr)` }]
          )
        )
      : { gridTemplateColumns: `repeat(${columns}, 1fr)` };

  return (
    <Box
      sx={{
        display: "grid",
        ...templateColumns,
        gap: rowGap || columnGap ? undefined : theme.spacing(gap),
        rowGap: rowGap ? theme.spacing(rowGap) : undefined,
        columnGap: columnGap ? theme.spacing(columnGap) : undefined,
        gridAutoFlow: autoFlow,
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}
