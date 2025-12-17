// File: src/services/products.ts
import { apiFetch } from "@/lib/api";
import type { Product } from "@/types/product"; // Import type chuẩn từ đây

export async function getProductBySlug(slug: string) {
  // Thay thế kiểu trả về hardcode cũ bằng kiểu <{ ok: boolean; product: Product }>
  const j = await apiFetch<{ ok: boolean; product: Product }>(
    `/api/v1/products/slug/${encodeURIComponent(slug)}`
  );
  return j.product;
}