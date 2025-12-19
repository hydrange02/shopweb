"use client";

import { useMemo, useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { calcTotals } from "@/lib/checkout";
import { createOrder } from "@/services/orders";
import { apiFetch } from "@/lib/api";
import { formatVND } from "@/app/lib/format";
import { useCart } from "@/features/cart/cart-context";
import Image from "next/image";
import {
  CheckCircle2,
  CreditCard,
  Loader2,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

type PM = "cod" | "banking" | "momo";

function CheckoutContent() {
  const sp = useSearchParams();
  const router = useRouter();
  const { dispatch } = useCart();

  const itemsParam = sp.get("items") || "";

  // State quản lý dữ liệu sản phẩm lấy từ Database
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // State quản lý Form và Lỗi
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addr, setAddr] = useState("");
  const [pm, setPM] = useState<PM>("cod");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ phone?: string }>({});

  // 1. Tải dữ liệu sản phẩm thực tế từ Backend dựa trên Slug trong URL
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
            const [slug, qty, size] = pair.split(":"); // Thêm size vào đây nếu URL có dạng slug:qty:size
            const res = await apiFetch<{ ok: boolean; product: any }>(
              `/api/v1/products/slug/${slug}`
            );
            return {
              product: res.product,
              quantity: parseInt(qty || "1"),
              size: size || "", // Lưu size vào object này
            };
          })
        );
        setDbProducts(data.filter(Boolean));
      } catch (err) {
        setError("Không thể tải thông tin sản phẩm.");
      } finally {
        setLoadingProducts(false);
      }
    };
    loadRealData();
  }, [itemsParam]);

  // 2. Tính toán tổng tiền dựa trên dữ liệu thực tế
  const totals = useMemo(() => {
    const itemsForCalc = dbProducts.map((item) => ({
      // Ưu tiên giá đã giảm nếu có trong database
      price: item.product.discountPercent
        ? Math.round(
            item.product.price * (1 - item.product.discountPercent / 100)
          )
        : item.product.price,
      quantity: item.quantity,
    }));
    return calcTotals(itemsForCalc, addr);
  }, [dbProducts, addr]);

  // 3. Xử lý đặt hàng
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

      // Xóa giỏ hàng khi thành công
      dispatch({ type: "CLEAR" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi đặt hàng.");
    } finally {
      setSubmitting(false);
    }
  }

  // Màn hình Loading
  if (loadingProducts) {
    return (
      <div className="py-32 text-center flex flex-col items-center gap-4">
        <Loader2 className="animate-spin w-10 h-10 text-blue-500" />
        <p className="text-gray-500 font-medium">
          Đang xác thực thông tin sản phẩm...
        </p>
      </div>
    );
  }

  // Màn hình Thành công
  if (result) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-2xl border border-green-50 text-center">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-2">Đặt hàng thành công!</h2>
          <p className="text-gray-500 mb-8">
            Mã đơn hàng:{" "}
            <span className="font-mono font-bold text-black uppercase">
              #{result._id.slice(-6)}
            </span>
          </p>

          <div className="text-left bg-gray-50 p-6 rounded-3xl mb-8 space-y-4 border border-gray-100 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Người nhận:</span>
              <span className="font-bold">{result.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Địa chỉ:</span>
              <span className="font-bold text-right ml-4">
                {result.customerAddress}
              </span>
            </div>
            <div className="flex justify-between border-t pt-4 font-bold text-lg">
              <span>Tổng thanh toán:</span>
              <span className="text-blue-600">{formatVND(result.total)}</span>
            </div>
          </div>

          {pm !== "cod" && (
            <div className="bg-blue-50 p-6 rounded-3xl mb-8 border border-blue-100 text-left">
              <div className="flex items-center gap-3 mb-3 text-blue-700">
                <CreditCard className="w-5 h-5" />
                <span className="font-bold uppercase text-xs tracking-widest">
                  Hướng dẫn thanh toán
                </span>
              </div>
              <p className="text-sm">
                Vui lòng chuyển khoản <b>{formatVND(result.total)}</b> vào STK{" "}
                <b>0123456789 (MB Bank)</b> với nội dung:{" "}
                <b>{result._id.slice(-6).toUpperCase()}</b>
              </p>
            </div>
          )}

          <button
            onClick={() => router.push("/shop")}
            className="w-full h-14 bg-black text-white rounded-2xl font-bold hover:opacity-80 transition shadow-lg"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="grid md:grid-cols-3 gap-8 py-10">
      <div className="md:col-span-2 space-y-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-4xl font-bold tracking-tighter">Thanh toán</h1>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Thông tin giao hàng
            </h3>
            <input
              className="w-full h-12 px-5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500/20 outline-none"
              placeholder="Họ tên người nhận *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div className="space-y-1">
              <input
                className={`w-full h-12 px-5 rounded-2xl bg-gray-50 border-none focus:ring-2 outline-none ${
                  fieldErrors.phone
                    ? "ring-2 ring-red-500/50"
                    : "focus:ring-blue-500/20"
                }`}
                placeholder="Số điện thoại *"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              {fieldErrors.phone && (
                <p className="text-[11px] text-red-500 font-bold ml-2 italic">
                  {fieldErrors.phone}
                </p>
              )}
            </div>
            <textarea
              className="w-full p-5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500/20 outline-none"
              placeholder="Địa chỉ chi tiết (Số nhà, đường, phường/xã...) *"
              rows={3}
              value={addr}
              onChange={(e) => setAddr(e.target.value)}
              required
            />
            <textarea
              className="w-full p-5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500/20 outline-none"
              placeholder="Ghi chú đơn hàng"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
              Phương thức thanh toán
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(["cod", "banking", "momo"] as PM[]).map((m) => (
                <label
                  key={m}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    pm === m
                      ? "border-black bg-black text-white shadow-md"
                      : "border-gray-100 bg-white hover:border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    className="hidden"
                    checked={pm === m}
                    onChange={() => setPM(m)}
                  />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {m}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-16 bg-black text-white rounded-[24px] font-bold hover:opacity-90 transition shadow-xl flex items-center justify-center gap-3"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" /> Đang xử lý...
              </>
            ) : (
              "Xác nhận đặt hàng"
            )}
          </button>
        </form>
      </div>

      <aside className="space-y-6">
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 sticky top-24">
          <h2 className="font-bold text-xl mb-6 flex justify-between">
            Tóm tắt <span>{dbProducts.length} món</span>
          </h2>
          <div className="space-y-4 mb-8 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {dbProducts.map((it, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                  <Image
                    src={it.product.images?.[0] || "/placeholder.png"}
                    alt={it.product.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate leading-tight">
                    {it.product.title}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1 italic">
                    Số lượng: {it.quantity}
                  </p>
                  <p className="text-sm font-bold mt-1 text-gray-800">
                    {formatVND(it.product.price * it.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t pt-5 space-y-3">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Tạm tính</span>
              <span>{formatVND(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Phí ship</span>
              <span>{formatVND(totals.shippingFee)}</span>
            </div>
            <div className="flex justify-between font-bold text-2xl pt-4 border-t mt-2">
              <span>Tổng cộng</span>
              <span className="text-blue-600">{formatVND(totals.total)}</span>
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-gray-400 animate-pulse font-bold tracking-widest uppercase text-xs">
          Đang tải dữ liệu đơn hàng...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
