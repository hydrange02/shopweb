"use client";

import { usePathname } from "next/navigation";

export default function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Kiểm tra: Nếu đường dẫn bắt đầu bằng "/admin" thì là trang Admin
  const isAdmin = pathname?.startsWith("/admin");

  // Giao diện Admin: Full màn hình (w-full), padding nhỏ
  if (isAdmin) {
    return <div className="container mx-5 max-w-full px-4 py-6">{children}</div>;
  }

  // Giao diện Shop (Khách): Căn giữa (mx-auto), giới hạn chiều rộng (max-w-6xl)
  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      {children}
    </div>
  );
}