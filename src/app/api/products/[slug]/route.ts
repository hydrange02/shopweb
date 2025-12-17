// File: src/app/api/products/[slug]/route.ts
import { NextResponse } from "next/server";
import { PRODUCTS } from "@/mock/products";

// Định nghĩa params là Promise
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Phải await params trước khi dùng
  const { slug } = await params;

  const product = PRODUCTS.find((p) => p.slug === slug);
  if (!product) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  return NextResponse.json(product);
}