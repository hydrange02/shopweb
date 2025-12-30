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

  // Lấy data ra một lần duy nhất để tránh lỗi stream
  const data = await res.json();

  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    // Lấy message từ Backend mà Jules đã định nghĩa
    message = data?.error?.message || data?.message || message; 
    throw new Error(message);
  }

  return data as T;
}

export const api = {
  get: async <T>(path: string) => {
    const data = await apiFetch<T>(path, { method: "GET" });
    return { data }; // Trả về dạng { data: ... } để giống axios
  },
  post: async <T>(path: string, body: any) => {
    const data = await apiFetch<T>(path, { 
      method: "POST", 
      body: JSON.stringify(body) 
    });
    return { data };
  },
  put: async <T>(path: string, body: any) => {
    const data = await apiFetch<T>(path, { 
      method: "PUT", 
      body: JSON.stringify(body) 
    });
    return { data };
  },
  delete: async <T>(path: string) => {
    const data = await apiFetch<T>(path, { method: "DELETE" });
    return { data };
  },
};

/** * Các hàm hỗ trợ Review để bạn dùng ở Bước 2 
 */
export const reviewService = {
  // Lấy review
  getByProductId: (productId: string) => 
    apiFetch<any[]>(`/api/v1/products/${productId}/reviews`),
  
  // Gửi review (Cần token - đã được apiFetch tự động xử lý)
  create: (productId: string, rating: number, comment: string) =>
    apiFetch(`/api/v1/products/${productId}/reviews`, {
      method: "POST",
      body: JSON.stringify({ rating, comment }),
    }),
};

