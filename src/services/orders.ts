import { apiFetch } from "@/lib/api";
import type { Order } from "@/types/order";

export type CreateOrderInput = {
  customerName: string;
  customerPhone?: string;
  customerAddress: string;
  paymentMethod: "cod" | "banking" | "momo";
  note?: string;
  items: { productId: string; quantity: number }[];
};

// Kiểu dữ liệu trả về cho danh sách đơn hàng (phân trang)
export type OrdersResponse = {
  ok: boolean;
  data: Order[];
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
};

export function createOrder(input: CreateOrderInput) {
  return apiFetch<{ ok: boolean; order: Order }>("/api/v1/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// 🔥 MỚI: Hàm lấy danh sách đơn hàng cho Admin
export function getAllOrders(page = 1, limit = 20, search = "") {
  const query = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    q: search // Truyền q vào query string
  });
  return apiFetch<OrdersResponse>(`/api/v1/orders?${query.toString()}`);
}

export function updateOrderStatus(id: string, status: string) {
  return apiFetch<{ ok: boolean; order: Order }>(`/api/v1/orders/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}
