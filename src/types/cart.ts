// Sửa toàn bộ file src/types/cart.ts
import type { Product } from "@/types/product";

export type CartItem = {
  productId: string;
  slug: string;
  title: string;
  price: number;
  image?: string;
  quantity: number;
  stock?: number;
  selectedSize?: string; // 🔥 Thêm thuộc tính này
};

export type CartState = { items: CartItem[] };

export type CartAction =
  | { type: "ADD"; payload: CartItem }
  | { type: "REMOVE"; payload: { productId: string; selectedSize?: string } } // Cập nhật để xoá đúng size
  | { type: "SET_QTY"; payload: { productId: string; selectedSize?: string; quantity: number } }
  | { type: "CLEAR" };

export function productToCartItem(p: Product, quantity = 1): CartItem {
  return {
    productId: p._id,
    slug: p.slug,
    title: p.title,
    price: p.discountPercent
      ? Math.round(p.price * (1 - p.discountPercent / 100))
      : p.price,
    image: p.images?.[0],
    quantity,
    stock: p.stock,
  };
}