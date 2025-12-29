import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/services/products";
import { formatVND } from "@/app/lib/format";
import AddToCartButton from "@/features/cart/AddToCartButton";
import ProductCard from "@/app/components/ProductCard";
import { apiFetch } from "@/lib/api";
import type { Product } from "@/types/product";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getProductBySlug(slug);
    if (!product) return { title: "Không tìm thấy sản phẩm" };
    return { title: `${product.title} — hydrange` };
  } catch (error) {
    return { title: "Sản phẩm — hydrange" };
  }
}

/**
 * Component hiển thị 4 sản phẩm đề cử
 */
async function RecommendedProducts({ category, currentSlug }: { category?: string; currentSlug: string }) {
  let recommended: Product[] = [];
  try {
    const res = await apiFetch<{ data: Product[] }>(`/api/v1/products?limit=5&q=${encodeURIComponent(category || "")}`);
    recommended = res.data
      .filter(p => p.slug !== currentSlug)
      .slice(0, 4);
  } catch (error) {
    console.error("Lỗi lấy sản phẩm đề cử:", error);
  }

  if (recommended.length === 0) return null;

  return (
    <section className="mt-24 border-t border-gray-100 pt-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Sản phẩm tương tự</h3>
          <p className="text-sm text-gray-500 mt-1">Gợi ý dựa trên phong cách bạn đang xem</p>
        </div>
        <Link href="/shop" className="text-sm font-bold text-blue-600 hover:underline">
          Xem tất cả →
        </Link>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {recommended.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </section>
  );
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let product: Product | null = null;
  try {
    product = await getProductBySlug(slug);
  } catch (error) {
    return notFound();
  }

  if (!product) return notFound();

  const image = product.images?.[0] ?? "/placeholder.png";
  const stock = product.stock ?? 0;
  const isOutOfStock = stock <= 0;
  
  const hasDiscount = (product.discountPercent || 0) > 0;
  const originalPrice = product.price;
  const finalPrice = hasDiscount
    ? Math.round(originalPrice * (1 - (product.discountPercent || 0) / 100))
    : originalPrice;

  return (
    <main className="py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        {/* Cột Trái: Ảnh sản phẩm */}
        <div className="sticky top-24 h-fit">
          <div className="relative aspect-square overflow-hidden rounded-[32px] bg-[#f5f5f7] shadow-sm border border-gray-100">
            <Image
              src={image}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              priority
            />
            {hasDiscount && (
               <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  -{product.discountPercent}%
               </div>
            )}
          </div>
        </div>

        {/* Cột Phải: Thông tin chi tiết */}
        <div className="flex flex-col py-2">
          <div className="mb-8 border-b border-gray-100 pb-8">
            <div className="flex items-center justify-between mb-3">
               <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-600 block">
                 {product.brand || "hydrange Exclusive"}
               </span>
               <div className="flex items-center gap-1 text-amber-500">
                  <span className="text-xs font-bold">{product.rating || 5.0}</span>
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
               </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4 leading-tight">{product.title}</h1>
            
            <div className="flex items-end gap-4 mt-6">
              <span className="text-4xl font-bold text-gray-900">{formatVND(finalPrice)}</span>
              {hasDiscount && (
                <span className="text-xl text-gray-400 line-through font-medium mb-1.5">{formatVND(originalPrice)}</span>
              )}
            </div>
          </div>

          {/* Mô tả ngắn */}
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Mô tả</h3>
            <div className="text-gray-600 leading-relaxed text-[15px] whitespace-pre-line">
              {product.description || "Sản phẩm được thiết kế tinh tế với chất liệu cao cấp, mang lại cảm giác thoải mái tối đa cho người sử dụng."}
            </div>
          </div>

          {/* Khu vực Hành động (Action Area) */}
          <div className="mt-auto bg-gray-50/50 p-6 rounded-[24px] border border-gray-100">
             {/* Component AddToCartButton đã được nâng cấp để hiển thị Size Selector */}
             <div className="flex flex-col gap-6">
                <AddToCartButton
                  product={product}
                  disabled={isOutOfStock}
                  showOptions={true} // 🔥 Kích hoạt tính năng chọn Size
                  className="w-full h-14 bg-black text-white hover:bg-gray-800 rounded-2xl text-base font-bold shadow-xl transition-all"
                />
                
                <button
                  type="button"
                  className="w-full h-12 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-black hover:border-black font-bold text-sm transition-all"
                >
                  Thêm vào Yêu thích
                </button>
             </div>
             
             {/* Stock indicator */}
             <div className="mt-4 flex items-center justify-center gap-2">
               <div className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-green-500'}`} />
               <span className="text-xs font-medium text-gray-500">
                 {isOutOfStock ? "Hết hàng" : `Còn lại ${stock} sản phẩm trong kho`}
               </span>
             </div>
          </div>
        </div>
      </div>

      <RecommendedProducts category={product.category} currentSlug={product.slug} />
    </main>
  );
}