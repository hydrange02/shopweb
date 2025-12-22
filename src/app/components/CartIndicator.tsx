// src/app/components/CartIndicator.tsx
"use client";
import Link from "next/link";
import { useCart } from "@/features/cart/cart-context";
import { ShoppingBag } from "lucide-react"; // Import Icon

export default function CartIndicator() {
  const { totalItems, hydrated } = useCart();
  const count = hydrated ? totalItems : 0; 

  return (
    <Link 
      href="/cart" 
      className="relative p-2 hover:bg-gray-100 rounded-full transition-colors group"
      title="Giỏ hàng"
    >
      {/* Icon Giỏ Hàng */}
      <ShoppingBag className="w-5 h-5 text-gray-900 group-hover:text-blue-600 transition-colors" />

      {/* Số lượng (Badge) - Chỉ hiện khi > 0 */}
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold px-1 rounded-full bg-red-500 text-white border border-white shadow-sm">
          {count}
        </span>
      )}
    </Link>
  );
}