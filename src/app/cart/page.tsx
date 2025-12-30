// src/app/cart/page.tsx
"use client";
import { useCart } from "@/features/cart/cart-context";
import { formatVND } from "@/app/lib/format";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2 } from "lucide-react";

export default function CartPage() {
  // 🔥 Sử dụng đúng các hàm từ Context mới
  const { items, updateQuantity, removeFromCart, subtotal, hydrated } = useCart();
  const router = useRouter();

  if (!hydrated) return null;

  const shipping = items.length ? 15000 : 0; // Phí ship demo
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (items.length === 0) return;

    // 🔥 FIX QUAN TRỌNG: Thêm selectedSize vào chuỗi query
    // Format: slug:qty:size
    const queryItems = items
      .map((item) => `${item.slug}:${item.quantity}:${item.selectedSize || ""}`)
      .join(",");

    router.push(`/checkout?items=${queryItems}`);
  };

  return (
    <main className="py-8 px-4 container mx-auto max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Giỏ hàng của bạn</h1>

      {items.length === 0 ? (
        <div className="mt-6 text-center bg-gray-50 p-12 rounded-[32px]">
          <p className="mb-6 text-gray-500">Giỏ hàng đang trống trơn...</p>
          <Link 
            className="inline-block bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition shadow-lg" 
            href="/shop"
          >
            Mua sắm ngay →
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* DANH SÁCH SẢN PHẨM */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((it, idx) => (
              <div key={`${it.productId}-${it.selectedSize || idx}`} className="flex gap-6 border border-gray-100 rounded-[24px] p-5 bg-white shadow-sm hover:shadow-md transition">
                <div className="relative w-28 h-36 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                  <Image
                    src={it.image || "/placeholder.png"}
                    alt={it.title || "Product"}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <Link href={`/shop/${it.slug}`} className="font-bold text-lg hover:text-blue-600 transition line-clamp-1">
                          {it.title}
                        </Link>
                        
                        {/* HIỂN THỊ SIZE */}
                        {it.selectedSize && (
                          <div className="mt-2">
                            <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-1 rounded-lg font-bold uppercase tracking-wider border border-gray-200">
                              Size: {it.selectedSize}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="font-bold text-lg text-gray-900">{formatVND(it.price || 0)}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {/* Bộ tăng giảm số lượng */}
                    <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200">
                      <button 
                        onClick={() => updateQuantity(it.productId, it.quantity - 1, it.selectedSize || "")}
                        disabled={it.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition disabled:opacity-30"
                      ><Minus className="w-3 h-3" /></button>
                      
                      <span className="w-8 text-center font-bold text-sm">{it.quantity}</span>

                      <button 
                        onClick={() => updateQuantity(it.productId, it.quantity + 1, it.selectedSize || "")}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition"
                      ><Plus className="w-3 h-3" /></button>
                    </div>

                    <button
                      onClick={() => removeFromCart(it.productId, it.selectedSize || "")}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* TÓM TẮT ĐƠN HÀNG */}
          <aside className="bg-white border border-gray-200 rounded-[32px] p-8 shadow-sm h-fit sticky top-24">
            <h2 className="text-xl font-bold mb-6">Tổng đơn hàng</h2>
            <div className="space-y-4 text-sm mb-8">
              <div className="flex justify-between text-gray-500">
                <span>Tạm tính</span>
                <span className="font-bold text-black">{formatVND(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Vận chuyển</span>
                <span className="font-bold text-black">{formatVND(shipping)}</span>
              </div>
              <div className="border-t border-dashed pt-4 flex justify-between items-end">
                <span className="font-bold text-lg text-gray-900">Tổng cộng</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{formatVND(total)}</div>
                  <p className="text-[10px] text-gray-400 mt-1">Đã bao gồm VAT</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleCheckout}
              className="w-full h-14 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition shadow-xl active:scale-[0.98] flex items-center justify-center"
            >
              Tiến hành thanh toán
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}