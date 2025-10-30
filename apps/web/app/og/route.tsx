import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "Late Night Lake Show";

  return new ImageResponse(
    (
      <div
        style={{
          fontFamily: "Bebas Neue, sans-serif",
          fontSize: 80,
          letterSpacing: "0.04em",
          background: "radial-gradient(circle at top left, #A78BFA, #0F172A 55%)",
          color: "#F1F5F9",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px"
        }}
      >
        <span style={{ fontSize: 40, color: "#FBBF24", marginBottom: 16 }}>Late Night Lake Show</span>
        <strong>{title}</strong>
      </div>
    ),
    { ...size }
  );
}
