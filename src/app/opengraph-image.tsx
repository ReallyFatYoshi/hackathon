import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MyChef — Professional Chef Marketplace";
export const size = { width: 1200, height: 630 };
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
          justifyContent: "flex-end",
          background: "linear-gradient(135deg, #1c1917 0%, #292524 50%, #78350f 100%)",
          padding: "64px 72px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Radial glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245,158,11,0.25) 0%, transparent 70%)",
          }}
        />

        {/* Chef hat icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: 20,
            background: "rgba(245,158,11,0.2)",
            border: "1px solid rgba(245,158,11,0.4)",
            marginBottom: 28,
            fontSize: 42,
          }}
        >
          👨‍🍳
        </div>

        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(245,158,11,0.15)",
            border: "1px solid rgba(245,158,11,0.35)",
            borderRadius: 100,
            padding: "6px 18px",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#f59e0b",
            }}
          />
          <span style={{ color: "#fcd34d", fontSize: 15, fontWeight: 600 }}>
            Verified Professional Chefs Only
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 68,
            fontWeight: 900,
            color: "#fafaf9",
            lineHeight: 1.05,
            marginBottom: 20,
            letterSpacing: "-1px",
          }}
        >
          Exceptional Culinary{" "}
          <span style={{ color: "#f59e0b" }}>Experiences</span>
        </div>

        {/* Subline */}
        <div
          style={{
            fontSize: 22,
            color: "#a8a29e",
            maxWidth: 720,
            lineHeight: 1.5,
            marginBottom: 48,
          }}
        >
          Connect with verified professional chefs for weddings, corporate events,
          private dinners, and more.
        </div>

        {/* Footer row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 32,
          }}
        >
          <span style={{ color: "#fafaf9", fontSize: 26, fontWeight: 800 }}>
            mychef.com
          </span>
          {["200+ Chefs", "1,500+ Events", "4.9★ Rating"].map((s) => (
            <div
              key={s}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "#78716c",
                fontSize: 15,
              }}
            >
              <div
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "#f59e0b",
                }}
              />
              {s}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
