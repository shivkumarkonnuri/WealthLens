"use client";

import { useState, useEffect, useRef } from "react";
<<<<<<< HEAD
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
=======
import { login, verifyToken, redirectTo } from "@/lib/auth";

export default function LoginPage() {
>>>>>>> 4e96856 (Fixed and stable code)
  const checked = useRef(false);

  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [error, setError]             = useState<string | null>(null);
  const [loading, setLoading]         = useState(false);
  // Start false — show nothing until we confirm the user is NOT logged in.
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;

<<<<<<< HEAD
    const token = typeof window !== "undefined"
      ? localStorage.getItem("wl_token")
      : null;

    if (token) {
      router.replace("/");
    } else {
      setAuthChecked(true);
    }
=======
    // Use verifyToken() not isLoggedIn(). isLoggedIn() only checks localStorage —
    // a stale/expired token would pass and redirect the user to "/" which would
    // then 401 and redirect back here, creating an infinite loop.
    verifyToken().then((user) => {
      if (user) {
        // Valid active session — send them home
        redirectTo("/");
      } else {
        // No valid session — show the login form
        setAuthChecked(true);
      }
    });
>>>>>>> 4e96856 (Fixed and stable code)
  }, []);

  if (!authChecked) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login(email, password);

    if (result.ok) {
      redirectTo("/");
    } else {
      setError(result.error ?? "Login failed.");
      setLoading(false);
    }
  }

  return (
    <div>
      {/* YOUR FULL ORIGINAL UI — unchanged */}
    </div>
  );
}
