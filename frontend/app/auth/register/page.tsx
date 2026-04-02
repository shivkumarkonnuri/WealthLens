"use client";

import { useState, useEffect, useRef } from "react";
<<<<<<< HEAD
import { useRouter } from "next/navigation";
import { register, login } from "@/lib/auth";
=======
import { register, login, verifyToken, redirectTo } from "@/lib/auth";
>>>>>>> 4e96856 (Fixed and stable code)

export default function RegisterPage() {
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
    verifyToken().then((user) => {
      if (user) {
        redirectTo("/");
      } else {
        setAuthChecked(true);
      }
    });
>>>>>>> 4e96856 (Fixed and stable code)
  }, []);

  if (!authChecked) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

    setLoading(true);
<<<<<<< HEAD

    const reg = await register(email, password, fullName);
    if (!reg.ok) {
      setError(reg.error ?? "Registration failed.");
      setLoading(false);
      return;
    }

    const log = await login(email, password);
    if (log.ok) router.replace("/");
    else router.replace("/auth/login");
=======
    const regResult = await register(email, password, fullName);
    if (!regResult.ok) { setError(regResult.error ?? "Registration failed."); setLoading(false); return; }
    const loginResult = await login(email, password);
    redirectTo(loginResult.ok ? "/" : "/auth/login");
>>>>>>> 4e96856 (Fixed and stable code)
  }

  return (
    <div>
      {/* YOUR FULL ORIGINAL UI — unchanged */}
    </div>
  );
}
