// "use client";

// /**
//  * app/messages/[conversationId]/page.jsx — "/messages/[conversationId]"
//  * Per-job chat thread. Backend calls: GET /api/conversations/:id?populate=...,
//  * POST /api/messages
//  */
// import { useCallback, useEffect, useRef, useState } from "react";
// import { useParams } from "next/navigation";
// import { Avatar, Box, IconButton, Skeleton, TextField, Typography } from "@mui/material";
// import { Send } from "lucide-react";
// import { AnimatePresence, motion } from "framer-motion";
// import Container from "@/components/layout/Container";
// import Stack from "@/components/layout/Stack";
// import { useRequireAuth } from "@/hooks/useRequireAuth";
// import { MessagingApi } from "@/lib/endpoints";
// import { initials, timeAgo } from "@/lib/format";

// export default function MessageThreadPage() {
//   const { conversationId } = useParams();
//   const { user } = useRequireAuth();
//   const [conversation, setConversation] = useState(null);
//   const [body, setBody] = useState("");
//   const [sending, setSending] = useState(false);
//   const bottomRef = useRef(null);

//   const load = useCallback(() => {
//     MessagingApi.getConversation(conversationId).then((r) => setConversation(r.data));
//   }, [conversationId]);

//   useEffect(load, [load]);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [conversation?.messages?.length]);

//   async function handleSend(e) {
//     e.preventDefault();
//     if (!body.trim() || !user) return;
//     setSending(true);
//     try {
//       await MessagingApi.sendMessage({ conversation: Number(conversationId), sender: user.id, body });
//       setBody("");
//       load();
//     } finally {
//       setSending(false);
//     }
//   }

//   if (!user || !conversation) {
//     return (
//       <Container maxWidth="sm" sx={{ py: 6 }}>
//         <Skeleton variant="rounded" height={300} />
//       </Container>
//     );
//   }

//   return (
//     <Container maxWidth="sm" sx={{ py: { xs: 3, md: 5 }, display: "flex", flexDirection: "column", minHeight: "70vh" }}>
//       <Typography variant="h2" sx={{ fontSize: 18, mb: 2 }}>
//         {conversation.job?.title}
//       </Typography>

//       <Stack direction="column" gap={1.5} sx={{ flex: 1, overflowY: "auto", mb: 2 }}>
//         <AnimatePresence initial={false}>
//           {(conversation.messages ?? []).map((msg) => {
//             const isMine = msg.sender?.id === user.id;
//             return (
//               <motion.div
//                 key={msg.id}
//                 initial={{ opacity: 0, y: 8 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}
//               >
//                 <Stack align="flex-end" gap={0.75} sx={{ maxWidth: "80%" }}>
//                   {!isMine && (
//                     <Avatar sx={{ width: 26, height: 26, fontSize: 11, bgcolor: "primary.dark" }}>
//                       {initials(msg.sender?.username)}
//                     </Avatar>
//                   )}
//                   <Box
//                     sx={{
//                       px: 1.75,
//                       py: 1,
//                       borderRadius: 3,
//                       backgroundColor: isMine ? "primary.main" : "rgba(255,255,255,0.06)",
//                       color: isMine ? "#0A0A0A" : "text.primary",
//                     }}
//                   >
//                     <Typography variant="body2">{msg.body}</Typography>
//                   </Box>
//                 </Stack>
//               </motion.div>
//             );
//           })}
//         </AnimatePresence>
//         <div ref={bottomRef} />
//       </Stack>

//       <Stack
//         component="form"
//         onSubmit={handleSend}
//         align="center"
//         gap={1}
//         sx={{ borderTop: (t) => `1px solid ${t.palette.divider}`, pt: 2 }}
//       >
//         <TextField
//           fullWidth
//           placeholder="Write a message…"
//           value={body}
//           onChange={(e) => setBody(e.target.value)}
//           size="small"
//         />
//         <IconButton type="submit" color="primary" disabled={sending || !body.trim()}>
//           <Send size={18} />
//         </IconButton>
//       </Stack>
//     </Container>
//   );
// }
"use client";

/**
 * app/messages/[conversationId]/page.jsx — "/messages/[conversationId]"
 * Per-job chat thread. Backend calls: GET /api/conversations/:id?populate=...,
 * POST /api/messages
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Avatar, Box, IconButton, Skeleton, TextField, Typography } from "@mui/material";
import { Send } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Container from "@/components/layout/Container";
import Stack from "@/components/layout/Stack";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { MessagingApi } from "@/lib/endpoints";
import { initials, timeAgo } from "@/lib/format";

export default function MessageThreadPage() {
  const { conversationId } = useParams();
  const { user } = useRequireAuth();
  const [conversation, setConversation] = useState(null);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const load = useCallback(() => {
    MessagingApi.getConversation(conversationId).then((r) => setConversation(r.data));
  }, [conversationId]);

  useEffect(load, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages?.length]);

  async function handleSend(e) {
    e.preventDefault();
    if (!body.trim() || !user) return;
    setSending(true);
    try {
      await MessagingApi.sendMessage({ conversation: conversationId, sender: user.documentId, body });
      setBody("");
      load();
    } finally {
      setSending(false);
    }
  }

  if (!user || !conversation) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Skeleton variant="rounded" height={300} />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 3, md: 5 }, display: "flex", flexDirection: "column", minHeight: "70vh" }}>
      <Typography variant="h2" sx={{ fontSize: 18, mb: 2 }}>
        {conversation.job?.title}
      </Typography>

      <Stack direction="column" gap={1.5} sx={{ flex: 1, overflowY: "auto", mb: 2 }}>
        <AnimatePresence initial={false}>
          {(conversation.messages ?? []).map((msg) => {
            const isMine = msg.sender?.documentId === user.documentId;
            return (
              <motion.div
                key={msg.documentId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}
              >
                <Stack align="flex-end" gap={0.75} sx={{ maxWidth: "80%" }}>
                  {!isMine && (
                    <Avatar sx={{ width: 26, height: 26, fontSize: 11, bgcolor: "primary.dark" }}>
                      {initials(msg.sender?.username)}
                    </Avatar>
                  )}
                  <Box
                    sx={{
                      px: 1.75,
                      py: 1,
                      borderRadius: 3,
                      backgroundColor: isMine ? "primary.main" : "rgba(255,255,255,0.06)",
                      color: isMine ? "#0A0A0A" : "text.primary",
                    }}
                  >
                    <Typography variant="body2">{msg.body}</Typography>
                  </Box>
                </Stack>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </Stack>

      <Stack
        component="form"
        onSubmit={handleSend}
        align="center"
        gap={1}
        sx={{ borderTop: (t) => `1px solid ${t.palette.divider}`, pt: 2 }}
      >
        <TextField
          fullWidth
          placeholder="Write a message…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          size="small"
        />
        <IconButton type="submit" color="primary" disabled={sending || !body.trim()}>
          <Send size={18} />
        </IconButton>
      </Stack>
    </Container>
  );
}