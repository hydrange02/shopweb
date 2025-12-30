"use client";

import { useState } from "react";
import Image from "next/image";
import { Truck, ShieldCheck, Minus, Plus, ShoppingBag } from "lucide-react";
import type { Product } from "@/types/product";
import { useCart } from "@/features/cart/cart-context"; 
import toast from "react-hot-toast";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

export default function ProductPageContent({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart(); 

  const currentVariant = product.variants?.find((v) => v.size === selectedSize);
  const maxStock = currentVariant ? currentVariant.stock : (product.stock || 0);

  const handleQuantity = (type: "inc" | "dec") => {
    if (type === "dec" && quantity > 1) setQuantity(quantity - 1);
    if (type === "inc" && quantity < maxStock) setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    if (product.variants && product.variants.length > 0 && !selectedSize) {
      toast.error("Vui lòng chọn Size trước khi thêm vào giỏ!");
      return;
    }
    if (maxStock <= 0) {
      toast.error("Sản phẩm tạm hết hàng!");
      return;
    }
    addToCart({ productId: product._id, quantity, selectedSize });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="space-y-4">
        <div className="relative aspect-square bg-gray-100 rounded-3xl overflow-hidden border border-gray-200">
          {product.images?.[0] ? (
            <Image src={product.images[0]} alt={product.title} fill className="object-cover" priority />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-300">No Image</div>
          )}
        </div>
      </div>

      <div className="flex flex-col">
        <div className="mb-2">
           <span className="px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
             {product.category || "New Arrival"}
           </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">{product.title}</h1>
        <div className="flex items-center gap-4 mb-6">
          <p className="text-2xl font-bold text-black">{formatPrice(product.price)}</p>
          {product.price && product.price > product.price && (
             <p className="text-lg text-gray-400 line-through">{formatPrice(product.price)}</p>
          )}
        </div>

        {product.variants && product.variants.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold uppercase tracking-wider text-gray-900">Chọn Size</span>
              <span className="text-xs text-gray-500 font-medium">{selectedSize ? `Còn ${maxStock} sản phẩm` : "Vui lòng chọn size"}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {product.variants.map((variant) => (
                <button
                  key={variant.size}
                  onClick={() => { setSelectedSize(variant.size); setQuantity(1); }}
                  disabled={variant.stock <= 0}
                  className={`min-w-[48px] h-12 px-4 rounded-xl border font-bold text-sm transition-all ${selectedSize === variant.size ? "border-black bg-black text-white shadow-lg scale-105" : "border-gray-200 bg-white text-gray-900 hover:border-black"} ${variant.stock <= 0 ? "opacity-30 cursor-not-allowed bg-gray-50" : ""}`}
                >
                  {variant.size}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4 mb-8">
          <div className="h-14 bg-gray-50 rounded-2xl flex items-center px-4 border border-gray-200">
            <button onClick={() => handleQuantity("dec")} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition" disabled={quantity <= 1}><Minus className="w-4 h-4" /></button>
            <span className="w-12 text-center font-bold text-lg">{quantity}</span>
            <button onClick={() => handleQuantity("inc")} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition" disabled={quantity >= maxStock}><Plus className="w-4 h-4" /></button>
          </div>
          <button onClick={handleAddToCart} disabled={maxStock <= 0} className="flex-1 h-14 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
            <ShoppingBag className="w-5 h-5" />
            {maxStock > 0 ? "Thêm vào giỏ" : "Hết hàng"}
          </button>
        </div>

        <div className="space-y-4 bg-gray-50 p-6 rounded-2xl">
          <div className="flex items-center gap-3"><Truck className="w-5 h-5 text-gray-600" /><span className="text-sm font-medium">Miễn phí vận chuyển cho đơn trên 500k</span></div>
          <div className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-gray-600" /><span className="text-sm font-medium">Bảo hành chính hãng 12 tháng</span></div>
        </div>

        {product.description && (
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4">Mô tả sản phẩm</h3>
            <div className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</div>
          </div>
        )}
      </div>
    </div>
  );
}