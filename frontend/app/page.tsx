"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import UploadCSV from "@/components/UploadCSV";
import { apiFetch, logout, getCachedUser, isLoggedIn, type AuthUser } from "@/lib/auth";

interface Summary {
  total_income: number;
  total_expense: number;
  weekend_spend: number;
  weekday_spend: number;
  category_breakdown: Record<string, number>;
}
interface AIInsight {
  risk_level: "Low" | "Medium" | "High";
  summary: string;
  actionable_suggestions: string[];
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}
function formatMonthLabel(m: string) {
  if (!m) return "";
  const [y, mo] = m.split("-");
  const d = new Date(parseInt(y), parseInt(mo) - 1, 1);
  return d.toLocaleString("en-IN", { month: "long", year: "numeric" });
}
function getRisk(level: string) {
  if (level === "Low")    return { color: "#10b981", bg: "rgba(16,185,129,.1)",  border: "rgba(16,185,129,.25)", score: 20, label: "Healthy",   icon: "✦" };
  if (level === "Medium") return { color: "#f59e0b", bg: "rgba(245,158,11,.1)", border: "rgba(245,158,11,.25)", score: 55, label: "Moderate",  icon: "◆" };
  return                         { color: "#f43f5e", bg: "rgba(244,63,94,.1)",  border: "rgba(244,63,94,.25)",  score: 88, label: "High Risk", icon: "▲" };
}
const CAT_COLORS: Record<string, string> = {
  Food:"#22d3ee", Groceries:"#10b981", Shopping:"#818cf8", Subscriptions:"#f59e0b",
  Utilities:"#64748b", Rent:"#f43f5e", Transport:"#a78bfa", Health:"#34d399",
  Education:"#60a5fa", Entertainment:"#fb7185", Investments:"#4ade80",
  Transfer:"#94a3b8", Income:"#10b981", Uncategorized:"#334155",
};

// ── Animated counter ──────────────────────────────────────────
function AnimatedNum({ value }: { value: number }) {
  const [disp, setDisp] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    const t0 = performance.now();
    const dur = 850;
    const tick = (now: number) => {
      const t = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - t, 3);
      setDisp(Math.round(value * e));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [value]);
  return <>{fmt(disp)}</>;
}

