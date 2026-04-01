"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login, isLoggedIn } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  // Already logged in → go straight to dashboard
  useEffect(() => {
    if (isLoggedIn()) router.replace("/");
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login(email, password);

    if (result.ok) {
      router.replace("/");
    } else {
      setError(result.error ?? "Login failed.");
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      {/* Logo / brand */}
      <div style={styles.brand}>
        <span style={styles.brandIcon}>◈</span>
        <span style={styles.brandName}>WealthLens</span>
      </div>

      <div style={styles.card}>
        <h1 style={styles.heading}>Welcome back</h1>
        <p style={styles.sub}>Sign in to your account to continue</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Email address
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={styles.input}
              placeholder="you@example.com"
            />
          </label>

          <label style={styles.label}>
            Password
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
            />
          </label>

          {error && (
            <div style={styles.errorBox}>
              <span style={{ fontSize: 13 }}>⚠</span> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.btn, opacity: loading ? 0.65 : 1, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p style={styles.footer}>
          Don&apos;t have an account?{" "}
          <a href="/auth/register" style={styles.link}>
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    background: "var(--bg-base)",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 32,
  },
  brandIcon: {
    fontSize: 26,
    color: "var(--accent)",
  },
  brandName: {
    fontSize: 22,
    fontWeight: 600,
    color: "var(--text-primary)",
    letterSpacing: "-0.02em",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: "36px 32px",
  },
  heading: {
    fontSize: 22,
    fontWeight: 600,
    color: "var(--text-primary)",
    margin: "0 0 6px",
  },
  sub: {
    fontSize: 13,
    color: "var(--text-muted)",
    margin: "0 0 28px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: 12,
    fontWeight: 500,
    color: "var(--text-secondary)",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  input: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid var(--border-strong)",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 14,
    color: "var(--text-primary)",
    outline: "none",
    fontFamily: "var(--font-sans)",
    transition: "border-color .2s",
  },
  errorBox: {
    background: "var(--red-dim)",
    border: "1px solid rgba(244,63,94,0.3)",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    color: "var(--red)",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  btn: {
    marginTop: 4,
    padding: "11px 0",
    borderRadius: 8,
    background: "rgba(34,211,238,0.14)",
    border: "1px solid var(--accent)",
    color: "var(--accent)",
    fontSize: 14,
    fontWeight: 500,
    fontFamily: "var(--font-sans)",
    transition: "background .2s",
  },
  footer: {
    marginTop: 24,
    textAlign: "center",
    fontSize: 13,
    color: "var(--text-muted)",
  },
  link: {
    color: "var(--accent)",
    textDecoration: "none",
    fontWeight: 500,
  },
};
