// src/mock/products.ts
import type { Product } from "@/types/product";

const CATEGORIES = ["Áo", "Quần", "Váy", "Phụ kiện"];
const BRANDS = ["hydrange Classic", "Urban Style", "Silk & Cotton"];

export const PRODUCTS: Product[] = Array.from({ length: 24 }, (_, i) => {
  const n = i + 1;
  const category = CATEGORIES[i % CATEGORIES.length];
  
  return {
    _id: `p${n}`,
    title: `${category} thiết kế #${n}`,
    slug: `thoi-trang-${n}`,
    price: 250000 + (i * 50000),
    images: [`/image/fashion-${(i % 18) + 1}.png`], // Đảm bảo bạn có ảnh tương ứng
    stock: i % 5 === 0 ? 0 : 15,
    rating: (i % 2) + 4,
    brand: BRANDS[i % BRANDS.length],
    category: category,
    discountPercent: i % 4 === 0 ? 15 : 0,
    description: "Chất liệu cao cấp, thoáng mát, phù hợp cho mọi dịp.",
  } satisfies Product;
});