// src/lib/api.ts
export const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000").replace(/\/$/, "");

export async function apiFetch(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include", // <— send + receive HttpOnly cookies
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    ...init,
  });
  return res;
}