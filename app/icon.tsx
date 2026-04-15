import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#1d4ed8",
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Shield shape via SVG */}
        <svg
          width="20"
          height="22"
          viewBox="0 0 20 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 1L2 4.5V10C2 14.75 5.4 19.2 10 21C14.6 19.2 18 14.75 18 10V4.5L10 1Z"
            fill="white"
          />
          <path
            d="M8 10.5L9.5 12L13 8.5"
            stroke="#1d4ed8"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
