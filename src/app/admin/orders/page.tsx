"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllOrders, updateOrderStatus, deleteOrder } from "@/services/orders";
import { useSearchParams } from "next/navigation";
import { formatVND } from "@/app/lib/format";
import { 
  Eye, Clock, CheckCircle, XCircle, Truck, PackageCheck, 
  Trash2, X, MapPin, User, StickyNote, AlertTriangle 
} from "lucide-react";
import { cn } from "@/app/lib/cn";
import { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast"; // Import toast
import type { Order } from "@/types/order";

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); // Modal Xem chi tiết
  const [deleteId, setDeleteId] = useState<string | null>(null); // Modal Xóa

  // 1. Lấy danh sách
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-orders", q],
    queryFn: () => getAllOrders(1, 50, q),
  });

  // 2. Mutation Cập nhật
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateOrderStatus(id, status),
    onMutate: (variables) => { setUpdatingId(variables.id); },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      // 🔥 Thông báo đẹp
      toast.success(`Đã cập nhật trạng thái đơn hàng #${variables.id.slice(-4)}`);
      setUpdatingId(null);
    },
    onError: () => {
      toast.error("Không thể cập nhật trạng thái");
      setUpdatingId(null);
    }
  });

  // 3. Mutation Xóa
  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Đã xóa đơn hàng thành công!"); // 🔥 Thông báo đẹp
      setDeleteId(null); // Đóng modal xóa
    },
    onError: (err: any) => {
      toast.error(err.message || "Lỗi xóa đơn hàng");
      setDeleteId(null);
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

  if (isLoading) return <div className="p-10 text-center text-gray-500">Đang tải dữ liệu...</div>;
  if (isError) return <div className="p-10 text-center text-red-500">Lỗi kết nối server</div>;

  return (
    <div>
       <div className="mb-6">
          <h1 className="text-2xl font-bold">Quản lý Đơn hàng</h1>
          <p className="text-gray-500 text-sm">
            {q ? `Kết quả tìm kiếm cho: "${q}"` : "Theo dõi và xử lý đơn hàng"}
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
              <th className="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.data.map((order) => {
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
                  
                  {/* Cột Trạng Thái */}
                  <td className="px-6 py-4">
                     <div className={cn(
                        "relative flex items-center gap-2 px-3 py-1.5 rounded-lg border border-transparent transition-all w-fit",
                        config.color,
                        isUpdating && "opacity-50 pointer-events-none"
                     )}>
                        <Icon className="w-4 h-4" />
                        <select 
                          className="bg-transparent border-none outline-none font-bold text-xs appearance-none cursor-pointer pr-4"
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

                  {/* Cột Hành Động */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition" 
                            title="Xem chi tiết"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        
                        {/* Nút Xóa: Mở Modal thay vì alert */}
                        <button 
                            onClick={() => setDeleteId(order._id)}
                            className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition" 
                            title="Xóa đơn hàng"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </td>
                </tr>
            )})}
          </tbody>
        </table>
      </div>

      {/* --- MODAL CHI TIẾT ĐƠN HÀNG --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold">Chi tiết đơn hàng</h2>
                        <p className="text-sm text-gray-500 font-mono">#{selectedOrder._id.toUpperCase()}</p>
                    </div>
                    <button 
                        onClick={() => setSelectedOrder(null)}
                        className="p-2 bg-white rounded-full hover:bg-gray-200 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                   {/* ... (Nội dung chi tiết giống cũ) ... */}
                   <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Khách hàng</h3>
                            <div className="flex items-start gap-3">
                                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="font-bold">{selectedOrder.customerName}</p>
                                    <p className="text-sm text-gray-500">{selectedOrder.customerPhone}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                <p className="text-sm text-gray-600">{selectedOrder.customerAddress}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Ghi chú</h3>
                             <div className="flex items-start gap-3">
                                <StickyNote className="w-5 h-5 text-gray-400 mt-0.5" />
                                <p className="text-sm text-gray-600 italic">"{selectedOrder.note || "Không có"}"</p>
                            </div>
                        </div>
                   </div>
                   {/* List Sản Phẩm */}
                   <div className="space-y-4">
                        {selectedOrder.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-4 items-center">
                                <div className="relative w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                    <Image src={item.image || "/placeholder.png"} alt={item.title} fill className="object-cover" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-sm">{item.title}</p>
                                    <p className="text-xs text-gray-500">Size: {item.size || item.selectedSize || "—"}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-sm">x{item.quantity}</p>
                                    <p className="text-sm text-blue-600 font-bold">{formatVND(item.price * item.quantity)}</p>
                                </div>
                            </div>
                        ))}
                   </div>
                   <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                       <span className="font-bold text-lg">Tổng cộng</span>
                       <span className="font-bold text-xl text-blue-600">{formatVND(selectedOrder.total)}</span>
                   </div>
                </div>
            </div>
        </div>
      )}

      {/* --- 🔥 MODAL XÓA ĐƠN HÀNG (CUSTOM) --- */}
      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex flex-col items-center text-center">
                 <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                    <AlertTriangle className="w-6 h-6" />
                 </div>
                 <h3 className="text-lg font-bold text-gray-900">Xóa đơn hàng này?</h3>
                 <p className="text-sm text-gray-500 mt-2 mb-6">
                    Hành động này không thể hoàn tác. Nếu đơn hàng chưa hủy, hệ thống sẽ tự động hoàn lại số lượng vào kho.
                 </p>
                 <div className="flex gap-3 w-full">
                    <button 
                       onClick={() => setDeleteId(null)}
                       className="flex-1 py-2.5 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
                    >
                       Hủy bỏ
                    </button>
                    <button 
                       onClick={() => deleteMutation.mutate(deleteId)}
                       disabled={deleteMutation.isPending}
                       className="flex-1 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 transition disabled:opacity-50"
                    >
                       {deleteMutation.isPending ? "Đang xóa..." : "Xác nhận xóa"}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}