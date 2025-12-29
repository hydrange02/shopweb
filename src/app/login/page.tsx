"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginValues } from "@/features/auth/schemas";
import { useRouter } from "next/navigation";
import { login } from "@/services/auth";
import { setToken } from "@/lib/auth";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion } from "framer-motion"; // 🔥 Import Motion

export default function LoginPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ 
    resolver: zodResolver(loginSchema),
    mode: "onBlur" 
  });

  async function onSubmit(values: LoginValues) {
    try {
      const res = await login(values);
      if (res.token) {
        setToken(res.token);
        toast.success(`Chào mừng trở lại, ${res.user?.name || "bạn"}!`);
        if (res.user?.role === "admin") router.push("/admin");
        else router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message || "Email hoặc mật khẩu không chính xác");
    }
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center p-4 bg-gradient-to-b from-white to-gray-50">
      {/* 🔥 Wrap bằng motion.div để tạo hiệu ứng */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[400px] glass p-8 rounded-[32px] shadow-2xl border border-white/40 backdrop-blur-xl"
      >
        <div className="text-center mb-10">
          <motion.h1 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="text-3xl font-bold tracking-tight text-gray-900"
          >
            Chào mừng trở lại
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-500 mt-2 text-sm"
          >
            Đăng nhập để tiếp tục trải nghiệm hydrange
          </motion.p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.4 }}
          >
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">Email</label>
            <input
              type="email"
              {...register("email")}
              className="w-full h-12 px-4 rounded-2xl bg-gray-50/50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
              placeholder="name@example.com"
            />
            {errors.email && <p className="text-[11px] text-red-500 mt-1.5 ml-1 font-medium">{errors.email.message}</p>}
          </motion.div>

          <motion.div
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.5 }}
          >
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">Mật khẩu</label>
            <input
              type="password"
              {...register("password")}
              className="w-full h-12 px-4 rounded-2xl bg-gray-50/50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-[11px] text-red-500 mt-1.5 ml-1 font-medium">{errors.password.message}</p>}
            
            <div className="flex justify-end mt-2">
              <Link href="/forgot-password" className="text-[11px] font-bold text-blue-600 hover:underline transition-all">
                Quên mật khẩu?
              </Link>
            </div>
          </motion.div>

          {/* 🔥 Nút bấm có hiệu ứng scale khi hover/tap */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            className="w-full h-12 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 active:scale-[0.98] disabled:opacity-50 mt-6"
          >
            {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
          </motion.button>
        </form>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center text-sm text-gray-500"
        >
          Chưa có tài khoản? <Link href="/register" className="text-blue-600 font-bold hover:underline">Đăng ký ngay</Link>
        </motion.p>
      </motion.div>
    </main>
  );
}