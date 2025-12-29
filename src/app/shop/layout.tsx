import type { Metadata } from "next";

export const metadata: Metadata = { title: "Shop — hydrange" };

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="pt-6">
      {/* Đã loại bỏ phần Breadcrumb cũ để giao diện sạch sẽ hơn */}
      {children}
    </section>
  );
}