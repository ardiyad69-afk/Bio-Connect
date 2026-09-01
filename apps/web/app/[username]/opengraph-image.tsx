import { ImageResponse } from "next/og";
import { getPublicProfile } from "@/lib/data/public-profile";

// Node runtime, not edge: the DB client used by getPublicProfile relies on
// Node's net/tls modules for its raw TCP connection to Postgres.
export const alt = "BioConnect profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { username: string } }) {
  const profile = await getPublicProfile(params.username);
  const displayName = profile?.displayName ?? params.username;
  const bio = profile?.bio ?? "";
  const themeColor = profile?.themeColor ?? "#7c3aed";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `radial-gradient(circle at 50% 0%, ${themeColor}55, #09090b 60%)`,
          color: "white",
          fontSize: 56,
          fontWeight: 700,
        }}
      >
        <div>{displayName}</div>
        {bio && <div style={{ fontSize: 28, opacity: 0.7, marginTop: 16 }}>{bio}</div>}
      </div>
    ),
    { ...size }
  );
}
