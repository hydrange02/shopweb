"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllOrders } from "@/services/orders";
import { formatVND } from "@/app/lib/format";
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Calendar,
  Loader2
} from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

export default function AdminDashboardPage() {
  // Lấy 100 đơn hàng gần nhất để tính toán thống kê nhanh
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-orders-dashboard"],
    queryFn: () => getAllOrders(1, 100),
  });

  // Tính toán số liệu từ dữ liệu đơn hàng
  const stats = useMemo(() => {
    if (!data?.data) return { revenue: 0, orders: 0, itemsSold: 0 };

    return data.data.reduce(
      (acc, order) => {
        // Chỉ tính đơn đã thanh toán hoặc đang xử lý (bỏ qua đơn hủy nếu muốn)
        if (order.status !== "canceled") {
          acc.revenue += order.total;
          acc.orders += 1;
          // Cộng tổng số lượng item trong đơn
          const itemsCount = order.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
          acc.itemsSold += itemsCount;
        }
        return acc;
      },
      { revenue: 0, orders: 0, itemsSold: 0 }
    );
  }, [data]);

  // "Làm phẳng" danh sách: Từ Đơn hàng -> Danh sách các sản phẩm đã bán
  const recentSoldItems = useMemo(() => {
    if (!data?.data) return [];
    
    // Gom tất cả items từ các đơn hàng lại thành 1 mảng duy nhất
    const allItems = data.data.flatMap((order) => 
      order.items.map((item: any) => ({
        ...item,
        orderId: order._id,
        customerName: order.customerName,
        soldAt: order.createdAt,
        status: order.status
      }))
    );

    // Lấy 10 item mới nhất (vì flatMap giữ thứ tự đơn hàng mới nhất trước)
    return allItems.slice(0, 10);
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
        <p className="mt-4 text-gray-400 font-medium">Đang tổng hợp dữ liệu...</p>
      </div>
    );
  }

  if (isError) return <div className="p-8 text-red-500">Không thể tải dữ liệu tổng quan.</div>;

  return (
    <div className="space-y-8 pb-20">
      {/* 1. HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Tổng quan kinh doanh</h1>
        <p className="text-gray-500 mt-1">Cập nhật tình hình bán hàng mới nhất.</p>
      </div>

      {/* 2. STATS CARDS (Thẻ thống kê) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Doanh thu */}
        <div className="bg-black text-white p-6 rounded-3xl shadow-xl flex items-center justify-between relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-1">Tổng doanh thu</p>
            <h3 className="text-3xl font-bold">{formatVND(stats.revenue)}</h3>
          </div>
          <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center relative z-10">
            <DollarSign className="w-6 h-6 text-green-400" />
          </div>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-gray-800/50 rounded-full blur-3xl group-hover:bg-green-500/20 transition-colors"></div>
        </div>

        {/* Đơn hàng */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-1">Tổng đơn hàng</p>
            <h3 className="text-3xl font-bold text-gray-900">{stats.orders}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>

        {/* Sản phẩm đã bán */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-1">Vật phẩm đã bán</p>
            <h3 className="text-3xl font-bold text-gray-900">{stats.itemsSold}</h3>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. RECENTLY SOLD ITEMS TABLE (Danh sách vật phẩm vừa bán) */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-black" />
          <h2 className="text-lg font-bold">Vật phẩm vừa bán</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-widest">
              <tr>
                <th className="px-8 py-4">Sản phẩm</th>
                <th className="px-6 py-4">Đơn giá</th>
                <th className="px-6 py-4 text-center">Số lượng</th>
                <th className="px-6 py-4">Thành tiền</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4 text-right">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentSoldItems.length > 0 ? (
                recentSoldItems.map((item: any, index: number) => (
                  <tr key={`${item.productId}-${index}`} className="hover:bg-gray-50/50 transition">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                          <Image 
                            src={item.image || "/placeholder.png"} 
                            alt={item.title} 
                            fill 
                            className="object-cover" 
                          />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 line-clamp-1">{item.title}</p>
                          {item.size && <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-medium">{item.size}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-medium">
                      {formatVND(item.price)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-black text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        x{item.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {formatVND(item.price * item.quantity)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-700">{item.customerName}</span>
                        <span className="text-[10px] text-gray-400 font-mono">#{item.orderId.slice(-6)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-400 text-xs">
                      {item.soldAt ? new Date(item.soldAt).toLocaleString("vi-VN") : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-gray-400 italic">
                    Chưa có vật phẩm nào được bán.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}