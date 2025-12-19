"use client";
import { useCart } from "@/features/cart/cart-context";
import { formatVND } from "@/app/lib/format";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { state, dispatch, subtotal, hydrated } = useCart();
  const router = useRouter();

  if (!hydrated) return null;

  const items = state.items;
  const shipping = items.length ? 15000 : 0;
  const total = subtotal + shipping;

  // Hàm xử lý thanh toán: truyền thông tin slug và số lượng qua URL
  const handleCheckout = () => {
    if (items.length === 0) return;

    // Tạo chuỗi query dạng: slug:quantity,slug:quantity
    const queryItems = items
      .map((item) => `${item.slug}:${item.quantity}`)
      .join(",");

    // Chuyển hướng sang trang checkout
    router.push(`/checkout?items=${queryItems}`);
  };

  return (
    <main className="py-8">
      <h1 className="text-2xl font-semibold mb-6">Giỏ hàng của bạn</h1>

      {items.length === 0 ? (
        <div className="mt-6 text-gray-600 bg-gray-50 p-8 rounded-2xl text-center">
          <p className="mb-4">Giỏ hàng của bạn đang trống.</p>
          <Link 
            className="inline-block bg-black text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition" 
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
              <div key={`${it.productId}-${it.selectedSize || idx}`} className="flex gap-4 border border-gray-100 rounded-2xl p-4 bg-white shadow-sm">
                <div className="relative w-24 h-32 flex-shrink-0">
                  <Image
                    src={it.image || "/placeholder.png"}
                    alt={it.title}
                    fill
                    className="rounded-xl object-cover border border-gray-50"
                  />
                </div>
                
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link href={`/shop/${it.slug}`} className="font-bold text-lg hover:text-blue-600 transition">
                        {it.title}
                      </Link>
                      
                      {/* HIỂN THỊ SIZE NẾU CÓ */}
                      {it.selectedSize && (
                        <div className="mt-1">
                          <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                            Size: {it.selectedSize}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-gray-900">{formatVND(it.price)}</div>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-lg border border-gray-100">
                      <button 
                        onClick={() => dispatch({ 
                          type: "SET_QTY", 
                          payload: { productId: it.productId, quantity: it.quantity - 1 } 
                        })}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-md transition font-bold"
                      >-</button>
                      
                      <input
                        type="number"
                        min={1}
                        value={it.quantity}
                        onChange={(e) =>
                          dispatch({ 
                            type: "SET_QTY", 
                            payload: { productId: it.productId, quantity: Number(e.target.value) || 1 } 
                          })
                        }
                        className="w-10 text-center bg-transparent font-bold text-sm outline-none"
                      />

                      <button 
                        onClick={() => dispatch({ 
                          type: "SET_QTY", 
                          payload: { productId: it.productId, quantity: it.quantity + 1 } 
                        })}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-md transition font-bold"
                      >+</button>
                    </div>

                    <button
                      onClick={() => dispatch({ 
                        type: "REMOVE", 
                        payload: { productId: it.productId, selectedSize: it.selectedSize }
                      })}
                      className="text-xs font-bold text-red-500 hover:underline"
                    >
                      Xoá khỏi giỏ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* TÓM TẮT ĐƠN HÀNG */}
          <aside className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm h-fit sticky top-24">
            <h2 className="text-xl font-bold mb-6">Tóm tắt đơn hàng</h2>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Tạm tính</span>
                <span className="font-bold text-black">{formatVND(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Phí vận chuyển dự kiến</span>
                <span className="font-bold text-black">{formatVND(shipping)}</span>
              </div>
              <div className="border-t border-dashed pt-4 flex justify-between items-end">
                <span className="font-medium text-gray-900">Tổng cộng</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{formatVND(total)}</div>
                  <p className="text-[10px] text-gray-400 mt-1">Đã bao gồm thuế VAT</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleCheckout}
              className="mt-8 w-full h-14 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition shadow-xl active:scale-[0.98]"
            >
              Tiến hành thanh toán
            </button>
            
            <button 
              className="mt-3 w-full py-2 text-xs font-bold text-gray-400 hover:text-red-500 transition" 
              onClick={() => {
                if(confirm("Bạn có chắc chắn muốn xoá toàn bộ giỏ hàng?")) {
                  dispatch({ type: "CLEAR" });
                }
              }}
            >
              Xoá tất cả sản phẩm
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}