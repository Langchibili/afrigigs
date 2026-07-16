"use client";

/**
 * components/layout/Container.jsx
 * Max-width shell + responsive horizontal padding. Separate from MUI's
 * Container only in that it's part of our own primitive set for
 * consistency with Stack/GridBox — kept intentionally minimal.
 */
import { Box } from "@mui/material";

const MAX_WIDTHS = { sm: 640, md: 960, lg: 1200, xl: 1440, full: "100%" };

export default function Container({ maxWidth = "lg", disableGutters = false, sx, children, ...rest }) {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: MAX_WIDTHS[maxWidth],
        marginInline: "auto",
        paddingInline: disableGutters ? 0 : { xs: 2, sm: 3, md: 4 },
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}
