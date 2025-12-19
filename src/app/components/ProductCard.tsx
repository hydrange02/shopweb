"use client";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";
import { formatVND } from "@/app/lib/format";
import AddToCartButton from "@/features/cart/AddToCartButton";
import { Star } from "lucide-react";

export default function ProductCard({ product }: { product: Product }) {
  const { title, price, slug, images, stock, brand, rating, discountPercent } = product;
  const image = images?.[0] ?? "/placeholder.svg";
  const discountedPrice = discountPercent ? Math.round(price * (1 - discountPercent / 100)) : price;

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
      {/* Image Container */}
      <Link href={`/shop/${slug}`} className="block relative aspect-[4/5] overflow-hidden bg-[#f5f5f7]">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discountPercent && discountPercent > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">
              -{discountPercent}%
            </span>
          )}
          {stock <= 0 && (
            <span className="bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm">
              Hết hàng
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col gap-1">
        <div className="flex justify-between items-start">
          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-widest">{brand || "Shoply Basic"}</p>
          <div className="flex items-center gap-0.5 text-amber-400">
            <Star className="w-3 h-3 fill-current" />
            <span className="text-[11px] font-bold text-gray-600">{rating || 5}</span>
          </div>
        </div>
        
        <Link href={`/shop/${slug}`}>
          <h3 className="text-[14px] font-medium text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
        </Link>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-base font-semibold text-gray-900">{formatVND(discountedPrice)}</span>
          {discountPercent && (
            <span className="text-xs text-gray-400 line-through">{formatVND(price)}</span>
          )}
        </div>

        {/* Action Button - Hiện ra khi hover trên desktop */}
        <div className="mt-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <AddToCartButton 
            product={product} 
            disabled={stock <= 0} 
            className="rounded-full bg-gray-900 text-white hover:bg-black border-none h-9 text-[12px] font-medium"
          />
        </div>
      </div>
    </div>
  );
}