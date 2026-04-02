"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const checked = useRef(false);

  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [error, setError]             = useState<string | null>(null);
  const [loading, setLoading]         = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;

    const token = typeof window !== "undefined"
      ? localStorage.getItem("wl_token")
      : null;

    if (token) {
      router.replace("/");
    } else {
      setAuthChecked(true);
    }
  }, []);

  if (!authChecked) return null;

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
    <div>
      {/* YOUR FULL ORIGINAL UI — unchanged */}
    </div>
  );
}
