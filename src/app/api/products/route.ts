import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

// Cấu trúc mặc định an toàn
const DEFAULT_RESPONSE = {
  data: [],
  page: 1,
  limit: 12,
  total: 0,
  hasNext: false
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const resBackend = await fetch(`${BACKEND_URL}/api/v1/products?${searchParams.toString()}`, {
      cache: "no-store" 
    });
    
    if (!resBackend.ok) {
      // Nếu Backend lỗi (404, 500), vẫn trả về cấu trúc chuẩn với data rỗng
      return NextResponse.json(DEFAULT_RESPONSE, { status: resBackend.status });
    }

    const data = await resBackend.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Next Proxy Error:", error);
    // Trả về data rỗng thay vì làm crash cả trang web
    return NextResponse.json(DEFAULT_RESPONSE, { status: 500 });
  }
}