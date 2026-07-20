// "use client";

// /**
//  * components/wallet/WalletBalanceChip.jsx
//  * Tabular-figure balance display. `compact` renders a small navbar chip;
//  * otherwise a full gradient card (see theme.custom.gradients.walletCard).
//  */
// import { useEffect, useState } from "react";
// import { Box, Chip, Typography, Skeleton } from "@mui/material";
// import { Wallet } from "lucide-react";
// import Stack from "@/components/layout/Stack";
// import { WalletApi } from "@/lib/endpoints";
// import { useAuth } from "@/lib/auth-context";
// import { formatMoney } from "@/lib/format";

// export default function WalletBalanceChip({ compact = false }) {
//   const { user } = useAuth();
//   const [wallet, setWallet] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!user) return;
//     WalletApi.getForUser(user.id)
//       .then((res) => setWallet(res.data?.[0] ?? null))
//       .catch(() => setWallet(null))
//       .finally(() => setLoading(false));
//   }, [user]);

//   if (loading) return <Skeleton variant="rounded" width={compact ? 90 : 180} height={compact ? 28 : 72} />;

//   const balanceText = wallet ? formatMoney(wallet.balance, wallet.currency) : formatMoney(0, null);

//   if (compact) {
//     return (
//       <Chip
//         size="small"
//         icon={<Wallet size={14} />}
//         label={<span className="font-tabular">{balanceText}</span>}
//         sx={{ backgroundColor: "rgba(0,191,166,0.12)", color: "primary.light" }}
//       />
//     );
//   }

//   return (
//     <Box
//       sx={{
//         p: 2.5,
//         borderRadius: 3,
//         backgroundImage: (t) => t.custom.gradients.walletCard,
//         border: (t) => `1px solid ${t.custom.glassBorder}`,
//       }}
//     >
//       <Stack direction="column" gap={0.5}>
//         <Typography variant="caption" color="text.secondary">
//           Available balance
//         </Typography>
//         <Typography variant="h1" className="font-tabular">
//           {balanceText}
//         </Typography>
//         {wallet?.pending_balance > 0 && (
//           <Typography variant="caption" color="text.secondary">
//             + {formatMoney(wallet.pending_balance, wallet.currency)} pending
//           </Typography>
//         )}
//       </Stack>
//     </Box>
//   );
// }
"use client";

/**
 * components/wallet/WalletBalanceChip.jsx
 * Tabular-figure balance display. `compact` renders a small navbar chip;
 * otherwise a full gradient card (see theme.custom.gradients.walletCard).
 */
import { useEffect, useState } from "react";
import { Box, Chip, Typography, Skeleton } from "@mui/material";
import { Wallet } from "lucide-react";
import Stack from "@/components/layout/Stack";
import { WalletApi } from "@/lib/endpoints";
import { useAuth } from "@/lib/auth-context";
import { formatMoney } from "@/lib/format";

export default function WalletBalanceChip({ compact = false }) {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    WalletApi.getMine()
      .then((res) => setWallet(res.data ?? null))
      .catch(() => setWallet(null))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <Skeleton variant="rounded" width={compact ? 90 : 180} height={compact ? 28 : 72} />;

  const balanceText = wallet ? formatMoney(wallet.balance, wallet.currency) : formatMoney(0, null);

  if (compact) {
    return (
      <Chip
        size="small"
        icon={<Wallet size={14} />}
        label={<span className="font-tabular">{balanceText}</span>}
        sx={{ backgroundColor: "rgba(0,191,166,0.12)", color: "primary.light" }}
      />
    );
  }

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 3,
        backgroundImage: (t) => t.custom.gradients.walletCard,
        border: (t) => `1px solid ${t.custom.glassBorder}`,
      }}
    >
      <Stack direction="column" gap={0.5}>
        <Typography variant="caption" color="text.secondary">
          Available balance
        </Typography>
        <Typography variant="h1" className="font-tabular">
          {balanceText}
        </Typography>
        {wallet?.pending_balance > 0 && (
          <Typography variant="caption" color="text.secondary">
            + {formatMoney(wallet.pending_balance, wallet.currency)} pending
          </Typography>
        )}
      </Stack>
    </Box>
  );
}