// ── Skeleton ──────────────────────────────────────────────────
function Skeleton() {
  const skRow = { background: "linear-gradient(90deg,#111827 25%,#161f35 50%,#111827 75%)", backgroundSize:"200% 100%", animation:"shimmer 1.5s infinite", borderRadius:6, marginBottom:10 };
  return (
    <div style={{ maxWidth:1280, margin:"0 auto", padding:"20px 24px" }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:14 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ background:"#111827", border:"1px solid rgba(255,255,255,.07)", borderRadius:13, padding:18 }}>
            <div style={{ ...skRow, height:10, width:"60%" }} />
            <div style={{ ...skRow, height:22, width:"80%" }} />
            <div style={{ ...skRow, height:8, width:"100%" }} />
          </div>
        ))}
      </div>
      <div style={{ background:"#111827", border:"1px solid rgba(255,255,255,.07)", borderRadius:13, padding:18, marginBottom:14 }}>
        <div style={{ ...skRow, height:10, width:"30%" }} />
        <div style={{ ...skRow, height:18, width:"20%" }} />
        <div style={{ ...skRow, height:6, width:"100%" }} />
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ title, value, sub, color, icon, pct }: {
  title:string; value:number; sub:string; color:string; icon:string; pct?:number;
}) {
  return (
    <div style={{
      background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:13,
      padding:"16px 18px", position:"relative", overflow:"hidden", transition:"border-color .2s",
    }}>
      <div style={{ position:"absolute", top:-20, right:-20, width:70, height:70, borderRadius:"50%", opacity:.12, filter:"blur(18px)", background:color }} />
      <div style={{ position:"relative" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
          <span style={{ fontSize:10, fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:"var(--text-muted)" }}>{title}</span>
          <span style={{ color, fontSize:18 }}>{icon}</span>
        </div>
        <p style={{ fontFamily:"var(--font-mono)", fontSize:22, fontWeight:600, color, marginBottom:4 }}>
          ₹ <AnimatedNum value={value} />
        </p>
        <p style={{ fontSize:11, color:"var(--text-muted)" }}>{sub}</p>
        {pct !== undefined && (
          <>
            <div style={{ height:3, background:"var(--border)", borderRadius:999, overflow:"hidden", marginTop:10 }}>
              <div style={{ height:"100%", borderRadius:999, background:color, width:`${Math.min(pct,100)}%`, transition:"width .9s cubic-bezier(.16,1,.3,1)" }} />
            </div>
            <p style={{ fontSize:10, color:"var(--text-muted)", marginTop:3 }}>{Math.round(pct)}% of income</p>
          </>
        )}
      </div>
    </div>
  );
}

// ── Risk Panel ────────────────────────────────────────────────
function RiskPanel({ level }: { level: string }) {
  const r = getRisk(level);
  return (
    <div style={{ background: r.bg, border:`1px solid ${r.border}`, borderRadius:13, padding:"16px 18px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <p style={{ fontSize:10, fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:"var(--text-muted)", marginBottom:8 }}>Financial Risk Assessment</p>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:24, fontWeight:700, color:r.color }}>{level}</span>
            <span style={{ background:r.bg, color:r.color, border:`1px solid ${r.border}`, padding:"2px 10px", borderRadius:999, fontSize:11, fontWeight:500 }}>
              {r.icon} {r.label}
            </span>
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <p style={{ fontSize:10, color:"var(--text-muted)", marginBottom:4 }}>Risk Score</p>
          <p style={{ fontFamily:"var(--font-mono)", fontSize:30, fontWeight:700, color:r.color }}>{r.score}</p>
          <p style={{ fontSize:10, color:"var(--text-muted)" }}>/ 100</p>
        </div>
      </div>
      <div style={{ height:3, background:"rgba(255,255,255,.07)", borderRadius:999, overflow:"hidden", marginTop:12 }}>
        <div style={{ height:"100%", borderRadius:999, background:r.color, width:`${r.score}%`, transition:"width .9s cubic-bezier(.16,1,.3,1)" }} />
      </div>
    </div>
  );
}

// ── Category Breakdown ────────────────────────────────────────
function CategoryBreakdown({ data, total }: { data: Record<string,number>; total:number }) {
  const entries = Object.entries(data).filter(([,v])=>v>0).sort(([,a],[,b])=>b-a).slice(0,8);
  if (!entries.length) return <p style={{ fontSize:12, color:"var(--text-muted)" }}>No category data</p>;
  return (
    <div>
      {entries.map(([cat, amt]) => {
        const pct = total > 0 ? (amt/total)*100 : 0;
        const color = CAT_COLORS[cat] || "#64748b";
        return (
          <div key={cat} style={{ marginBottom:10 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:3 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:color, flexShrink:0, display:"inline-block" }} />
                <span style={{ fontSize:12, color:"var(--text-secondary)" }}>{cat}</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:11, color:"var(--text-muted)", fontFamily:"var(--font-mono)" }}>{pct.toFixed(1)}%</span>
                <span style={{ fontSize:12, fontWeight:500, color:"var(--text-primary)", fontFamily:"var(--font-mono)", minWidth:72, textAlign:"right" }}>₹ {fmt(amt)}</span>
              </div>
            </div>
            <div style={{ height:3, background:"var(--border)", borderRadius:999, overflow:"hidden" }}>
              <div style={{ height:"100%", borderRadius:999, background:color, width:`${pct}%`, transition:"width .9s cubic-bezier(.16,1,.3,1)" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Spend Split ───────────────────────────────────────────────
function SpendSplit({ weekend, weekday }: { weekend:number; weekday:number }) {
  const total = weekend + weekday;
  const wdPct = total > 0 ? (weekday/total)*100 : 50;
  return (
    <div>
      <p style={{ fontSize:10, fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:"var(--text-muted)", marginBottom:10 }}>Spend Split</p>
      <div style={{ display:"flex", height:5, borderRadius:999, overflow:"hidden", gap:2, marginBottom:8 }}>
        <div style={{ width:`${wdPct}%`, background:"#22d3ee", borderRadius:"999px 0 0 999px" }} />
        <div style={{ width:`${100-wdPct}%`, background:"#f59e0b", borderRadius:"0 999px 999px 0" }} />
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:11 }}>
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"#22d3ee", display:"inline-block" }} />
          <span style={{ color:"var(--text-muted)" }}>Weekday</span>
          <span style={{ fontFamily:"var(--font-mono)", fontWeight:500, color:"var(--text-secondary)" }}>₹ {fmt(weekday)}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"#f59e0b", display:"inline-block" }} />
          <span style={{ color:"var(--text-muted)" }}>Weekend</span>
          <span style={{ fontFamily:"var(--font-mono)", fontWeight:500, color:"var(--text-secondary)" }}>₹ {fmt(weekend)}</span>
        </div>
      </div>
    </div>
  );
}

// ── Suggestion ────────────────────────────────────────────────
function Suggestion({ text, idx }: { text:string; idx:number }) {
  const icons = ["◎","◉","●"];
  const colors = ["#22d3ee","#818cf8","#10b981"];
  return (
    <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px", display:"flex", gap:10, alignItems:"flex-start" }}>
      <span style={{ color:colors[idx%3], fontSize:15, flexShrink:0, marginTop:1 }}>{icons[idx%3]}</span>
      <p style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.6, margin:0 }}>{text}</p>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────
function EmptyState({ month }: { month:string }) {
  return (
    <div style={{ maxWidth:1280, margin:"0 auto", padding:"60px 24px", textAlign:"center" }}>
      <p style={{ fontSize:48, marginBottom:16, color:"var(--text-muted)" }}>◈</p>
      <p style={{ fontSize:18, fontWeight:600, color:"var(--text-primary)", marginBottom:8 }}>No transactions for {formatMonthLabel(month)}</p>
      <p style={{ fontSize:13, color:"var(--text-muted)" }}>Upload a CSV file to get started, or select a different month.</p>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();

  const [user, setUser]                       = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked]         = useState(false);
  const [selectedMonth, setSelectedMonth]     = useState("");
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [summary, setSummary]                 = useState<Summary | null>(null);
  const [aiInsight, setAiInsight]             = useState<AIInsight | null>(null);
  const [loading, setLoading]                 = useState(false);  // ← false, not true
  const [error, setError]                     = useState<string | null>(null);
  const [noData, setNoData]                   = useState(false);
  const [loggingOut, setLoggingOut]           = useState(false);

  // Auth guard — runs once on mount, client-side only
  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/auth/login");
      // do NOT set authChecked — keep returning null until redirect completes
      return;
    }
    setUser(getCachedUser());
    setAuthChecked(true);
  }, []); // ← empty deps, runs only once on mount

  const fetchMonths = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/proxy/transactions/available-months`);
      if (res.status === 401) { router.replace("/auth/login"); return; }
      if (!res.ok) throw new Error("Failed");
      const data: string[] = await res.json();
      setAvailableMonths(data);
      if (data.length > 0) {
        setSelectedMonth(data[0]);
      } else {
        setLoading(false); // no months — stop loading
      }
    } catch {
      setError("Cannot connect to backend. Ensure the API is running.");
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (authChecked) fetchMonths();
  }, [authChecked, fetchMonths]);

  useEffect(() => {
    if (!selectedMonth) return;
    const controller = new AbortController();
    const go = async () => {
      setLoading(true); setError(null); setNoData(false);
      try {
        const [sRes, aRes] = await Promise.all([
          apiFetch(`/api/proxy/transactions/generate-summary/${selectedMonth}`, { method:"POST", signal:controller.signal }),
          apiFetch(`/api/proxy/transactions/generate-ai/${selectedMonth}`,      { method:"POST", signal:controller.signal }),
        ]);
        if (sRes.status === 401 || aRes.status === 401) { router.replace("/auth/login"); return; }
        if (!sRes.ok || !aRes.ok) throw new Error("API error");
        const [sData, aData] = await Promise.all([sRes.json(), aRes.json()]);
        if (!sData.total_income && !sData.total_expense) { setNoData(true); }
        else { setSummary(sData); setAiInsight(aData); }
      } catch(e: unknown) {
        if (e instanceof Error && e.name !== "AbortError") setError("Failed to load data. Please try again.");
      } finally { setLoading(false); }
    };
    go();
    return () => controller.abort();
  }, [selectedMonth, router]);

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
    router.replace("/auth/login");
  }

  const onUploadSuccess = () => { fetchMonths(); };

  // ── Block ALL rendering until auth is confirmed ──────────────
  // This is the ONLY place we gate rendering.
  // Returns null (blank screen) while waiting — no flash possible.
  if (!authChecked) return null;

  const savings = summary ? summary.total_income - summary.total_expense : 0;
  const expPct  = summary && summary.total_income > 0 ? (summary.total_expense / summary.total_income)*100 : 0;

  const S = {
    card:  { background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:13, padding:"16px 18px" } as React.CSSProperties,
    label: { fontSize:10, fontWeight:600, letterSpacing:".1em", textTransform:"uppercase" as const, color:"var(--text-muted)", marginBottom:12 },
  };

  return (
    <div style={{ minHeight:"100vh", fontFamily:"var(--font-sans)" }}>

      {/* HEADER */}
      <header style={{
        borderBottom:"1px solid var(--border)", background:"rgba(11,15,26,.9)",
        backdropFilter:"blur(14px)", position:"sticky", top:0, zIndex:50,
        padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:36, height:36, borderRadius:9, flexShrink:0,
            background:"linear-gradient(135deg,#22d3ee,#818cf8)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontFamily:"var(--font-mono)", fontWeight:700, fontSize:12, color:"#0b0f1a",
          }}>WL</div>
          <div>
            <p style={{ fontSize:16, fontWeight:700, letterSpacing:"-.02em", color:"var(--text-primary)", margin:0 }}>WealthLens</p>
            <p style={{ fontSize:9, color:"var(--text-muted)", letterSpacing:".08em", margin:0 }}>FINANCE INTELLIGENCE</p>
          </div>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {availableMonths.length > 0 && (
            <select value={selectedMonth} onChange={e=>setSelectedMonth(e.target.value)} style={{
              background:"var(--bg-card)", border:"1px solid var(--border-strong)", borderRadius:8,
              padding:"7px 12px", color:"var(--text-primary)", fontSize:13,
              fontFamily:"var(--font-sans)", cursor:"pointer", outline:"none",
            }}>
              {availableMonths.map(m=><option key={m} value={m}>{formatMonthLabel(m)}</option>)}
            </select>
          )}
          <input type="month" onChange={e=>{ if(e.target.value) setSelectedMonth(e.target.value); }}
            style={{
              background:"var(--bg-card)", border:"1px solid var(--border-strong)", borderRadius:8,
              padding:"7px 12px", color:"var(--text-muted)", fontSize:13,
              fontFamily:"var(--font-sans)", cursor:"pointer", outline:"none",
            }} title="Jump to any month" />

          {user && (
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{
                display:"flex", alignItems:"center", gap:8,
                background:"var(--bg-card)", border:"1px solid var(--border-strong)",
                borderRadius:8, padding:"5px 12px",
              }}>
                <div style={{
                  width:24, height:24, borderRadius:"50%", flexShrink:0,
                  background:"linear-gradient(135deg,#22d3ee,#818cf8)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:10, fontWeight:700, color:"#0b0f1a",
                }}>
                  {(user.full_name || user.email).charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize:13, color:"var(--text-secondary)", maxWidth:140, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {user.full_name || user.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                style={{
                  background:"transparent", border:"1px solid var(--border-strong)",
                  borderRadius:8, padding:"7px 12px", color:"var(--text-muted)",
                  fontSize:12, fontFamily:"var(--font-sans)", cursor: loggingOut ? "not-allowed" : "pointer",
                  opacity: loggingOut ? 0.6 : 1, transition:"color .2s, border-color .2s",
                }}
              >
                {loggingOut ? "…" : "Sign out"}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* UPLOAD */}
      <div style={{ maxWidth:1280, margin:"0 auto", padding:"16px 24px 0" }}>
        <UploadCSV onSuccess={onUploadSuccess} />
      </div>

      {/* ERROR */}
      {!loading && error && (
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"60px 24px", textAlign:"center" }}>
          <p style={{ fontSize:40, marginBottom:14, color:"var(--text-muted)" }}>⚠</p>
          <p style={{ fontSize:15, fontWeight:500, color:"var(--text-primary)", marginBottom:16 }}>{error}</p>
          <button onClick={fetchMonths} style={{
            padding:"9px 22px", background:"var(--accent-dim)", border:"1px solid var(--accent)",
            borderRadius:8, color:"var(--accent)", cursor:"pointer", fontSize:13, fontFamily:"var(--font-sans)",
          }}>Retry</button>
        </div>
      )}

      {/* LOADING */}
      {loading && <Skeleton />}

      {/* NO DATA */}
      {!loading && !error && noData && <EmptyState month={selectedMonth} />}

      {/* DASHBOARD */}
      {!loading && !error && !noData && summary && aiInsight && (
        <main style={{ maxWidth:1280, margin:"0 auto", padding:"16px 24px 32px" }}>

          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
            <span style={{
              display:"inline-flex", alignItems:"center", padding:"2px 10px", borderRadius:999,
              fontSize:11, fontWeight:500, background:"rgba(34,211,238,.08)",
              color:"#22d3ee", border:"1px solid rgba(34,211,238,.2)",
            }}>{formatMonthLabel(selectedMonth)}</span>
            <span style={{ fontSize:12, color:"var(--text-muted)" }}>— Monthly Financial Report</span>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:14 }}>
            <StatCard title="Total Income"  value={summary.total_income}  sub="Credited this month" color="#10b981" icon="↑" />
            <StatCard title="Total Expense" value={summary.total_expense} sub="Debited this month"  color="#f43f5e" icon="↓" pct={expPct} />
            <StatCard title="Net Savings"   value={Math.abs(savings)}     sub={savings>=0?"Surplus":"Deficit"} color={savings>=0?"#10b981":"#f43f5e"} icon={savings>=0?"◈":"◉"} />
            <StatCard title="Weekend Spend" value={summary.weekend_spend} sub="Sat & Sun spending"  color="#f59e0b" icon="◇" />
          </div>

          <div style={{ marginBottom:14 }}>
            <RiskPanel level={aiInsight.risk_level} />
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
            <div style={S.card}>
              <p style={S.label}>Category Breakdown</p>
              <CategoryBreakdown data={summary.category_breakdown || {}} total={summary.total_expense} />
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div style={S.card}>
                <SpendSplit weekend={summary.weekend_spend} weekday={summary.weekday_spend} />
              </div>
              <div style={{ ...S.card, flex:1 }}>
                <p style={S.label}>AI Financial Insight</p>
                <p style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.65, margin:0 }}>{aiInsight.summary}</p>
              </div>
            </div>
          </div>

          <div>
            <p style={{ ...S.label, marginBottom:10 }}>Actionable Suggestions</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
              {aiInsight.actionable_suggestions.map((s,i)=><Suggestion key={i} text={s} idx={i} />)}
            </div>
          </div>

          <p style={{ textAlign:"center", fontSize:11, color:"var(--text-muted)", marginTop:24 }}>
            WealthLens · AI-powered by OpenRouter · {formatMonthLabel(selectedMonth)}
          </p>
        </main>
      )}
    </div>
  );
}
