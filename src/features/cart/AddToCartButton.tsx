"use client";

import React, { useState, useMemo } from "react";
import { useCart } from "@/features/cart/cart-context";
import type { Product } from "@/types/product";
import { cn } from "@/app/lib/cn";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

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
  const { addToCart, isLoading } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const availableSizes = useMemo(() => {
    if (!showOptions || !product.variants) return [];
    return Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean) as string[]));
  }, [product.variants, showOptions]);

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (showOptions && availableSizes.length > 0 && !selectedSize) {
      toast.error("Vui lòng chọn kích thước!");
      return;
    }

    await addToCart({
      productId: product._id,
      quantity: 1,
      selectedSize: selectedSize || "",
    });
  };

  const hasVariants = availableSizes.length > 0;
  const isSizeMissing = showOptions && hasVariants && !selectedSize;
  const isOutOfStock = (product.stock || 0) <= 0;

  return (
    <div className={cn("flex flex-col gap-4", fullWidth ? "w-full" : "")}>
      {showOptions && hasVariants && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex justify-between items-baseline mb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Chọn kích cỡ</h3>
            {selectedSize && <span className="text-xs font-bold text-black">{selectedSize}</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={(e) => { e.preventDefault(); setSelectedSize(size); }}
                className={cn(
                  "min-w-[48px] h-11 px-4 rounded-xl border-2 text-sm font-bold transition-all",
                  selectedSize === size
                    ? "border-black bg-black text-white shadow-md scale-105"
                    : "border-gray-100 bg-white text-gray-600 hover:border-black"
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
        disabled={disabled || isOutOfStock || isSizeMissing || isLoading}
        onClick={handleAdd}
        className={cn(
          "h-14 text-base font-bold rounded-2xl border transition-all flex items-center justify-center gap-2 shadow-xl",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100",
          className || "bg-black text-white hover:bg-gray-800"
        )}
      >
        {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : null}
        {isOutOfStock ? "Tạm hết hàng" : isSizeMissing ? "Chọn kích cỡ" : "Thêm vào giỏ"}
      </button>
    </div>
  );
}