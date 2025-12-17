"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/auth";
import { setToken } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!email || !password) { setError("Vui lòng nhập email và mật khẩu."); return; }
    setSubmitting(true);
    try {
      const j = await login({ email: email.trim(), password });
      if (!j?.token) throw new Error("Không nhận được token.");
      setToken(j.token);

      if (j.user?.role === "admin") {
        router.replace("/admin/products");
      } else {
        router.replace("/");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đăng nhập thất bại.";
      setError(msg);
    } finally { setSubmitting(false); }
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Đăng nhập Quản trị</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input className="w-full border rounded-md p-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" />
        </div>
        <div>
          <label className="block text-sm mb-1">Mật khẩu</label>
          <input type="password" className="w-full border rounded-md p-2" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button type="submit" className="h-10 px-4 rounded-md border bg-black text-white disabled:opacity-60" disabled={submitting}>
          {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </main>
  );
}