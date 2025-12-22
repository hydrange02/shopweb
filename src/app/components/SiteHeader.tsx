"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/app/lib/cn";
import CartIndicator from "@/app/components/CartIndicator";
import { Search, User, LogOut, Settings } from "lucide-react";
import { getToken, clearToken } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. CHUYỂN HOOKS LÊN TRÊN CÙNG (Trước khi return bất cứ thứ gì)
  useEffect(() => {
    // Nếu là admin thì không cần chạy logic fetch user hay scroll làm gì cho nặng
    // Tuy nhiên, để tuân thủ Rules of Hooks, useEffect vẫn phải được khai báo.
    // Ta có thể check điều kiện bên trong hook nếu muốn tối ưu, nhưng ở đây cứ để chạy cũng không sao.
    
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    
    const fetchUser = async () => {
      const token = getToken();
      if (token) {
        try {
          const res = await apiFetch<{ ok: boolean; user: any }>("/api/v1/auth/me");
          if (res.ok) setUser(res.user);
        } catch (err) {
          clearToken();
          setUser(null);
        }
      }
    };

    fetchUser();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const handleLogout = () => {
    clearToken();
    setUser(null);
    setIsMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(""); 
    }
  };

  // 2. DI CHUYỂN LOGIC CHECK ADMIN XUỐNG DƯỚI CÙNG (Sau khi tất cả hooks đã được gọi)
  // 🔥 LOGIC MỚI: Nếu đang ở trang Admin, ẩn hoàn toàn Header này
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header className={cn(
      "fixed top-0 w-full z-50 transition-all duration-500",
      isScrolled ? "glass h-14" : "bg-transparent h-16"
    )}>
      <div className="container mx-auto max-w-6xl px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold tracking-[0.1em] hover:opacity-70 transition uppercase">
            HYDRANGE<span className="text-blue-400">.</span>
          </Link>
          
          <nav className="hidden md:flex gap-6">
            <Link href="/shop" className="text-[12px] font-medium text-secondary hover:text-primary transition-colors uppercase tracking-wider">Cửa hàng</Link>
            <Link href="#" className="text-[12px] font-medium text-secondary hover:text-primary transition-colors uppercase tracking-wider">Bộ sưu tập</Link>
          </nav>
        </div>

        <div className="flex items-center gap-5">
          <form 
            onSubmit={handleSearch}
            className="hidden sm:flex items-center bg-gray-100/50 rounded-full px-4 py-1.5 focus-within:bg-white focus-within:ring-1 focus-within:ring-blue-200 transition"
          >
            <button type="submit">
              <Search className="w-4 h-4 text-gray-400 hover:text-blue-500" />
            </button>
            <input 
              placeholder="Tìm kiếm..." 
              className="bg-transparent border-none text-xs ml-2 outline-none w-32 focus:w-48 transition-all text-black" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          
          <div className="flex items-center gap-4 relative">
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 hover:text-blue-500 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="text-xs font-bold hidden md:block">{user.name}</span>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tài khoản</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                    </div>
                    
                    <div className="py-2">
                      <Link 
                        href="/profile" 
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" /> Cài đặt tài khoản
                      </Link>
                      
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition"
                      >
                        <LogOut className="w-4 h-4" /> Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="hover:text-blue-500 transition-colors">
                <User className="w-5 h-5" />
              </Link>
            )}
            
            <CartIndicator />
          </div>
        </div>
      </div>
    </header>
  );
}