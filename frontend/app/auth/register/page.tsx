"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { register, login, isLoggedIn } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const checked = useRef(false);

  const [fullName, setFullName]       = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [confirm, setConfirm]         = useState("");
  const [error, setError]             = useState<string | null>(null);
  const [loading, setLoading]         = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;

    if (isLoggedIn()) {
      router.replace("/");
    } else {
      setAuthChecked(true);
    }
  }, []);

  if (!authChecked) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    const regResult = await register(email, password, fullName);
    if (!regResult.ok) { setError(regResult.error ?? "Registration failed."); setLoading(false); return; }
    const loginResult = await login(email, password);
    if (loginResult.ok) { router.replace("/"); } else { router.replace("/auth/login"); }
  }

  return (
    <div style={styles.page}>
      <div style={styles.brand}>
        <span style={styles.brandIcon}>◈</span>
        <span style={styles.brandName}>WealthLens</span>
      </div>

      <div style={styles.card}>
        <h1 style={styles.heading}>Create your account</h1>
        <p style={styles.sub}>Start tracking your finances with AI insights</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Full name <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span>
            <input type="text" autoComplete="name" value={fullName} onChange={e => setFullName(e.target.value)} style={styles.input} placeholder="Your name" />
          </label>

          <label style={styles.label}>
            Email address
            <input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} style={styles.input} placeholder="you@example.com" />
          </label>

          <label style={styles.label}>
            Password
            <input type="password" required autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} style={styles.input} placeholder="Min. 8 characters" maxLength={72} />
          </label>

          <label style={styles.label}>
            Confirm password
            <input type="password" required autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} style={styles.input} placeholder="Repeat your password" maxLength={72} />
          </label>

          {password.length > 0 && <div style={{ marginTop: -4 }}><StrengthBar password={password} /></div>}

          {error && (
            <div style={styles.errorBox}>
              <span style={{ fontSize: 13 }}>⚠</span> {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{ ...styles.btn, opacity: loading ? 0.65 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{" "}
          <a href="/auth/login" style={styles.link}>Sign in</a>
        </p>
      </div>
    </div>
  );
}

function StrengthBar({ password }: { password: string }) {
  let score = 0;
  if (password.length >= 8)          score++;
  if (password.length >= 12)         score++;
  if (/[A-Z]/.test(password))        score++;
  if (/[0-9]/.test(password))        score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const labels = ["", "Weak", "Fair", "Good", "Strong", "Very strong"];
  const colors = ["", "#f43f5e", "#f59e0b", "#f59e0b", "#10b981", "#10b981"];
  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
        {[1,2,3,4,5].map(i => <div key={i} style={{ flex:1, height:3, borderRadius:999, background: i<=score ? colors[score] : "var(--border-strong)", transition:"background .3s" }} />)}
      </div>
      <p style={{ fontSize: 11, color: colors[score] || "var(--text-muted)", margin: 0 }}>{labels[score] || "Too short"}</p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px", background: "var(--bg-base)" },
  brand: { display: "flex", alignItems: "center", gap: 10, marginBottom: 32 },
  brandIcon: { fontSize: 26, color: "var(--accent)" },
  brandName: { fontSize: 22, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.02em" },
  card: { width: "100%", maxWidth: 420, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "36px 32px" },
  heading: { fontSize: 22, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 6px" },
  sub: { fontSize: 13, color: "var(--text-muted)", margin: "0 0 28px" },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  label: { display: "flex", flexDirection: "column", gap: 6, fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", letterSpacing: "0.04em", textTransform: "uppercase" },
  input: { background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-strong)", borderRadius: 8, padding: "10px 14px", fontSize: 14, color: "var(--text-primary)", outline: "none", fontFamily: "var(--font-sans)", transition: "border-color .2s" },
  errorBox: { background: "var(--red-dim)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--red)", display: "flex", alignItems: "center", gap: 8 },
  btn: { marginTop: 4, padding: "11px 0", borderRadius: 8, background: "rgba(34,211,238,0.14)", border: "1px solid var(--accent)", color: "var(--accent)", fontSize: 14, fontWeight: 500, fontFamily: "var(--font-sans)", transition: "background .2s" },
  footer: { marginTop: 24, textAlign: "center", fontSize: 13, color: "var(--text-muted)" },
  link: { color: "var(--accent)", textDecoration: "none", fontWeight: 500 },
};
