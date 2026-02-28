import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MyChef — Professional Chef Marketplace";
export const size = { width: 1200, height: 600 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1c1917 0%, #292524 50%, #78350f 100%)",
          padding: "56px 72px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245,158,11,0.3) 0%, transparent 70%)",
          }}
        />

        {/* Logo + tagline row */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 32 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "rgba(245,158,11,0.2)",
              border: "1px solid rgba(245,158,11,0.4)",
              fontSize: 34,
            }}
          >
            👨‍🍳
          </div>
          <span style={{ fontSize: 36, fontWeight: 900, color: "#fafaf9" }}>MyChef</span>
        </div>

        <div
          style={{
            fontSize: 58,
            fontWeight: 900,
            color: "#fafaf9",
            lineHeight: 1.1,
            marginBottom: 18,
            letterSpacing: "-0.5px",
          }}
        >
          Book a{" "}
          <span style={{ color: "#f59e0b" }}>Professional Chef</span>
          {"\n"}for Your Next Event
        </div>

        <div style={{ fontSize: 20, color: "#a8a29e", maxWidth: 680, lineHeight: 1.5 }}>
          Verified chefs. Secure escrow payments. Weddings, corporate events, private dinners.
        </div>
      </div>
    ),
    size
  );
}
