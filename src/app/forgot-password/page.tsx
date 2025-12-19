"use client";
import { useState } from "react";
import { requestForgotPass, resetPassword } from "@/services/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const onSendEmail = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestForgotPass(email);
      setStep(2);
      setMsg({ type: "success", text: "Mã OTP đã được gửi về email của bạn." });
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    } finally { setLoading(false); }
  };

  const onReset = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword({ email, otp, newPassword });
      setMsg({ type: "success", text: "Đổi mật khẩu thành công! Đang chuyển hướng..." });
      setTimeout(() => window.location.href = "/login", 2000);
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    } finally { setLoading(false); }
  };

  return (
    <main className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md glass p-10 rounded-[40px] shadow-xl border border-white/40">
        <h2 className="text-3xl font-bold mb-2 text-center">Quên mật khẩu</h2>
        <p className="text-gray-500 text-sm text-center mb-8">
          {step === 1 ? "Nhập email để nhận mã xác minh" : "Nhập mã OTP và mật khẩu mới"}
        </p>

        {msg.text && (
          <div className={`p-4 rounded-2xl mb-6 text-sm text-center ${msg.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
            {msg.text}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={onSendEmail} className="space-y-4">
            <input 
              type="email" 
              placeholder="Email của bạn"
              className="w-full h-14 px-6 rounded-2xl bg-white/50 border border-gray-100 outline-none focus:ring-2 focus:ring-blue-500/20"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button disabled={loading} className="w-full h-14 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition shadow-lg">
              {loading ? "Đang gửi..." : "Tiếp tục"}
            </button>
          </form>
        ) : (
          <form onSubmit={onReset} className="space-y-4">
            <input 
              type="text" 
              placeholder="Mã OTP 6 số"
              className="w-full h-14 px-6 rounded-2xl bg-white/50 border border-gray-100 outline-none text-center font-mono text-xl tracking-widest"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Mật khẩu mới"
              className="w-full h-14 px-6 rounded-2xl bg-white/50 border border-gray-100 outline-none"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button disabled={loading} className="w-full h-14 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition">
              {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
            </button>
          </form>
        )}
        
        <div className="mt-8 text-center">
          <Link href="/login" className="text-sm text-blue-600 font-medium hover:underline">Quay lại đăng nhập</Link>
        </div>
      </div>
    </main>
  );
}