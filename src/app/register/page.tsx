"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterValues } from "@/features/auth/schemas";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { setToken } from "@/lib/auth";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Info, 2: OTP
  const [serverError, setServerError] = useState<string | null>(null);
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

  // Bước 1: Yêu cầu gửi mã OTP
  async function onRequirementSubmit(values: RegisterValues) {
    setServerError(null);
    try {
      await apiFetch("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify({ email: values.email }),
      });
      setStep(2);
    } catch (err: any) {
      setServerError(err.message || "Không thể gửi mã xác nhận. Vui lòng thử lại.");
    }
  }
  
  // Bước 2: Xác nhận OTP và hoàn tất đăng ký
  async function onVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    const values = getValues();
    try {
      const res: any = await apiFetch("/api/v1/auth/register-confirm", {
        method: "POST",
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
          otp: otp
        }),
      });
      
      if (res.token) {
        setToken(res.token);
        router.push("/login?registered=true");
      }
    } catch (err: any) {
      setServerError(err.message || "Mã OTP không chính xác hoặc đã hết hạn.");
    }
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-[440px] glass p-8 rounded-[32px] shadow-2xl border border-white/20 transition-all duration-500">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {step === 1 ? "Tạo tài khoản" : "Xác thực Email"}
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            {step === 1 
              ? "Tham gia cộng đồng Hydrange ngay hôm nay" 
              : `Chúng tôi đã gửi mã xác nhận đến ${getValues("email")}`}
          </p>
        </div>

        {step === 1 ? (
          /* FORM NHẬP THÔNG TIN */
          <form onSubmit={handleSubmit(onRequirementSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">Họ tên</label>
              <input
                {...register("name")}
                className="w-full h-12 px-4 rounded-2xl bg-gray-50/50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                placeholder="Nguyễn Văn A"
              />
              {errors.name && <p className="text-[11px] text-red-500 mt-1.5 ml-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">Email</label>
              <input
                type="email"
                {...register("email")}
                className="w-full h-12 px-4 rounded-2xl bg-gray-50/50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                placeholder="name@example.com"
              />
              {errors.email && <p className="text-[11px] text-red-500 mt-1.5 ml-1">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">Mật khẩu</label>
                <input
                  type="password"
                  {...register("password")}
                  className="w-full h-12 px-4 rounded-2xl bg-gray-50/50 border border-gray-100 outline-none"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">Nhập lại</label>
                <input
                  type="password"
                  {...register("confirmPassword")}
                  className="w-full h-12 px-4 rounded-2xl bg-gray-50/50 border border-gray-100 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {serverError && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs text-center">{serverError}</div>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all mt-4"
            >
              {isSubmitting ? "Đang gửi mã..." : "Tiếp tục"}
            </button>
          </form>
        ) : (
          /* FORM NHẬP OTP */
          <form onSubmit={onVerifyOTP} className="space-y-6">
            <div className="flex flex-col items-center">
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full h-16 text-center text-3xl font-bold tracking-[0.5em] rounded-2xl bg-gray-50/50 border border-gray-100 focus:bg-white outline-none"
                placeholder="000000"
                autoFocus
              />
              <p className="mt-4 text-xs text-gray-400 font-medium">Nhập 6 chữ số từ email của bạn</p>
            </div>

            {serverError && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs text-center">{serverError}</div>}

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={otp.length !== 6}
                className="w-full h-12 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50"
              >
                Xác nhận đăng ký
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm font-semibold text-gray-400 hover:text-black transition-colors"
              >
                Thay đổi thông tin
              </button>
            </div>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-gray-500">
          Đã có tài khoản? <Link href="/login" className="text-blue-600 font-bold hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </main>
  );
}