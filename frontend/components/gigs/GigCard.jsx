// "use client";

// /**
//  * components/gigs/GigCard.jsx
//  * Compact/expanded gig card. Shows title, budget, scope badge, bid count,
//  * target city. Uses the `layout` prop so re-sorting (proximity/trust
//  * ranking) animates position changes rather than jump-cutting.
//  */
// import Link from "next/link";
// import { Box, Card, CardActionArea, Chip, Typography } from "@mui/material";
// import { motion } from "framer-motion";
// import { MapPin, Globe } from "lucide-react";
// import Stack from "@/components/layout/Stack";
// import { formatMoney, timeAgo } from "@/lib/format";

// export default function GigCard({ job, variant = "compact" }) {
//   const isGlobal = job.scope === "FOR_EVERYONE";
//   const bidCount = job.bids?.length ?? job.bidCount ?? 0;

//   return (
//     <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
//       <Card
//         elevation={1}
//         sx={{
//           borderRadius: 3,
//           transition: "box-shadow 0.2s ease, transform 0.2s ease",
//           "&:hover": { boxShadow: 2, transform: "translateY(-2px)" },
//         }}
//       >
//         <CardActionArea component={Link} href={`/gigs/${job.id}`} sx={{ p: 2.5 }}>
//           <Stack direction="column" gap={1.25}>
//             <Stack justify="space-between" align="flex-start">
//               <Typography variant="h3" sx={{ fontSize: 16, lineHeight: 1.3 }}>
//                 {job.title}
//               </Typography>
//               <Chip
//                 size="small"
//                 icon={isGlobal ? <Globe size={12} /> : <MapPin size={12} />}
//                 label={isGlobal ? "Global" : job.target_city || "Local"}
//                 sx={{ flexShrink: 0, backgroundColor: "rgba(255,255,255,0.06)" }}
//               />
//             </Stack>

//             {variant === "expanded" && (
//               <Typography
//                 variant="body2"
//                 color="text.secondary"
//                 sx={{
//                   display: "-webkit-box",
//                   WebkitLineClamp: 2,
//                   WebkitBoxOrient: "vertical",
//                   overflow: "hidden",
//                 }}
//               >
//                 {job.description?.replace(/<[^>]+>/g, "")}
//               </Typography>
//             )}

//             <Stack gap={0.75} wrap="wrap">
//               {(job.skills_required ?? []).slice(0, 3).map((s) => (
//                 <Chip key={s.id} size="small" label={s.name} variant="outlined" />
//               ))}
//             </Stack>

//             <Stack justify="space-between" align="center" sx={{ mt: 0.5 }}>
//               <Typography variant="subtitle1" className="font-tabular" sx={{ color: "secondary.main" }}>
//                 {formatMoney(job.budget_amount, job.budget_currency)}
//               </Typography>
//               <Typography variant="caption" color="text.secondary">
//                 {bidCount} bid{bidCount === 1 ? "" : "s"} · {timeAgo(job.createdAt)}
//               </Typography>
//             </Stack>
//           </Stack>
//         </CardActionArea>
//       </Card>
//     </motion.div>
//   );
// }
"use client";

/**
 * components/gigs/GigCard.jsx
 * Compact/expanded gig card. Shows title, budget, scope badge, bid count,
 * target city. Uses the `layout` prop so re-sorting (proximity/trust
 * ranking) animates position changes rather than jump-cutting.
 */
import Link from "next/link";
import { Box, Card, CardActionArea, Chip, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { MapPin, Globe } from "lucide-react";
import Stack from "@/components/layout/Stack";
import { formatMoney, timeAgo } from "@/lib/format";

export default function GigCard({ job, variant = "compact" }) {
  const isGlobal = job.scope === "FOR_EVERYONE";
  const bidCount = job.bids?.length ?? job.bidCount ?? 0;

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card
        elevation={1}
        sx={{
          borderRadius: 3,
          transition: "box-shadow 0.2s ease, transform 0.2s ease",
          "&:hover": { boxShadow: 2, transform: "translateY(-2px)" },
        }}
      >
        <CardActionArea component={Link} href={`/gigs/${job.documentId}`} sx={{ p: 2.5 }}>
          <Stack direction="column" gap={1.25}>
            <Stack justify="space-between" align="flex-start">
              <Typography variant="h3" sx={{ fontSize: 16, lineHeight: 1.3 }}>
                {job.title}
              </Typography>
              <Chip
                size="small"
                icon={isGlobal ? <Globe size={12} /> : <MapPin size={12} />}
                label={isGlobal ? "Global" : job.target_city || "Local"}
                sx={{ flexShrink: 0, backgroundColor: "rgba(255,255,255,0.06)" }}
              />
            </Stack>

            {variant === "expanded" && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {job.description?.replace(/<[^>]+>/g, "")}
              </Typography>
            )}

            <Stack gap={0.75} wrap="wrap">
              {(job.skills_required ?? []).slice(0, 3).map((s) => (
                <Chip key={s.documentId} size="small" label={s.name} variant="outlined" />
              ))}
            </Stack>

            <Stack justify="space-between" align="center" sx={{ mt: 0.5 }}>
              <Typography variant="subtitle1" className="font-tabular" sx={{ color: "secondary.main" }}>
                {formatMoney(job.budget_amount, job.budget_currency)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {bidCount} bid{bidCount === 1 ? "" : "s"} · {timeAgo(job.createdAt)}
              </Typography>
            </Stack>
          </Stack>
        </CardActionArea>
      </Card>
    </motion.div>
  );
}