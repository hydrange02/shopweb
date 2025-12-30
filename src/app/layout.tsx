import "./globals.css";
import type { Metadata } from "next";
import SiteHeader from "./components/SiteHeader";
import Providers from "./providers";
import MainLayoutWrapper from "./components/MainLayoutWrapper"; // Import file vừa tạo

export const metadata: Metadata = {
  title: "hydrange",
  description: "Catalog, giỏ hàng, đơn hàng, admin CRUD",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-gray-900"
      suppressHydrationWarning={true}>
        <Providers>
          <SiteHeader />
          
          <MainLayoutWrapper>
            {children}
          </MainLayoutWrapper>

        </Providers>
      </body>
    </html>
  );
}