// =============================================================
// WealthLens — Auth utilities
// Token is stored in localStorage under "wl_token".
// Every API call should use apiFetch() so the token is always
// attached automatically.
// =============================================================

const TOKEN_KEY = "wl_token";
const USER_KEY  = "wl_user";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
}

// ── Token helpers ─────────────────────────────────────────────
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ── Cached user helpers ───────────────────────────────────────
export function getCachedUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setCachedUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// ── Auth state ────────────────────────────────────────────────
export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!getToken();
}

// ── Authenticated fetch wrapper ───────────────────────────────
export async function apiFetch(
  input: RequestInfo,
  init: RequestInit = {}
): Promise<Response> {
  const token = getToken();
  const headers = new Headers(init.headers ?? {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(input, { ...init, headers });
}

// ── Register ──────────────────────────────────────────────────
export async function register(
  email: string,
  password: string,
  full_name: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/proxy/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, full_name }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.detail ?? "Registration failed." };
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error — could not reach the server." };
  }
}

// ── Login ─────────────────────────────────────────────────────
export async function login(
  email: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/proxy/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.detail ?? "Login failed." };

    setToken(data.access_token);

    const meRes = await apiFetch(`/api/proxy/auth/me`);
    if (meRes.ok) {
      const user = await meRes.json();
      setCachedUser(user);
    }

    return { ok: true };
  } catch {
    return { ok: false, error: "Network error — could not reach the server." };
  }
}

// ── Logout ────────────────────────────────────────────────────
export async function logout(): Promise<void> {
  try {
    await apiFetch(`/api/proxy/auth/logout`, { method: "POST" });
  } catch {
    // Ignore network errors on logout
  } finally {
    clearToken();
  }
}
