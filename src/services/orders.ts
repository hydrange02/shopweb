import { apiFetch } from "@/lib/api";
import type { Order } from "@/types/order"; // Nhớ import type này

export type CreateOrderInput = {
  customerName: string;
  customerPhone?: string;
  customerAddress: string;
  paymentMethod: "cod" | "banking" | "momo";
  note?: string;
  items: { productId: string; quantity: number }[];
};

export function createOrder(input: CreateOrderInput) {
  // 👇 SỬA LỖI Ở ĐÂY: Thay order: any bằng order: Order
  return apiFetch<{ ok: boolean; order: Order }>("/api/v1/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
}