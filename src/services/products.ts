import { apiFetch } from "@/lib/api";
import type { Product } from "@/types/product";

export async function getProductBySlug(slug: string) {
  const j = await apiFetch<{ ok: boolean; product: Product }>(
    `/api/v1/products/slug/${encodeURIComponent(slug)}`
  );
  return j.product;
}

export async function deleteProduct(id: string) {
  return apiFetch<{ ok: boolean; deletedId: string }>(`/api/v1/products/${id}`, {
    method: "DELETE",
  });
}

// 🔥 MỚI: Thêm sản phẩm
export async function createProduct(data: any) {
  return apiFetch<{ ok: boolean; product: Product }>("/api/v1/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// 🔥 MỚI: Sửa sản phẩm
export async function updateProduct(id: string, data: any) {
  return apiFetch<{ ok: boolean; product: Product }>(`/api/v1/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}