"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllOrders, updateOrderStatus } from "@/services/orders";
import { useSearchParams } from "next/navigation";
import { formatVND } from "@/app/lib/format";
import { Eye, Clock, CheckCircle, XCircle, Truck, PackageCheck } from "lucide-react";
import { cn } from "@/app/lib/cn";
import { useState } from "react";

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-orders", q],
    queryFn: () => getAllOrders(1, 50, q),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateOrderStatus(id, status),
    onMutate: (variables) => {
      setUpdatingId(variables.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders-dashboard"] });
      setUpdatingId(null);
    },
    onError: () => {
      alert("Lỗi cập nhật trạng thái");
      setUpdatingId(null);
    }
  });

  const handleStatusChange = (id: string, newStatus: string) => {
    statusMutation.mutate({ id, status: newStatus });
  };

  const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-700", icon: Clock },
    paid: { label: "Đã thanh toán", color: "bg-blue-100 text-blue-700", icon: CheckCircle },
    shipping: { label: "Đang giao", color: "bg-purple-100 text-purple-700", icon: Truck },
    completed: { label: "Hoàn thành", color: "bg-green-100 text-green-700", icon: PackageCheck },
    canceled: { label: "Đã hủy", color: "bg-red-100 text-red-700", icon: XCircle },
  };

  if (isLoading) return <div className="p-8">Đang tải đơn hàng...</div>;
  if (isError) return <div className="p-8 text-red-500">Lỗi không thể tải đơn hàng</div>;

  return (
    <div>
       <div className="mb-6">
          <h1 className="text-2xl font-bold">Quản lý Đơn hàng</h1>
          <p className="text-gray-500 text-sm">
            {q ? `Kết quả tìm kiếm cho: "${q}"` : "Theo dõi và cập nhật trạng thái đơn hàng"}
          </p>
       </div>

       <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm pb-20">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-4">Mã Đơn</th>
              <th className="px-6 py-4">Khách hàng</th>
              <th className="px-6 py-4">Ngày đặt</th>
              <th className="px-6 py-4">Tổng tiền</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4">Thanh toán</th>
              <th className="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.data.map((order) => {
               // 🔥 SỬA LỖI: Fallback về "pending" nếu order.status bị undefined
               const statusKey = order.status || "pending";
               const config = STATUS_CONFIG[statusKey] || STATUS_CONFIG["pending"];
               
               const Icon = config.icon;
               const isUpdating = updatingId === order._id;

               return (
                <tr key={order._id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4 font-mono font-bold text-gray-400">#{order._id.slice(-6).toUpperCase()}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{order.customerName}</p>
                    <p className="text-xs text-gray-500">{order.customerPhone}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "—"}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">{formatVND(order.total)}</td>
                  
                  {/* Select Box Status */}
                  <td className="px-6 py-4">
                     <div className={cn(
                        "relative flex items-center gap-2 px-3 py-1.5 rounded-lg border border-transparent transition-all",
                        config.color,
                        isUpdating && "opacity-50 pointer-events-none"
                     )}>
                        <Icon className="w-4 h-4" />
                        <select 
                          className={cn("bg-transparent border-none outline-none font-bold text-xs appearance-none cursor-pointer pr-4 w-full")}
                          // Đảm bảo value luôn có giá trị hợp lệ
                          value={statusKey}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          disabled={isUpdating}
                        >
                          <option value="pending">Chờ xử lý</option>
                          <option value="paid">Đã thanh toán</option>
                          <option value="shipping">Đang giao hàng</option>
                          <option value="completed">Hoàn thành</option>
                          <option value="canceled">Hủy đơn</option>
                        </select>
                     </div>
                  </td>

                  <td className="px-6 py-4 uppercase text-xs font-bold text-gray-500 tracking-wider">
                    {order.paymentMethod}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg transition" title="Xem chi tiết">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
            )})}
          </tbody>
        </table>

        {(!data?.data || data.data.length === 0) && (
           <div className="p-10 text-center text-gray-500">
             {q ? "Không tìm thấy kết quả nào." : "Chưa có đơn hàng nào."}
           </div>
        )}
      </div>
    </div>
  );
}