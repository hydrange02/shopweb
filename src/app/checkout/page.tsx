"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PRODUCTS } from "@/mock/products";
import { calcTotals } from "@/lib/checkout";
import { getProductBySlug } from "@/services/products";
import { createOrder } from "@/services/orders";
import { formatVND } from "@/app/lib/format";
import Image from "next/image"; // 👇 SỬA 1: Dùng Image của Next.js

type PM = "cod" | "banking" | "momo";

export default function CheckoutPage() {
  const sp = useSearchParams();
  const router = useRouter();

  const itemsParam = sp.get("items") || "";
  const parsed = useMemo(() => {
    const list = itemsParam
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean)
      .map((pair) => {
        const [slug, qty] = pair.split(":");
        return { slug, quantity: Math.max(parseInt(qty || "1", 10), 1) };
      });
    
    const enriched = list
      .map((it) => {
        const p = PRODUCTS.find((x) => x.slug === it.slug);
        return p ? { ...it, product: p } : null;
      })
      .filter(Boolean) as {
      slug: string;
      quantity: number;
      product: (typeof PRODUCTS)[number];
    }[];
    return enriched;
  }, [itemsParam]);

  const totals = useMemo(() => {
    return calcTotals(
      parsed.map((x) => ({ price: x.product.price, quantity: x.quantity })),
      ""
    );
  }, [parsed]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addr, setAddr] = useState("");
  const [pm, setPM] = useState<PM>("cod");
  const [note, setNote] = useState("");
  
  // 👇 SỬA 2: Sử dụng biến submitting ở nút bấm bên dưới
  const [submitting, setSubmitting] = useState(false);
  
  // 👇 SỬA 3: Bỏ any, dùng kiểu cụ thể cho result
  const [result, setResult] = useState<{ id: string; status: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!parsed.length) {
      setError("Giỏ hàng trống hoặc tham số URL không hợp lệ.");
      return;
    }
    if (!name || !addr) {
      setError("Vui lòng nhập Họ tên và Địa chỉ.");
      return;
    }
    setSubmitting(true);
    try {
      const items = await Promise.all(
        parsed.map(async (x) => {
          const beProduct = await getProductBySlug(x.product.slug);
          return { productId: beProduct._id, quantity: x.quantity };
        })
      );

      const payload = {
        customerName: name,
        customerPhone: phone,
        customerAddress: addr,
        paymentMethod: pm,
        note,
        items,
      };

      const j = await createOrder(payload);
      setResult({ id: j.order._id, status: j.order.status || "pending" }); // Map dữ liệu trả về
    } catch (err: unknown) {
       // 👇 SỬA 4: Catch unknown error thay vì any
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="grid md:grid-cols-3 gap-6 py-8">
      <div className="md:col-span-2">
        <h1 className="text-2xl font-semibold mb-4">Thanh toán</h1>

        {/* Tóm tắt giỏ hàng */}
        <div className="mb-6 border rounded-xl p-4">
          <h2 className="font-medium mb-3">Tóm tắt giỏ hàng</h2>
          {parsed.length === 0 ? (
            <p className="text-gray-500">
              Chưa có sản phẩm. Quay lại{" "}
              <button
                type="button"
                className="underline"
                onClick={() => router.push("/shop")}
              >
                Shop
              </button>
            </p>
          ) : (
            <ul className="space-y-2">
              {parsed.map((x) => (
                <li key={x.slug} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* 👇 SỬA 5: Thay thẻ img bằng Image của Next.js */}
                    <Image
                      src={x.product.images?.[0] || "/placeholder.png"}
                      alt={x.product.title}
                      width={48}
                      height={48}
                      className="rounded-md object-cover"
                    />
                    <div>
                      <p className="font-medium">{x.product.title}</p>
                      <p className="text-sm text-gray-500">SL: {x.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {formatVND(x.product.price * x.quantity)}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 text-right text-sm text-gray-500">
            {parsed.length} dòng
          </div>
        </div>

        {/* Form thông tin */}
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Họ tên *</label>
            <input
              className="w-full border rounded-md p-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              disabled={submitting}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Số điện thoại</label>
            <input
              className="w-full border rounded-md p-2"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="090..."
              disabled={submitting}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Địa chỉ *</label>
            <textarea
              className="w-full border rounded-md p-2"
              value={addr}
              onChange={(e) => setAddr(e.target.value)}
              placeholder="Số nhà, đường, quận/huyện, tỉnh/thành"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Phương thức thanh toán</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="pm"
                  value="cod"
                  checked={pm === "cod"}
                  onChange={() => setPM("cod")}
                  disabled={submitting}
                />
                <span>COD</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="pm"
                  value="banking"
                  checked={pm === "banking"}
                  onChange={() => setPM("banking")}
                  disabled={submitting}
                />
                <span>Banking</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="pm"
                  value="momo"
                  checked={pm === "momo"}
                  onChange={() => setPM("momo")}
                  disabled={submitting}
                />
                <span>MoMo</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Ghi chú</label>
            <textarea
              className="w-full border rounded-md p-2"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={submitting}
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting} // 👇 Dùng biến submitting ở đây để disable nút
              className="h-10 px-4 rounded-md border bg-black text-white disabled:opacity-50"
            >
              {submitting ? "Đang xử lý..." : "Đặt hàng"}
            </button>
            <button
              type="button"
              className="h-10 px-4 rounded-md border"
              onClick={() => router.push("/cart")}
              disabled={submitting}
            >
              Quay lại giỏ hàng
            </button>
          </div>
        </form>

        {/* Kết quả */}
        {result && (
          <div className="mt-6 border rounded-xl p-4 bg-green-50">
            <h2 className="font-medium mb-2">Đặt hàng thành công</h2>
            <p className="text-sm">
              Mã đơn: <b>{result.id}</b>
            </p>
            <p className="text-sm">Trạng thái: {result.status}</p>
          </div>
        )}
      </div>

      {/* Tóm tắt thanh toán */}
      <aside className="border rounded-xl p-4 h-fit">
        <h2 className="font-medium mb-3">Thanh toán</h2>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Tạm tính</span>
            <span>{formatVND(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Phí vận chuyển</span>
            <span>{formatVND(totals.shippingFee)}</span>
          </div>
        </div>
        <div className="border-t my-2" />
        <div className="flex justify-between font-semibold">
          <span>Tổng cộng</span>
          <span>{formatVND(totals.total)}</span>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          * Phí ship thay đổi theo địa chỉ & khuyến mãi (giả lập).
        </p>
      </aside>
    </section>
  );
}