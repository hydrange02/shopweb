import { apiFetch } from "@/lib/api";

export type RegisterInput = { name: string; email: string; password: string };
export type RegisterOutput = { ok: boolean; user: { id?: string; name: string; email: string; role?: string } };

export type LoginInput = { email: string; password: string };
export type LoginOutput = { ok: boolean; token: string; user: { id: string; name: string; email: string; role?: string } };

export function register(input: RegisterInput) {
  return apiFetch<RegisterOutput>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function login(input: LoginInput) {
  return apiFetch<LoginOutput>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function requestForgotPass(email: string) {
  return apiFetch("/api/v1/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(data: any) {
  return apiFetch("/api/v1/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}