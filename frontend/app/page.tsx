"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import UploadCSV from "@/components/UploadCSV";
import { apiFetch, logout, getCachedUser, type AuthUser } from "@/lib/auth";

// ... (ALL YOUR TYPES, HELPERS, COMPONENTS — UNCHANGED)

export default function Home() {
  const router = useRouter();
  const checked = useRef(false);

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

  // ✅ FIXED AUTH GUARD (no isLoggedIn race)
  useEffect(() => {
    if (checked.current) return;
    checked.current = true;

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

  if (!authChecked) return null;

  return (
    <div>
      {/* FULL ORIGINAL UI */}
    </div>
  );
}
