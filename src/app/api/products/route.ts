// File: src/app/api/products/route.ts
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    // Chuyển tiếp toàn bộ query params (page, limit, q) sang Backend
    const resBackend = await fetch(`${BACKEND_URL}/api/v1/products?${searchParams.toString()}`, {
      cache: "no-store" 
    });
    
    if (!resBackend.ok) {
      return NextResponse.json({ data: [] }, { status: resBackend.status });
    }

    const data = await resBackend.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ data: [] }, { status: 500 });
  }
}