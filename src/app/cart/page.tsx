"use client";
import { useCart } from "@/features/cart/cart-context";
import { formatVND } from "@/app/lib/format";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation"; // <--- 1. Thêm import này

export default function CartPage() {
  const { state, dispatch, subtotal, hydrated } = useCart();
  const router = useRouter(); // <--- 2. Khởi tạo router

  if (!hydrated) return null;

  const items = state.items;
  const shipping = items.length ? 15000 : 0;
  const total = subtotal + shipping;

  // <--- 3. Thêm hàm xử lý thanh toán
  const handleCheckout = () => {
    if (items.length === 0) return;

    // Tạo chuỗi query dạng: slug:quantity,slug:quantity
    // Ví dụ: san-pham-1:2,san-pham-2:1
    const queryItems = items
      .map((item) => `${item.slug}:${item.quantity}`)
      .join(",");

    // Chuyển hướng sang trang checkout
    router.push(`/checkout?items=${queryItems}`);
  };

  return (
    <main className="py-8">
      <h1 className="text-2xl font-semibold">Giỏ hàng</h1>

      {items.length === 0 ? (
        <div className="mt-6 text-gray-600">
          Giỏ hàng trống. <Link className="underline" href="/shop">Mua sắm ngay →</Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {items.map((it) => (
              <div key={it.productId} className="flex gap-4 border rounded-xl p-3">
                <Image
                  src={it.image || "/placeholder.png"}
                  alt={it.title}
                  width={96}
                  height={96}
                  className="rounded-md border object-cover"
                />
                <div className="flex-1">
                  <Link href={`/shop/${it.slug}`} className="font-medium hover:underline">
                    {it.title}
                  </Link>
                  <div className="text-sm text-gray-600 mt-1">{formatVND(it.price)}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <label className="text-sm">SL:</label>
                    <input
                      type="number"
                      min={1}
                      value={it.quantity}
                      onChange={(e) =>
                        dispatch({ type: "SET_QTY", payload: { productId: it.productId, quantity: Number(e.target.value) || 1 } })
                      }
                      className="w-20 h-9 px-2 border rounded-md"
                    />
                    <button
                      onClick={() => dispatch({ type: "REMOVE", payload: { productId: it.productId } })}
                      className="ml-auto h-9 px-3 rounded-md border"
                    >
                      Xoá
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="border rounded-xl p-4 h-fit">
            <h2 className="text-lg font-semibold">Tóm tắt</h2>
            <div className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span>Tạm tính</span><span>{formatVND(subtotal)}</span></div>
              <div className="flex justify-between"><span>Phí vận chuyển</span><span>{formatVND(shipping)}</span></div>
              <div className="flex justify-between font-semibold border-t pt-2"><span>Tổng</span><span>{formatVND(total)}</span></div>
            </div>
            
            {/* <--- 4. Gắn sự kiện onClick vào nút này */}
            <button 
              onClick={handleCheckout}
              className="mt-4 w-full h-10 rounded-md border bg-black text-white hover:opacity-90 transition"
            >
              Thanh toán
            </button>
            
            <button className="mt-2 w-full h-10 rounded-md border" onClick={() => dispatch({ type: "CLEAR" })}>
              Xoá toàn bộ
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}