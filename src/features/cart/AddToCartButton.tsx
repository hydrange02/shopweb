"use client";

import React, { useState, useMemo } from "react";
import { useCart } from "@/features/cart/cart-context";
import type { Product } from "@/types/product";
import { productToCartItem } from "@/types/cart";
import { cn } from "@/app/lib/cn";

export default function AddToCartButton({
  product,
  disabled,
  fullWidth = true,
  className = "",
  showOptions = false,
}: {
  product: Product;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  showOptions?: boolean;
}) {
  const { dispatch } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // 🔥 Lấy danh sách size từ variants và loại bỏ trùng lặp
  const availableSizes = useMemo(() => {
    if (!showOptions || !product.variants) return [];
    return Array.from(
      new Set(product.variants.map((v) => v.size).filter(Boolean) as string[])
    );
  }, [product.variants, showOptions]);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (showOptions && availableSizes.length > 0 && !selectedSize) {
      alert("Vui lòng chọn kích thước trước khi thêm vào giỏ hàng!");
      return;
    }

    const cartItem = {
      ...productToCartItem(product, 1),
      selectedSize: selectedSize || undefined,
    };

    dispatch({ type: "ADD", payload: cartItem });
  };

  const hasVariants = availableSizes.length > 0;
  const isSizeMissing = showOptions && hasVariants && !selectedSize;
  const isOutOfStock = product.stock <= 0;

  return (
    <div className={cn("flex flex-col gap-4", fullWidth ? "w-full" : "")}>
      {showOptions && hasVariants && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex justify-between items-baseline mb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Chọn kích cỡ
            </h3>
            {selectedSize && (
              <span className="text-xs font-bold text-black">{selectedSize}</span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedSize(size);
                }}
                className={cn(
                  "min-w-[48px] h-11 px-4 rounded-xl border-2 text-sm font-bold transition-all duration-200",
                  selectedSize === size
                    ? "border-black bg-black text-white shadow-md scale-105"
                    : "border-gray-100 bg-white text-gray-600 hover:border-gray-300 hover:text-black"
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        disabled={disabled || isOutOfStock || isSizeMissing}
        onClick={handleAdd}
        className={cn(
          "h-14 text-base font-bold rounded-2xl border transition-all flex items-center justify-center shadow-xl",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:border-none",
          className || "bg-black text-white hover:bg-gray-800"
        )}
      >
        {isOutOfStock 
          ? "Tạm hết hàng" 
          : isSizeMissing 
            ? "Chọn kích cỡ" 
            : "Thêm vào giỏ"}
      </button>
    </div>
  );
}