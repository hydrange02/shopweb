// src/app/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { changePassword } from "@/services/auth";
import { cancelOrder } from "@/services/orders";
import { 
  User as UserIcon, 
  Package, 
  ShieldCheck, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle, 
  X, 
  Save, 
  Lock, 
  AlertTriangle 
} from "lucide-react"; 
import { useRouter } from "next/navigation";
import { formatVND } from "@/app/lib/format";
import Image from "next/image";
import toast from "react-hot-toast"; 

interface UserProfile {
  name: string;
  email: string;
}

interface MyOrder {
  _id: string;
  status: string;
  total: number;
  createdAt: string;
  items: {
    productId: string;
    title: string;
    image?: string;
    quantity: number;
    size?: string;
  }[];
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Chờ xử lý", color: "text-yellow-600 bg-yellow-50", icon: Clock },
  paid: { label: "Đã thanh toán", color: "text-blue-600 bg-blue-50", icon: CheckCircle },
  shipping: { label: "Đang giao", color: "text-purple-600 bg-purple-50", icon: Truck },
  completed: { label: "Hoàn thành", color: "text-green-600 bg-green-50", icon: CheckCircle },
  canceled: { label: "Đã hủy", color: "text-red-600 bg-red-50", icon: XCircle },
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // State cho Modal Đổi Mật Khẩu
  const [showPassModal, setShowPassModal] = useState(false);
  const [passForm, setPassForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [passLoading, setPassLoading] = useState(false);

  // Hàm tải dữ liệu (được tách ra để gọi lại khi cần refresh)
  const loadData = async () => {
    try {
      const resUser = await apiFetch<{ ok: boolean; user: UserProfile }>("/api/v1/auth/me");
      if (resUser.ok) {
        setUser(resUser.user);
        const resOrders = await apiFetch<{ ok: boolean; data: MyOrder[] }>("/api/v1/orders/me");
        if (resOrders.ok) {
          setOrders(resOrders.data);
        }
      } else {
        router.push("/login");
      }
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [router]);

  // Xử lý đổi mật khẩu
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passForm.newPassword !== passForm.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    if (passForm.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    setPassLoading(true);
    try {
      await changePassword({
        oldPassword: passForm.oldPassword,
        newPassword: passForm.newPassword
      });
      toast.success("Đổi mật khẩu thành công!");
      setShowPassModal(false);
      setPassForm({ oldPassword: "", newPassword: "", confirmPassword: "" }); // Reset form
    } catch (err: any) {
      toast.error(err.message || "Đổi mật khẩu thất bại");
    } finally {
      setPassLoading(false);
    }
  };

  // Xử lý hủy đơn hàng
  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) return;

    const toastId = toast.loading("Đang xử lý...");
    try {
        await cancelOrder(orderId);
        toast.success("Đã hủy đơn hàng thành công!", { id: toastId });
        loadData(); // Tải lại danh sách đơn hàng để cập nhật trạng thái
    } catch (err: any) {
        toast.error(err.message || "Không thể hủy đơn hàng", { id: toastId });
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-medium text-gray-500">Đang tải hồ sơ...</div>;
  }

  return (
    <main className="min-h-screen pt-24 pb-12 bg-[#fbfbfd]">
      <div className="container mx-auto max-w-5xl px-6">
        <h1 className="text-3xl font-bold mb-8">Tài khoản của tôi</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar: Thông tin cá nhân & Bảo mật */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm text-center">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="font-bold text-xl">{user?.name}</h2>
              <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
            </div>

            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                <h3 className="font-bold">Bảo mật</h3>
              </div>
              <button 
                onClick={() => setShowPassModal(true)}
                className="text-sm p-4 border border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-black transition w-full text-left font-medium flex justify-between items-center"
              >
                Đổi mật khẩu <Lock className="w-4 h-4 text-gray-400"/>
              </button>
            </div>
          </div>

          {/* Main Content: Lịch sử đơn hàng */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 min-h-[500px]">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                <Package className="w-6 h-6 text-black" />
                <h3 className="font-bold text-lg">Lịch sử đơn hàng ({orders.length})</h3>
              </div>

              {orders.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-gray-500 mb-4">Bạn chưa có đơn hàng nào.</p>
                  <button 
                    onClick={() => router.push('/shop')} 
                    className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-black text-white font-bold hover:bg-gray-800 transition"
                  >
                    Mua sắm ngay
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => {
                    const statusConfig = STATUS_MAP[order.status] || STATUS_MAP["pending"];
                    const StatusIcon = statusConfig.icon;

                    return (
                      <div key={order._id} className="border border-gray-100 rounded-3xl p-6 hover:shadow-md transition bg-gray-50/30">
                        {/* Header Đơn hàng */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                          <div className="flex items-center gap-3">
                             <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusConfig.color}`}>
                                <StatusIcon className="w-3.5 h-3.5" /> {statusConfig.label}
                             </span>
                             <span className="text-xs text-gray-400 font-mono">#{order._id.slice(-6).toUpperCase()}</span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                             <span className="text-xs text-gray-500 font-medium">
                               {new Date(order.createdAt).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                             </span>
                             
                             {/* 🔥 NÚT HỦY ĐƠN: Chỉ hiện khi trạng thái là pending */}
                             {order.status === 'pending' && (
                                <button 
                                  onClick={() => handleCancelOrder(order._id)}
                                  className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition border border-red-100"
                                >
                                  <AlertTriangle className="w-3 h-3" /> Hủy đơn
                                </button>
                             )}
                          </div>
                        </div>

                        {/* Danh sách sản phẩm trong đơn */}
                        <div className="space-y-4">
                          {order.items.map((item, idx) => (
                            <div key={`${item.productId}-${idx}`} className="flex gap-4">
                              <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0 border border-gray-100">
                                <Image src={item.image || "/placeholder.png"} alt={item.title} fill className="object-cover" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-bold line-clamp-1">{item.title}</p>
                                <div className="text-xs text-gray-500 mt-1 flex gap-2">
                                  <span>SL: x{item.quantity}</span>
                                  {item.size && <span className="bg-gray-200 px-1.5 rounded text-[10px] font-bold text-gray-700">{item.size}</span>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Tổng tiền */}
                        <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex items-center justify-between">
                           <span className="text-sm text-gray-500 font-medium">Tổng tiền</span>
                           <span className="text-lg font-bold text-blue-600">{formatVND(order.total)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL ĐỔI MẬT KHẨU --- */}
      {showPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Đổi mật khẩu</h2>
              <button 
                onClick={() => setShowPassModal(false)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">Mật khẩu hiện tại</label>
                <input 
                  type="password" required 
                  className="w-full h-12 px-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-black outline-none transition"
                  value={passForm.oldPassword}
                  onChange={(e) => setPassForm({...passForm, oldPassword: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">Mật khẩu mới</label>
                <input 
                  type="password" required 
                  className="w-full h-12 px-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-black outline-none transition"
                  value={passForm.newPassword}
                  onChange={(e) => setPassForm({...passForm, newPassword: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">Xác nhận mật khẩu mới</label>
                <input 
                  type="password" required 
                  className="w-full h-12 px-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-black outline-none transition"
                  value={passForm.confirmPassword}
                  onChange={(e) => setPassForm({...passForm, confirmPassword: e.target.value})}
                />
              </div>

              <button 
                type="submit" 
                disabled={passLoading}
                className="w-full h-14 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition shadow-xl mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {passLoading ? "Đang xử lý..." : <><Save className="w-4 h-4"/> Lưu thay đổi</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}