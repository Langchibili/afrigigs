// "use client";

// /**
//  * app/messages/page.jsx — "/messages"
//  * Conversation list. Backend call:
//  * GET /api/conversations?filters[participants][id]=:me&populate=job,messages
//  */
// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { Avatar, Badge, Divider, Skeleton, Typography } from "@mui/material";
// import Container from "@/components/layout/Container";
// import Stack from "@/components/layout/Stack";
// import { useRequireAuth } from "@/hooks/useRequireAuth";
// import { MessagingApi } from "@/lib/endpoints";
// import { initials, timeAgo } from "@/lib/format";

// export default function MessagesListPage() {
//   const { user } = useRequireAuth();
//   const [conversations, setConversations] = useState(null);

//   useEffect(() => {
//     if (!user) return;
//     MessagingApi.listConversations(user.id).then((r) => setConversations(r.data ?? []));
//   }, [user]);

//   if (!user) return null;

//   return (
//     <Container maxWidth="sm" sx={{ py: { xs: 4, md: 6 } }}>
//       <Typography variant="h1" sx={{ mb: 3, fontSize: 26 }}>
//         Messages
//       </Typography>

//       {conversations === null ? (
//         <Skeleton variant="rounded" height={200} />
//       ) : conversations.length === 0 ? (
//         <Typography color="text.secondary">
//           No conversations yet — they start once you're bidding on or managing a job.
//         </Typography>
//       ) : (
//         <Stack direction="column" gap={0}>
//           {conversations.map((conv, i) => {
//             const otherPerson = (conv.participants ?? []).find((p) => p.id !== user.id);
//             const lastMessage = conv.messages?.[conv.messages.length - 1];
//             const unreadCount = (conv.messages ?? []).filter(
//               (m) => !m.read_at && m.sender?.id !== user.id
//             ).length;

//             return (
//               <div key={conv.id}>
//                 <Link href={`/messages/${conv.id}`} style={{ textDecoration: "none", color: "inherit" }}>
//                   <Stack align="center" gap={1.5} sx={{ py: 2 }}>
//                     <Badge badgeContent={unreadCount} color="primary">
//                       <Avatar sx={{ bgcolor: "primary.dark" }}>{initials(otherPerson?.username)}</Avatar>
//                     </Badge>
//                     <Stack direction="column" gap={0.25} sx={{ flex: 1, minWidth: 0 }}>
//                       <Typography variant="body1" sx={{ fontWeight: 600 }}>
//                         {otherPerson?.username ?? "Unknown"} · {conv.job?.title}
//                       </Typography>
//                       <Typography
//                         variant="body2"
//                         color="text.secondary"
//                         noWrap
//                         sx={{ maxWidth: 380 }}
//                       >
//                         {lastMessage?.body ?? "No messages yet"}
//                       </Typography>
//                     </Stack>
//                     <Typography variant="caption" color="text.secondary">
//                       {timeAgo(lastMessage?.createdAt)}
//                     </Typography>
//                   </Stack>
//                 </Link>
//                 {i < conversations.length - 1 && <Divider />}
//               </div>
//             );
//           })}
//         </Stack>
//       )}
//     </Container>
//   );
// }
"use client";

/**
 * app/messages/page.jsx — "/messages"
 * Conversation list. Backend call:
 * GET /api/conversations?filters[participants][id]=:me&populate=job,messages
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, Badge, Divider, Skeleton, Typography } from "@mui/material";
import Container from "@/components/layout/Container";
import Stack from "@/components/layout/Stack";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { MessagingApi } from "@/lib/endpoints";
import { initials, timeAgo } from "@/lib/format";

export default function MessagesListPage() {
  const { user } = useRequireAuth();
  const [conversations, setConversations] = useState(null);

  useEffect(() => {
    if (!user) return;
    MessagingApi.mine().then((r) => setConversations(r.data ?? []));
  }, [user]);

  if (!user) return null;

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 6 } }}>
      <Typography variant="h1" sx={{ mb: 3, fontSize: 26 }}>
        Messages
      </Typography>

      {conversations === null ? (
        <Skeleton variant="rounded" height={200} />
      ) : conversations.length === 0 ? (
        <Typography color="text.secondary">
          No conversations yet — they start once you're bidding on or managing a job.
        </Typography>
      ) : (
        <Stack direction="column" gap={0}>
          {conversations.map((conv, i) => {
            const otherPerson = (conv.participants ?? []).find((p) => p.id !== user.id);
            const lastMessage = conv.messages?.[conv.messages.length - 1];
            const unreadCount = (conv.messages ?? []).filter(
              (m) => !m.read_at && m.sender?.id !== user.id
            ).length;

            return (
              <div key={conv.id}>
                <Link href={`/messages/${conv.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <Stack align="center" gap={1.5} sx={{ py: 2 }}>
                    <Badge badgeContent={unreadCount} color="primary">
                      <Avatar sx={{ bgcolor: "primary.dark" }}>{initials(otherPerson?.username)}</Avatar>
                    </Badge>
                    <Stack direction="column" gap={0.25} sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {otherPerson?.username ?? "Unknown"} · {conv.job?.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                        sx={{ maxWidth: 380 }}
                      >
                        {lastMessage?.body ?? "No messages yet"}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {timeAgo(lastMessage?.createdAt)}
                    </Typography>
                  </Stack>
                </Link>
                {i < conversations.length - 1 && <Divider />}
              </div>
            );
          })}
        </Stack>
      )}
    </Container>
  );
}