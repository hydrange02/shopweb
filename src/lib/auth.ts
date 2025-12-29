// src/lib/auth.ts
export const TOKEN_KEY = "hydrange:token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  // 🔥 THÊM: Bắn sự kiện để CartContext biết mà tải lại giỏ
  window.dispatchEvent(new Event("auth-change"));
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  // 🔥 THÊM: Bắn sự kiện khi đăng xuất
  window.dispatchEvent(new Event("auth-change"));
}