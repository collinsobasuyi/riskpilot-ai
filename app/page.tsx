import Link from "next/link";

export default function Home() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 40 }}>
      <h1 style={{ fontSize: 36, fontWeight: 700 }}>
        RiskPilot AI
      </h1>

      <p style={{ marginTop: 16, fontSize: 18 }}>
        Structured AI governance and risk assessment for UK SMEs.
      </p>

      <div style={{ marginTop: 24 }}>
        <Link
          href="/assessment"
          style={{
            padding: "12px 16px",
            background: "black",
            color: "white",
            borderRadius: 8,
            textDecoration: "none"
          }}
        >
          Start Assessment
        </Link>
      </div>
    </main>
  );
}