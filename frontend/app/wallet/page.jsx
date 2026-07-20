// "use client";

// /**
//  * app/wallet/page.jsx — "/wallet"
//  * Escrow balance, withdrawal, transaction history, EscrowStatusTimeline
//  * per active job. Backend calls: GET /api/wallets?filters[user],
//  * GET /api/escrow-transactions?filters[job][owner],
//  * POST /api/escrow-transactions/:id/release (job-poster only)
//  */
// import { useCallback, useEffect, useState } from "react";
// import { Alert, Button, Chip, Divider, Skeleton, Typography } from "@mui/material";
// import Container from "@/components/layout/Container";
// import Stack from "@/components/layout/Stack";
// import WalletBalanceChip from "@/components/wallet/WalletBalanceChip";
// import { useRequireAuth } from "@/hooks/useRequireAuth";
// import { WalletApi } from "@/lib/endpoints";
// import { formatMoney, statusLabel, timeAgo } from "@/lib/format";

// export default function WalletPage() {
//   const { user } = useRequireAuth();
//   const [transactions, setTransactions] = useState(null);
//   const [error, setError] = useState(null);
//   const [releasingId, setReleasingId] = useState(null);

//   const load = useCallback(() => {
//     if (!user) return;
//     WalletApi.transactionsForOwner(user.id).then((r) => setTransactions(r.data ?? []));
//   }, [user]);

//   useEffect(load, [load]);

//   async function handleRelease(txId) {
//     setError(null);
//     setReleasingId(txId);
//     try {
//       await WalletApi.release(txId);
//       load();
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setReleasingId(null);
//     }
//   }

//   if (!user) return null;

//   return (
//     <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
//       <Typography variant="h1" sx={{ mb: 3, fontSize: 26 }}>
//         Wallet
//       </Typography>

//       <Stack sx={{ mb: 4 }}>
//         <WalletBalanceChip />
//       </Stack>

//       {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

//       <Typography variant="h2" sx={{ fontSize: 20, mb: 2 }}>
//         Escrow transactions for jobs you posted
//       </Typography>

//       {transactions === null ? (
//         <Skeleton variant="rounded" height={160} />
//       ) : transactions.length === 0 ? (
//         <Typography color="text.secondary">No escrow transactions yet.</Typography>
//       ) : (
//         <Stack direction="column" gap={0}>
//           {transactions.map((tx, i) => (
//             <div key={tx.id}>
//               <Stack justify="space-between" align="center" wrap="wrap" sx={{ py: 2 }}>
//                 <Stack direction="column" gap={0.25}>
//                   <Typography variant="body1" sx={{ fontWeight: 600 }}>
//                     {tx.job?.title}
//                   </Typography>
//                   <Typography variant="caption" color="text.secondary">
//                     {tx.gateway} · {timeAgo(tx.createdAt)}
//                   </Typography>
//                 </Stack>
//                 <Stack align="center" gap={2}>
//                   <Typography className="font-tabular" sx={{ color: "secondary.main" }}>
//                     {formatMoney(tx.amount, tx.currency)}
//                   </Typography>
//                   <Chip size="small" label={statusLabel(tx.status)} />
//                   {(tx.status === "held" || tx.status === "funded") && (
//                     <Button
//                       size="small"
//                       variant="contained"
//                       disabled={releasingId === tx.id}
//                       onClick={() => handleRelease(tx.id)}
//                     >
//                       {releasingId === tx.id ? "Releasing…" : "Release funds"}
//                     </Button>
//                   )}
//                 </Stack>
//               </Stack>
//               {i < transactions.length - 1 && <Divider />}
//             </div>
//           ))}
//         </Stack>
//       )}
//     </Container>
//   );
// }
"use client";

/**
 * app/wallet/page.jsx — "/wallet"
 * Escrow balance, withdrawal, transaction history, EscrowStatusTimeline
 * per active job. Backend calls: GET /api/wallets?filters[user],
 * GET /api/escrow-transactions?filters[job][owner],
 * POST /api/escrow-transactions/:id/release (job-poster only)
 */
import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Chip, Divider, Skeleton, Typography } from "@mui/material";
import Container from "@/components/layout/Container";
import Stack from "@/components/layout/Stack";
import WalletBalanceChip from "@/components/wallet/WalletBalanceChip";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { WalletApi } from "@/lib/endpoints";
import { formatMoney, statusLabel, timeAgo } from "@/lib/format";

export default function WalletPage() {
  const { user } = useRequireAuth();
  const [transactions, setTransactions] = useState(null);
  const [error, setError] = useState(null);
  const [releasingId, setReleasingId] = useState(null);

  const load = useCallback(() => {
    if (!user) return;
    WalletApi.myTransactions().then((r) => setTransactions(r.data ?? []));
  }, [user]);

  useEffect(load, [load]);

  async function handleRelease(txId) {
    setError(null);
    setReleasingId(txId);
    try {
      await WalletApi.release(txId);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setReleasingId(null);
    }
  }

  if (!user) return null;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <Typography variant="h1" sx={{ mb: 3, fontSize: 26 }}>
        Wallet
      </Typography>

      <Stack sx={{ mb: 4 }}>
        <WalletBalanceChip />
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Typography variant="h2" sx={{ fontSize: 20, mb: 2 }}>
        Escrow transactions for jobs you posted
      </Typography>

      {transactions === null ? (
        <Skeleton variant="rounded" height={160} />
      ) : transactions.length === 0 ? (
        <Typography color="text.secondary">No escrow transactions yet.</Typography>
      ) : (
        <Stack direction="column" gap={0}>
          {transactions.map((tx, i) => (
            <div key={tx.id}>
              <Stack justify="space-between" align="center" wrap="wrap" sx={{ py: 2 }}>
                <Stack direction="column" gap={0.25}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {tx.job?.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {tx.gateway} · {timeAgo(tx.createdAt)}
                  </Typography>
                </Stack>
                <Stack align="center" gap={2}>
                  <Typography className="font-tabular" sx={{ color: "secondary.main" }}>
                    {formatMoney(tx.amount, tx.currency)}
                  </Typography>
                  <Chip size="small" label={statusLabel(tx.status)} />
                  {(tx.status === "held" || tx.status === "funded") && (
                    <Button
                      size="small"
                      variant="contained"
                      disabled={releasingId === tx.id}
                      onClick={() => handleRelease(tx.id)}
                    >
                      {releasingId === tx.id ? "Releasing…" : "Release funds"}
                    </Button>
                  )}
                </Stack>
              </Stack>
              {i < transactions.length - 1 && <Divider />}
            </div>
          ))}
        </Stack>
      )}
    </Container>
  );
}