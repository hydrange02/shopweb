import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="relative pt-20">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden rounded-3xl bg-[#f5f5f7]">
        <div className="absolute inset-0 opacity-40">
           {/* Giả lập một hình nền nghệ thuật hoặc gradient */}
           <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 animate-pulse" />
        </div>
        
        <div className="relative text-center z-10 px-6">
          <span className="text-blue-600 font-semibold tracking-[0.2em] text-xs uppercase mb-4 block">Bộ sưu tập 2024</span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Phong cách <br /> Thật sự là bạn.
          </h1>
          <p className="max-w-md mx-auto text-gray-500 mb-8 text-lg">
            Khám phá những sản phẩm công nghệ và thời trang được tuyển chọn kỹ lưỡng cho phong cách sống hiện đại.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop" className="bg-black text-white px-8 py-4 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition transform hover:scale-105">
              Mua sắm ngay <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/about" className="bg-white border border-gray-200 text-black px-8 py-4 rounded-full font-medium hover:bg-gray-50 transition">
              Tìm hiểu thêm
            </Link>
          </div>
        </div>
      </section>

      {/* Categories / Features (Giả lập) */}
      <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {['Thời trang', 'Phụ kiện', 'Công nghệ'].map((cat) => (
          <div key={cat} className="h-48 rounded-2xl bg-white border border-gray-100 p-8 flex flex-col justify-end hover:shadow-lg transition cursor-pointer group">
            <h4 className="text-xl font-bold">{cat}</h4>
            <p className="text-sm text-gray-500 group-hover:text-blue-600 transition">Xem sản phẩm →</p>
          </div>
        ))}
      </section>
    </main>
  );
}