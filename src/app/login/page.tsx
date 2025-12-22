"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginValues } from "@/features/auth/schemas";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/auth";
import { setToken } from "@/lib/auth";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ 
    resolver: zodResolver(loginSchema),
    mode: "onBlur" 
  });

  async function onSubmit(values: LoginValues) {
    setServerError(null);
    try {
      const res = await login(values);
      if (res.token) {
        setToken(res.token);
        
        // 🛠 SỬA ĐỔI: Phân luồng chuyển hướng dựa trên Role
        if (res.user?.role === "admin") {
          router.push("/admin"); // Admin vào Dashboard
        } else {
          router.push("/"); // User thường vào Trang chủ mua sắm
        }
        
        router.refresh();
      }
    } catch (err: any) {
      setServerError(err.message || "Email hoặc mật khẩu không chính xác");
    }
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] glass p-8 rounded-[32px] shadow-2xl border border-white/20">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Chào mừng trở lại</h1>
          <p className="text-gray-500 mt-2 text-sm">Đăng nhập để tiếp tục trải nghiệm Hydrange</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">Email</label>
            <input
              type="email"
              {...register("email")}
              className="w-full h-12 px-4 rounded-2xl bg-gray-50/50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              placeholder="name@example.com"
            />
            {errors.email && <p className="text-[11px] text-red-500 mt-1.5 ml-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">Mật khẩu</label>
            <input
              type="password"
              {...register("password")}
              className="w-full h-12 px-4 rounded-2xl bg-gray-50/50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-[11px] text-red-500 mt-1.5 ml-1">{errors.password.message}</p>}
            
            <div className="flex justify-end mt-2">
              <Link 
                href="/forgot-password" 
                className="text-[11px] font-bold text-blue-600 hover:underline transition-all"
              >
                Quên mật khẩu?
              </Link>
            </div>
          </div>

          {serverError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs text-center font-medium">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="text-blue-600 font-bold hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </main>
  );
}