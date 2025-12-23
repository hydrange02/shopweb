// src/app/shop/page.tsx
"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useMemo, Suspense } from "react";
import ProductCard from "@/app/components/ProductCard";
import { useProductsQuery } from "@/hooks/useProductsQuery";
import { ChevronDown, Filter } from "lucide-react";
import { cn } from "@/app/lib/cn";
import PageTransition from "@/app/components/PageTransition"; // 🔥 1. Import Component

const LIMIT = 12;
const CATEGORIES = ["Tất cả", "Áo", "Quần", "Váy", "Phụ kiện"];

function ShopContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pageParam = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
  const qParam = searchParams.get("q") || "";

  const queryArgs = useMemo(() => ({ 
    page: pageParam, 
    limit: LIMIT, 
    q: qParam || undefined 
  }), [pageParam, qParam]);
  
  const { data, isLoading, isError } = useProductsQuery(queryArgs);

  function setUrl(next: { page?: number; q?: string | null }) {
    const sp = new URLSearchParams(searchParams.toString());
    if (typeof next.page === "number") sp.set("page", String(next.page));
    if (next.q !== undefined) {
      sp.set("q", next.q && next.q.trim() ? next.q.trim() : "");
      if (!sp.get("q")) sp.delete("q");
      sp.set("page", "1");
    }
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    // 🔥 2. Thay div thường bằng PageTransition để có hiệu ứng
    <PageTransition className="flex flex-col w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Cửa hàng</h1>
      </div>

      <div className="sticky top-16 z-30 bg-white/80 backdrop-blur-md py-4 mb-8 border-b border-gray-100">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Lọc theo:</span>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button 
                key={cat}
                onClick={() => setUrl({ q: cat === "Tất cả" ? "" : cat })}
                className={cn(
                  "px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border",
                  (qParam === cat || (cat === "Tất cả" && !qParam)) 
                    ? "bg-black text-white border-black shadow-md" 
                    : "bg-white text-gray-600 border-gray-200 hover:border-black"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

           <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-400 hidden sm:block">Sắp xếp:</span>
            <div className="relative">
              <select className="appearance-none bg-gray-50 pl-4 pr-10 py-2 rounded-full text-xs font-bold border-none focus:ring-1 focus:ring-black cursor-pointer uppercase tracking-tighter">
                <option>Mới nhất</option>
                <option>Giá thấp đến cao</option>
                <option>Giá cao đến thấp</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-[400px]">
         {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-100 rounded-3xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="py-20 text-center text-red-500 bg-red-50 rounded-3xl">
            <p className="font-medium">Không thể kết nối với máy chủ</p>
          </div>
        ) : data && data.data.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {data.data.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        ) : (
          <div className="py-32 text-center">
            <p className="text-gray-500 font-medium">Không tìm thấy sản phẩm...</p>
            <button onClick={() => setUrl({ q: "" })} className="mt-4 text-blue-600 text-sm font-bold hover:underline">
              Xem tất cả
            </button>
          </div>
        )}
      </div>

      {/* PHẦN PHÂN TRANG */}
      {data && data.total > LIMIT && (
        <div className="mt-20 flex items-center justify-center gap-6 border-t pt-10">
          <button
            className="group flex items-center gap-2 h-12 px-8 rounded-full border border-gray-200 text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:bg-black hover:text-white disabled:opacity-20"
            onClick={() => setUrl({ page: pageParam - 1 })}
            disabled={pageParam <= 1}
          >
            Quay lại
          </button>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 flex items-center justify-center bg-black text-white rounded-full text-xs font-bold">{data.page}</span>
            <span className="text-gray-300">/</span>
            <span className="text-xs font-bold text-gray-500">{Math.ceil(data.total / LIMIT)}</span>
          </div>
          <button
            className="group flex items-center gap-2 h-12 px-8 rounded-full border border-gray-200 text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:bg-black hover:text-white disabled:opacity-20"
            onClick={() => setUrl({ page: data.page + 1 })}
            disabled={!data.hasNext} 
          >
            Tiếp theo
          </button>
        </div>
      )}
    </PageTransition>
  );
}

export default function ShopPage() {
  return (
    <main className="py-12">
      <Suspense fallback={<div className="py-20 text-center text-xs font-bold uppercase tracking-widest text-gray-400">Đang tải cửa hàng...</div>}>
        <ShopContent />
      </Suspense>
    </main>
  );
} 