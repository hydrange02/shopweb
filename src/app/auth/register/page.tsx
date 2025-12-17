"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register, login } from "@/services/auth";
import { setToken } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirm, setConfirm] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!name || !email || !password) { setError("Vui lòng nhập đủ họ tên, email và mật khẩu."); return; }
    if (password !== confirm) { setError("Mật khẩu nhập lại không khớp."); return; }
    setSubmitting(true);
    try {
      const r = await register({ name: name.trim(), email: email.trim(), password });
      if (!r?.ok) throw new Error("Đăng ký thất bại.");

      const j = await login({ email: email.trim(), password });
      if (!j?.token) throw new Error("Không nhận được token sau đăng ký.");
      setToken(j.token);

      router.replace("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đăng ký thất bại.";
      setError(msg);
    } finally { setSubmitting(false); }
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Đăng ký</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Họ tên</label>
          <input className="w-full border rounded-md p-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nguyễn Văn A" />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input className="w-full border rounded-md p-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
        </div>
        <div>
          <label className="block text-sm mb-1">Mật khẩu</label>
          <input type="password" className="w-full border rounded-md p-2" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <div>
          <label className="block text-sm mb-1">Nhập lại mật khẩu</label>
          <input type="password" className="w-full border rounded-md p-2" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button type="submit" className="h-10 px-4 rounded-md border bg-black text-white disabled:opacity-60" disabled={submitting}>
          {submitting ? "Đang đăng ký..." : "Đăng ký"}
        </button>
      </form>
    </main>
  );
}