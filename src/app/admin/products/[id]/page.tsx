"use client";

import { useQuery } from "@tanstack/react-query";
import { getProductBySlug } from "@/services/products";
import { useParams } from "next/navigation";
import ProductForm from "../product-form";
import { Suspense, use } from "react";

function EditProductContent() {
  const params = useParams();
  const id = params?.id as string;

  // Dùng hàm getProductBySlug nhưng truyền ID vì Backend đã support tìm theo ID
  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductBySlug(id),
    enabled: !!id,
  });

  if (isLoading) return <div>Đang tải dữ liệu...</div>;
  if (isError || !product) return <div className="text-red-500">Không tìm thấy sản phẩm</div>;

  return <ProductForm initialData={product} />;
}

export default function EditProductPage() {
  return (
     <Suspense fallback={<div>Loading...</div>}>
        <EditProductContent />
     </Suspense>
  )
}