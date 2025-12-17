// File: src/app/shop/[slug]/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/services/products";
import { formatVND } from "@/app/lib/format";
import AddToCartButton from "@/features/cart/AddToCartButton";

// Next.js 15: params là Promise
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  
  // Gọi service lấy data thật (nếu lỗi sẽ trả về undefined/null)
  try {
    const product = await getProductBySlug(slug);
    if (!product) return { title: "Không tìm thấy sản phẩm" };
    return { title: `${product.title} — Shoply` };
  } catch (error) {
    return { title: "Sản phẩm — Shoply" };
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // 1. Await params trước khi dùng
  const { slug } = await params;

  // 2. Gọi API lấy sản phẩm
  let product;
  try {
    product = await getProductBySlug(slug);
  } catch (error) {
    // Nếu API lỗi kết nối thì cho sang trang 404 hoặc hiện thông báo
    console.error("Lỗi lấy sản phẩm:", error);
    return notFound();
  }

  // 3. Nếu không có sản phẩm -> 404
  if (!product) return notFound();

  // 4. Xử lý ảnh và giá
  const image = product.images?.[0] ?? "/placeholder.png";
  const stock = product.stock ?? 0;
  const isOutOfStock = stock <= 0;
  
  // Tính giá sau giảm (nếu có)
  const hasDiscount = (product.discountPercent || 0) > 0;
  const originalPrice = product.price;
  const finalPrice = hasDiscount
    ? Math.round(originalPrice * (1 - (product.discountPercent || 0) / 100))
    : originalPrice;

  return (
    <main className="py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cột Trái: Ảnh sản phẩm */}
        <div>
          <Image
            src={image}
            alt={product.title}
            width={640}
            height={640}
            className="w-full h-auto rounded-xl border object-cover"
            priority // Ưu tiên load ảnh này vì nó quan trọng nhất
          />
        </div>

        {/* Cột Phải: Thông tin */}
        <div>
          <h2 className="text-2xl font-semibold">{product.title}</h2>
          <p className="mt-2 text-gray-600">Mã: {product.slug}</p>

          {/* Phần hiển thị giá */}
          <div className="mt-4">
            {hasDiscount ? (
              <>
                <p className="text-gray-400 line-through text-sm">
                  {formatVND(originalPrice)}
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {formatVND(finalPrice)}
                  <span className="ml-2 text-sm bg-red-100 text-red-600 px-2 py-1 rounded-md">
                    -{product.discountPercent}%
                  </span>
                </p>
              </>
            ) : (
              <p className="text-2xl font-bold text-gray-900">
                {formatVND(originalPrice)}
              </p>
            )}
          </div>

          {/* Trạng thái kho hàng */}
          {isOutOfStock ? (
            <p className="mt-2 text-red-600 font-medium">Hết hàng</p>
          ) : (
            <p className="mt-2 text-green-600 font-medium">
              Còn {stock} sản phẩm
            </p>
          )}

          {/* Các nút hành động */}
          <div className="mt-6 flex flex-wrap gap-3 items-center">
            {/* Nút thêm vào giỏ hàng (Component Client) */}
            <AddToCartButton
              product={product}
              disabled={isOutOfStock}
              fullWidth={false}
            />

            {/* Nút Mua ngay (Giả lập) */}
            <button
              type="button"
              disabled={isOutOfStock}
              className="h-10 px-4 rounded-md border bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Mua ngay
            </button>

            {/* Nút quay lại */}
            <Link
              className="h-10 px-4 rounded-md border flex items-center hover:bg-gray-50 text-sm"
              href="/shop"
            >
              ← Quay lại Shop
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}