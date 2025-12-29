"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterValues } from "@/features/auth/schemas";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { setToken } from "@/lib/auth";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion"; // 🔥 Import thêm AnimatePresence

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); 
  const [otp, setOtp] = useState("");

  const {
    register,
    getValues,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ 
    resolver: zodResolver(registerSchema),
    mode: "onBlur"
  });

  async function onRequirementSubmit(values: RegisterValues) {
    try {
      await apiFetch("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify({ email: values.email }),
      });
      toast.success("Mã xác nhận đã được gửi đến email của bạn!");
      setStep(2);
    } catch (err: any) {
      toast.error(err.message || "Không thể gửi mã xác nhận.");
    }
  }
  
  async function onVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    const values = getValues();
    try {
      const res: any = await apiFetch("/api/v1/auth/register-confirm", {
        method: "POST",
        body: JSON.stringify({ ...values, otp }),
      });
      
      if (res.token) {
        setToken(res.token);
        toast.success("Đăng ký thành công! Đang đăng nhập...");
        router.push("/");
      }
    } catch (err: any) {
      toast.error(err.message || "Mã OTP không chính xác.");
    }
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center p-4 bg-gradient-to-b from-white to-gray-50">
      <motion.div 
        layout 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[440px] glass p-8 rounded-[32px] shadow-2xl border border-white/40 backdrop-blur-xl overflow-hidden"
      >
        <div className="text-center mb-8">
          <motion.h1 
            key={step === 1 ? "title1" : "title2"}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold tracking-tight text-gray-900"
          >
            {step === 1 ? "Tạo tài khoản" : "Xác thực Email"}
          </motion.h1>
          <p className="text-gray-500 mt-2 text-sm">
            {step === 1 
              ? "Tham gia cộng đồng hydrange ngay hôm nay" 
              : `Chúng tôi đã gửi mã xác nhận đến ${getValues("email")}`}
          </p>
        </div>

        {/* 🔥 AnimatePresence giúp tạo hiệu ứng khi Step thay đổi */}
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form 
              key="step1"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit(onRequirementSubmit)} 
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">Họ tên</label>
                <input
                  {...register("name")}
                  className="w-full h-12 px-4 rounded-2xl bg-gray-50/50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-black/5 outline-none transition-all"
                  placeholder="Nguyễn Văn A"
                />
                {errors.name && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">Email</label>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full h-12 px-4 rounded-2xl bg-gray-50/50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-black/5 outline-none transition-all"
                  placeholder="name@example.com"
                />
                {errors.email && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.email.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">Mật khẩu</label>
                  <input
                    type="password"
                    {...register("password")}
                    className="w-full h-12 px-4 rounded-2xl bg-gray-50/50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-black/5 outline-none"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">Nhập lại</label>
                  <input
                    type="password"
                    {...register("confirmPassword")}
                    className="w-full h-12 px-4 rounded-2xl bg-gray-50/50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-black/5 outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all mt-4 shadow-lg shadow-gray-200"
              >
                {isSubmitting ? "Đang gửi mã..." : "Tiếp tục"}
              </motion.button>
            </motion.form>
          ) : (
            <motion.form 
              key="step2"
              initial={{ opacity: 0, x: 50 }} // Vào từ phải
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}   // Ra bên trái
              transition={{ duration: 0.3 }}
              onSubmit={onVerifyOTP} 
              className="space-y-6"
            >
              <div className="flex flex-col items-center">
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full h-16 text-center text-3xl font-bold tracking-[0.5em] rounded-2xl bg-gray-50/50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-black/5 outline-none transition-all"
                  placeholder="000000"
                  autoFocus
                />
                <p className="mt-4 text-xs text-gray-400 font-medium">Nhập 6 chữ số từ email của bạn</p>
              </div>

              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={otp.length !== 6}
                  className="w-full h-12 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50 shadow-lg shadow-gray-200"
                >
                  Xác nhận đăng ký
                </motion.button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm font-semibold text-gray-400 hover:text-black transition-colors"
                >
                  Thay đổi thông tin
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="mt-8 text-center text-sm text-gray-500">
          Đã có tài khoản? <Link href="/login" className="text-blue-600 font-bold hover:underline">Đăng nhập</Link>
        </p>
      </motion.div>
    </main>
  );
}