import { NextResponse } from "next/server";

// Định nghĩa URL Backend (ưu tiên biến môi trường, fallback về localhost)
const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Bắt buộc await params trong Next.js mới
    const { slug } = await params;

    // Gọi trực tiếp xuống Backend Express (MongoDB)
    const resBackend = await fetch(`${BACKEND_URL}/api/v1/products/slug/${slug}`, {
      cache: "no-store", // Đảm bảo luôn lấy dữ liệu mới nhất từ DB
    });

    if (!resBackend.ok) {
      if (resBackend.status === 404) {
        return NextResponse.json({ message: "Product not found" }, { status: 404 });
      }
      return NextResponse.json(
        { message: "Backend Error" },
        { status: resBackend.status }
      );
    }

    const data = await resBackend.json();
    // Forward nguyên vẹn dữ liệu từ Backend { ok: true, product: ... } về cho Client
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Proxy Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}