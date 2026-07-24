// "use client";

// /**
//  * app/verify/page.jsx — "/verify"
//  * Scripted video-selfie upload per the blueprint. Backend calls:
//  * POST /api/upload (video file), POST /api/verification-submissions,
//  * GET /api/verification-submissions?filters[user][id]=:me (poll status)
//  */
// import { useEffect, useState } from "react";
// import { Alert, Box, Button, Typography } from "@mui/material";
// import { Upload, Video } from "lucide-react";
// import Container from "@/components/layout/Container";
// import Stack from "@/components/layout/Stack";
// import VerifiedTag from "@/components/shared/VerifiedTag";
// import { useRequireAuth } from "@/hooks/useRequireAuth";
// import { VerificationApi } from "@/lib/endpoints";

// export default function VerifyPage() {
//   const { user } = useRequireAuth();
//   const [file, setFile] = useState(null);
//   const [status, setStatus] = useState(null); // null | 'pending' | 'approved' | 'rejected'
//   const [error, setError] = useState(null);
//   const [submitting, setSubmitting] = useState(false);

//   useEffect(() => {
//     if (!user) return;
//     VerificationApi.statusForUser(user.id).then((r) => setStatus(r.data?.[0]?.status ?? null));
//   }, [user]);

//   async function handleSubmit() {
//     if (!file || !user) return;
//     setError(null);
//     setSubmitting(true);
//     try {
//       const uploaded = await VerificationApi.uploadVideo(file);
//       const mediaId = uploaded[0]?.id;
//       await VerificationApi.submit(user.id, mediaId);
//       setStatus("pending");
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   if (!user) return null;

//   if (user.is_verified_human) {
//     return (
//       <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
//         <VerifiedTag verified />
//         <Typography variant="h2" sx={{ mt: 2 }}>
//           You're verified
//         </Typography>
//       </Container>
//     );
//   }

//   return (
//     <Container maxWidth="sm" sx={{ py: { xs: 5, md: 8 } }}>
//       <Typography variant="h1" sx={{ mb: 1.5, fontSize: 26 }}>
//         Verify your profile
//       </Typography>
//       <Typography color="text.secondary" sx={{ mb: 3 }}>
//         Record a short video following the script below, then upload it. An admin reviews every
//         submission before your Unverified badge is cleared.
//       </Typography>

//       <Box
//         sx={{
//           p: 2.5,
//           mb: 3,
//           borderRadius: 2,
//           border: (t) => `1px dashed ${t.palette.divider}`,
//           backgroundColor: "rgba(0,191,166,0.05)",
//         }}
//       >
//         <Stack align="flex-start" gap={1.5}>
//           <Video size={20} color="#00BFA6" style={{ flexShrink: 0, marginTop: 2 }} />
//           <Typography variant="body2">
//             "Hold your ID next to your face, state today's date, and speak: 'I verify my profile on
//             AfriGigs.'"
//           </Typography>
//         </Stack>
//       </Box>

//       {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

//       {status === "pending" ? (
//         <Alert severity="info">Your video is pending review. We'll update your badge once an admin approves it.</Alert>
//       ) : status === "rejected" ? (
//         <Stack direction="column" gap={2}>
//           <Alert severity="warning">Your last submission was rejected. Please try again.</Alert>
//           <UploadControls file={file} setFile={setFile} onSubmit={handleSubmit} submitting={submitting} />
//         </Stack>
//       ) : (
//         <UploadControls file={file} setFile={setFile} onSubmit={handleSubmit} submitting={submitting} />
//       )}
//     </Container>
//   );
// }

// function UploadControls({ file, setFile, onSubmit, submitting }) {
//   return (
//     <Stack direction="column" gap={2}>
//       <Button variant="outlined" component="label" startIcon={<Upload size={16} />}>
//         {file ? file.name : "Choose video file"}
//         <input hidden type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
//       </Button>
//       <Button variant="contained" disabled={!file || submitting} onClick={onSubmit}>
//         {submitting ? "Uploading…" : "Submit for review"}
//       </Button>
//     </Stack>
//   );
// }
"use client";

/**
 * app/verify/page.jsx — "/verify"
 * Scripted video-selfie upload per the blueprint. Backend calls:
 * POST /api/upload (video file), POST /api/verification-submissions,
 * GET /api/verification-submissions?filters[user][id]=:me (poll status)
 */
import { useEffect, useState } from "react";
import { Alert, Box, Button, Typography } from "@mui/material";
import { Upload, Video } from "lucide-react";
import Container from "@/components/layout/Container";
import Stack from "@/components/layout/Stack";
import VerifiedTag from "@/components/shared/VerifiedTag";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { VerificationApi } from "@/lib/endpoints";

export default function VerifyPage() {
  const { user } = useRequireAuth();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null); // null | 'pending' | 'approved' | 'rejected'
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    VerificationApi.statusForUser(user.documentId).then((r) => setStatus(r.data?.[0]?.status ?? null));
  }, [user]);

  async function handleSubmit() {
    if (!file || !user) return;
    setError(null);
    setSubmitting(true);
    try {
      const uploaded = await VerificationApi.uploadVideo(file);
      const mediaId = uploaded[0]?.documentId;
      await VerificationApi.submit(user.documentId, mediaId);
      setStatus("pending");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) return null;

  if (user.is_verified_human) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
        <VerifiedTag verified />
        <Typography variant="h2" sx={{ mt: 2 }}>
          You're verified
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 5, md: 8 } }}>
      <Typography variant="h1" sx={{ mb: 1.5, fontSize: 26 }}>
        Verify your profile
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Record a short video following the script below, then upload it. An admin reviews every
        submission before your Unverified badge is cleared.
      </Typography>

      <Box
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 2,
          border: (t) => `1px dashed ${t.palette.divider}`,
          backgroundColor: "rgba(0,191,166,0.05)",
        }}
      >
        <Stack align="flex-start" gap={1.5}>
          <Video size={20} color="#00BFA6" style={{ flexShrink: 0, marginTop: 2 }} />
          <Typography variant="body2">
            "Hold your ID next to your face, state today's date, and speak: 'I verify my profile on
            AfriGigs.'"
          </Typography>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {status === "pending" ? (
        <Alert severity="info">Your video is pending review. We'll update your badge once an admin approves it.</Alert>
      ) : status === "rejected" ? (
        <Stack direction="column" gap={2}>
          <Alert severity="warning">Your last submission was rejected. Please try again.</Alert>
          <UploadControls file={file} setFile={setFile} onSubmit={handleSubmit} submitting={submitting} />
        </Stack>
      ) : (
        <UploadControls file={file} setFile={setFile} onSubmit={handleSubmit} submitting={submitting} />
      )}
    </Container>
  );
}

function UploadControls({ file, setFile, onSubmit, submitting }) {
  return (
    <Stack direction="column" gap={2}>
      <Button variant="outlined" component="label" startIcon={<Upload size={16} />}>
        {file ? file.name : "Choose video file"}
        <input hidden type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </Button>
      <Button variant="contained" disabled={!file || submitting} onClick={onSubmit}>
        {submitting ? "Uploading…" : "Submit for review"}
      </Button>
    </Stack>
  );
}