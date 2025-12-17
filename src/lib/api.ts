import { getToken } from "@/lib/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  if (!headers.has("Authorization")) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { ...options, headers, cache: "no-store" });
  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    try { 
      // 👇 SỬA LỖI Ở ĐÂY: Thay (j as any) bằng kiểu cụ thể
      const j = await res.json(); 
      const errorObj = j as { error?: { message?: string } };
      message = errorObj?.error?.message || message; 
    } catch {}
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}