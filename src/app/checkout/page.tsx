"use client";

import { useMemo, useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { calcTotals } from "@/lib/checkout";
import { createOrder } from "@/services/orders";
import { apiFetch } from "@/lib/api";
import { formatVND } from "@/app/lib/format";
import { useCart } from "@/features/cart/cart-context"; // Import Context mới
import Image from "next/image";
import { CheckCircle2, CreditCard, Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import type { Product } from "@/types/product";
import type { Order } from "@/types/order";

type PM = "cod" | "banking" | "momo";

interface DbProductItem {
  product: Product;
  quantity: number;
  selectedSize: string;
}

function CheckoutContent() {
  const sp = useSearchParams();
  const router = useRouter();
  
  // 🔥 FIX: Thay dispatch bằng clearCart
  const { clearCart } = useCart(); 

  const itemsParam = sp.get("items") || "";

  const [dbProducts, setDbProducts] = useState<DbProductItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addr, setAddr] = useState("");
  const [pm, setPM] = useState<PM>("cod");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ phone?: string }>({});

  useEffect(() => {
    const loadRealData = async () => {
      const pairs = itemsParam.split(",").filter(Boolean);
      if (pairs.length === 0) {
        setLoadingProducts(false);
        return;
      }

      try {
        const data = await Promise.all(
          pairs.map(async (pair) => {
            const [slug, qty, size] = pair.split(":").map(s => decodeURIComponent(s));
            try {
              const res = await apiFetch<{ ok: boolean; product: Product }>(`/api/v1/products/slug/${slug}`);
              return {
                product: res.product,
                quantity: parseInt(qty || "1", 10),
                selectedSize: size || "",
              };
            } catch {
              return null;
            }
          })
        );
        setDbProducts(data.filter((item): item is DbProductItem => item !== null));
      } catch {
        setError("Không thể tải thông tin sản phẩm.");
      } finally {
        setLoadingProducts(false);
      }
    };
    loadRealData();
  }, [itemsParam]);

  const totals = useMemo(() => {
    const itemsForCalc = dbProducts.map((item) => ({
      price: item.product.discountPercent
        ? Math.round(item.product.price * (1 - item.product.discountPercent / 100))
        : item.product.price,
      quantity: item.quantity,
    }));
    return calcTotals(itemsForCalc, addr);
  }, [dbProducts, addr]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (dbProducts.length === 0) {
      setError("Giỏ hàng của bạn đang trống.");
      return;
    }

    if (phone.length > 0 && phone.length < 8) {
      setFieldErrors({ phone: "Số điện thoại phải có ít nhất 8 chữ số" });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerName: name,
        customerPhone: phone,
        customerAddress: addr,
        paymentMethod: pm,
        note,
        items: dbProducts.map((x) => ({
          productId: x.product._id,
          quantity: x.quantity,
          selectedSize: x.selectedSize,
        })),
      };

      const j = await createOrder(payload);
      setResult(j.order);

      // 🔥 FIX: Gọi hàm clearCart() thay vì dispatch
      clearCart();
      
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Có lỗi xảy ra khi đặt hàng.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingProducts) {
    return (
      <div className="py-32 text-center flex flex-col items-center gap-4">
        <Loader2 className="animate-spin w-10 h-10 text-blue-500" />
        <p className="text-gray-500 font-medium">Đang xác thực thông tin...</p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-2xl border border-green-50 text-center">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-2 text-black">Đặt hàng thành công!</h2>
          <p className="text-gray-500 mb-8">
            Mã đơn hàng: <span className="font-mono font-bold text-black uppercase">#{result._id.slice(-6)}</span>
          </p>

          <div className="text-left bg-gray-50 p-6 rounded-3xl mb-8 space-y-4 border border-gray-100 text-sm">
             <div className="flex justify-between text-black"><span className="text-gray-400">Người nhận:</span><span className="font-bold">{result.customerName}</span></div>
             <div className="flex justify-between border-t pt-4 font-bold text-lg text-black"><span>Tổng thanh toán:</span><span className="text-blue-600">{formatVND(result.total)}</span></div>
          </div>

          <button onClick={() => router.push("/shop")} className="w-full h-14 bg-black text-white rounded-2xl font-bold hover:opacity-80 transition shadow-lg">Tiếp tục mua sắm</button>
        </div>
      </div>
    );
  }

  return (
    <section className="grid md:grid-cols-3 gap-8 py-10 container mx-auto px-4">
      <div className="md:col-span-2 space-y-8 text-black">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition"><ArrowLeft className="w-6 h-6" /></button>
          <h1 className="text-4xl font-bold tracking-tighter">Thanh toán</h1>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Thông tin giao hàng</h3>
            <input className="w-full h-12 px-5 rounded-2xl bg-gray-50 text-black border-none outline-none" placeholder="Họ tên người nhận *" value={name} onChange={(e) => setName(e.target.value)} required />
            <input className="w-full h-12 px-5 rounded-2xl bg-gray-50 text-black border-none outline-none" placeholder="Số điện thoại *" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            <textarea className="w-full p-5 rounded-2xl bg-gray-50 text-black border-none outline-none" placeholder="Địa chỉ chi tiết *" rows={3} value={addr} onChange={(e) => setAddr(e.target.value)} required />
            <textarea className="w-full p-5 rounded-2xl bg-gray-50 text-black border-none outline-none" placeholder="Ghi chú đơn hàng" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Phương thức thanh toán</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(["cod", "banking", "momo"] as PM[]).map((m) => (
                <label key={m} className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${pm === m ? "border-black bg-black text-white" : "border-gray-100 bg-white text-black"}`}>
                  <input type="radio" className="hidden" checked={pm === m} onChange={() => setPM(m)} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{m}</span>
                </label>
              ))}
            </div>
          </div>

          {error && <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</div>}

          <button type="submit" disabled={submitting} className="w-full h-16 bg-black text-white rounded-[24px] font-bold shadow-xl flex items-center justify-center gap-3">
            {submitting ? <><Loader2 className="animate-spin w-5 h-5" /> Đang xử lý...</> : "Xác nhận đặt hàng"}
          </button>
        </form>
      </div>

      <aside className="space-y-6">
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 sticky top-24 text-black">
          <h2 className="font-bold text-xl mb-6 flex justify-between">Tóm tắt <span>{dbProducts.length} món</span></h2>
          <div className="space-y-4 mb-8 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {dbProducts.map((it, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                  <Image src={it.product.images?.[0] || "/placeholder.png"} alt={it.product.title} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate text-black">{it.product.title}</p>
                  <p className="text-[11px] text-gray-400 mt-1 italic">SL: {it.quantity} {it.selectedSize && ` - Size: ${it.selectedSize}`}</p>
                  <p className="text-sm font-bold mt-1 text-gray-800">{formatVND(it.product.price * it.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t pt-5 space-y-3">
            <div className="flex justify-between text-sm text-gray-500"><span>Tạm tính</span><span className="text-black">{formatVND(totals.subtotal)}</span></div>
            <div className="flex justify-between text-sm text-gray-500"><span>Phí ship</span><span className="text-black">{formatVND(totals.shippingFee)}</span></div>
            <div className="flex justify-between font-bold text-2xl pt-4 border-t mt-2 text-black"><span>Tổng cộng</span><span className="text-blue-600">{formatVND(totals.total)}</span></div>
          </div>
        </div>
      </aside>
    </section>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center">Đang tải dữ liệu...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}