"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Package, Clock, ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatVND } from "@/app/lib/format";

interface Order {
  _id: string;
  status: string;
  total: number;
  createdAt: string;
  items: any[];
}

export default function GuestOrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuestOrders = async () => {
      // 1. Lấy danh sách ID đơn hàng từ LocalStorage
      const savedOrderIds = JSON.parse(localStorage.getItem("guest_orders") || "[]");

      if (savedOrderIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        // 2. Gọi API để lấy chi tiết các đơn hàng này
        // Lưu ý: Bạn cần tạo 1 API Route chấp nhận mảng IDs, ví dụ: /api/v1/orders/guest-lookup
        const res = await apiFetch<{ ok: boolean; data: Order[] }>("/api/v1/orders/guest-lookup", {
          method: "POST",
          body: JSON.stringify({ orderIds: savedOrderIds }),
        });

        if (res.ok) {
          setOrders(res.data);
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu đơn hàng khách:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGuestOrders();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tìm dữ liệu trình duyệt...</div>;
  }

  return (
    <main className="min-h-screen pt-24 pb-12 bg-[#f5f5f7]">
      <div className="container mx-auto max-w-3xl px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Đơn hàng của bạn</h1>
            <p className="text-sm text-gray-500 mt-1">Lịch sử mua sắm trên thiết bị này</p>
          </div>
          <Link href="/shop" className="p-3 bg-white rounded-full shadow-sm hover:shadow-md transition">
            <ShoppingBag className="w-5 h-5" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-[40px] p-16 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold mb-2">Chưa có đơn hàng nào</h2>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">
              Các đơn hàng bạn đặt mà không đăng nhập sẽ được lưu tạm thời tại đây.
            </p>
            <Link href="/shop" className="inline-block bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition">
              Bắt đầu mua sắm
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Mã đơn hàng</span>
                    <span className="font-mono font-bold text-sm">#{order._id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      order.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 py-4 border-y border-gray-50">
                  <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                     {order.items[0]?.image && (
                       <Image src={order.items[0].image} alt="product" fill className="object-cover" />
                     )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{order.items[0]?.title}</p>
                    <p className="text-xs text-gray-500">
                      {order.items.length > 1 ? `và ${order.items.length - 1} sản phẩm khác` : `Số lượng: ${order.items[0]?.quantity}`}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</span>
                  </div>
                  <p className="font-bold text-lg text-blue-600">{formatVND(order.total)}</p>
                </div>
              </div>
            ))}
            
            <p className="text-center text-[11px] text-gray-400 mt-8 px-10">
              * Lưu ý: Lịch sử này sẽ bị xóa nếu bạn xóa dữ liệu duyệt web hoặc đổi trình duyệt khác.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}