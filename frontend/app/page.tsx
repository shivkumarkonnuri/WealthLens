"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import UploadCSV from "@/components/UploadCSV";
<<<<<<< HEAD
import { apiFetch, logout, getCachedUser, type AuthUser } from "@/lib/auth";
=======
import { apiFetch, logout, verifyToken, redirectTo, type AuthUser } from "@/lib/auth";
>>>>>>> 4e96856 (Fixed and stable code)

// ... (ALL YOUR TYPES, HELPERS, COMPONENTS — UNCHANGED)

export default function Home() {
<<<<<<< HEAD
  const router = useRouter();
  const checked = useRef(false);
=======
  const checked = useRef(false); // prevents double-run in any React mode
>>>>>>> 4e96856 (Fixed and stable code)

  const [user, setUser]                   = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked]     = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [summary, setSummary]             = useState<any>(null);
  const [aiInsight, setAiInsight]         = useState<any>(null);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [noData, setNoData]               = useState(false);
  const [loggingOut, setLoggingOut]       = useState(false);

<<<<<<< HEAD
  // ✅ FIXED AUTH GUARD (no isLoggedIn race)
=======
  // Auth guard — verify token with backend ONCE on mount.
  // We call verifyToken() instead of isLoggedIn() because isLoggedIn()
  // only checks localStorage — a stale/expired token would pass that
  // check and cause a redirect loop when the first API call returns 401.
>>>>>>> 4e96856 (Fixed and stable code)
  useEffect(() => {
    if (checked.current) return;
    checked.current = true;

<<<<<<< HEAD
    const token = typeof window !== "undefined"
      ? localStorage.getItem("wl_token")
      : null;

    if (!token) {
      router.replace("/auth/login");
      return;
    }

    setUser(getCachedUser());
    setAuthChecked(true);
  }, []);

  // ... (ALL REMAINING CODE EXACTLY SAME — no changes)

=======
    verifyToken().then((user) => {
      if (!user) {
        // No token, or token is expired — verifyToken() already cleared it.
        redirectTo("/auth/login");
        return;
      }
      setUser(user);
      setAuthChecked(true);
    });
  }, []);

  const fetchMonths = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/proxy/transactions/available-months`);
      if (res.status === 401) { redirectTo("/auth/login"); return; }
      if (!res.ok) throw new Error("Failed");
      const data: string[] = await res.json();
      setAvailableMonths(data);
      if (data.length > 0) {
        setSelectedMonth(data[0]);
      } else {
        setLoading(false);
      }
    } catch {
      setError("Cannot connect to backend. Ensure the API is running.");
      setLoading(false);
    }
  }, []); // redirectTo is a stable module-level function, no deps needed

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
        if (sRes.status === 401 || aRes.status === 401) { redirectTo("/auth/login"); return; }
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
  }, [selectedMonth]); // router removed — redirectTo is stable, not a hook

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
    redirectTo("/auth/login");
  }

  const onUploadSuccess = () => { fetchMonths(); };

  // ── GATE: render nothing until auth confirmed ─────────────────
  // While authChecked=false: blank screen (null)
  // router.replace is in-flight — user never sees dashboard
>>>>>>> 4e96856 (Fixed and stable code)
  if (!authChecked) return null;

  return (
    <div>
      {/* FULL ORIGINAL UI */}
    </div>
  );
}
