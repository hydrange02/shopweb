"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { clearToken } from "@/lib/auth";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  LogOut, 
  Search, 
  Bell,
  Menu 
} from "lucide-react";
import { cn } from "@/app/lib/cn";
import { useState, useEffect, Suspense } from "react"; // 🔥 Thêm Suspense

const MENU = [
  { label: "Tổng quan", href: "/admin", icon: LayoutDashboard },
  { label: "Sản phẩm", href: "/admin/products", icon: ShoppingBag },
  { label: "Đơn hàng", href: "/admin/orders", icon: Package },
];

// 1. Tách logic chính ra thành một component riêng (AdminLayoutInner)
function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams(); // 🔥 Hook này gây lỗi nếu không có Suspense
  const [searchVal, setSearchVal] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setSearchVal(searchParams.get("q") || "");
  }, [searchParams]);

  function onLogout() {
    clearToken();
    router.replace("/login");
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchVal.trim()) params.set("q", searchVal.trim());
    else params.delete("q");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="min-h-screen flex bg-[#f8f9fa] text-gray-900 font-sans">
      {/* --- MOBILE OVERLAY --- */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* --- SIDEBAR --- */}
      <aside className={cn(
        "fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out",
        "w-[80%] md:w-[20%] min-w-[240px]",
        "md:translate-x-0", 
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <Link href="/admin" className="font-bold text-xl tracking-widest flex items-center gap-1">
            hydrange<span className="text-blue-600 text-2xl">.</span>
          </Link>
        </div>

        <nav className="p-3 space-y-1 mt-4">
          <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Quản lý</p>
          {MENU.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-black text-white shadow-md" 
                    : "text-gray-500 hover:bg-gray-100 hover:text-black"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 bg-white">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-red-500 hover:bg-red-50 w-full transition-all"
          >
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300",
        "md:ml-[20%] md:w-[80%] ml-0 w-full mx-6"
      )}>
        
        {/* Header */}
        <header className="h-14 bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 px-3 md:px-4 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>

              <form onSubmit={handleSearch} className="w-full max-w-sm relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="Tìm kiếm..." 
                  className="w-full h-9 pl-9 pr-4 rounded-full bg-gray-100 border-none text-xs font-medium focus:ring-1 focus:ring-black focus:bg-white outline-none transition-all"
                />
              </form>
            </div>

            <div className="flex items-center gap-3">
               <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition relative">
                 <Bell className="w-5 h-5" />
                 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
               </button>
               <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-black to-gray-700 text-white flex items-center justify-center font-bold text-[10px] shadow-md">
                 AD
               </div>
            </div>
        </header>

        {/* Page Content */}
        <main className="p-2 md:p-3 flex-1 bg-[#f8f9fa]">
          <div className="w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// 2. Component chính chỉ làm nhiệm vụ bọc Suspense
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải trang quản trị...</div>}>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </Suspense>
  );
}