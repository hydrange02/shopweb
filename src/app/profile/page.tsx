"use client";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { User, Package, ShieldCheck, LogOut } from "lucide-react";
import { clearToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await apiFetch<{ ok: boolean; user: any }>("/api/v1/auth/me");
        if (res.ok) setUser(res.user);
        else router.push("/login");
      } catch (err) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;

  return (
    <main className="min-h-screen pt-24 pb-12 bg-[#fbfbfd]">
      <div className="container mx-auto max-w-4xl px-6">
        <h1 className="text-3xl font-bold mb-8">Tài khoản của tôi</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar điều hướng nhanh */}
          <div className="md:col-span-1 space-y-2">
            <div className="glass p-6 rounded-3xl border border-white/20">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <User className="w-10 h-10 text-blue-500" />
                </div>
                <h2 className="font-bold text-lg">{user?.name}</h2>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Nội dung chi tiết */}
          <div className="md:col-span-2 space-y-6">
            {/* Mục Đơn hàng */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold">Đơn hàng gần đây</h3>
              </div>
              <p className="text-sm text-gray-500">Bạn chưa có đơn hàng nào.</p>
              <button onClick={() => router.push('/shop')} className="mt-4 text-sm font-bold text-blue-600 hover:underline">
                Tiếp tục mua sắm →
              </button>
            </div>

            {/* Mục Bảo mật */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                <h3 className="font-bold">Bảo mật</h3>
              </div>
              <button className="text-sm p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition w-full text-left font-medium">
                Đổi mật khẩu
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}