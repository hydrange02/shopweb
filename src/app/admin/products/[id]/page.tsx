"use client";

import { useQuery } from "@tanstack/react-query";
import { getProductBySlug } from "@/services/products";
import { useParams } from "next/navigation";
import ProductForm from "../product-form";
import { Suspense } from "react";

function EditProductContent() {
  const params = useParams();
  const id = params?.id as string;

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductBySlug(id),
    enabled: !!id,
  });

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      <span className="ml-2">Đang tải dữ liệu...</span>
    </div>
  );

  // Vì trong services/products.ts bạn đã return j.product rồi, 
  // nên ở đây 'product' chính là dữ liệu sạch.
  if (isError || !product) {
    return (
      <div className="text-red-500 text-center p-10 bg-red-50 rounded-3xl border border-red-100">
        Không tìm thấy sản phẩm. Vui lòng kiểm tra lại kết nối API.
      </div>
    );
  }

  return <ProductForm initialData={product} />;
}

export default function EditProductPage() {
  return (
     <Suspense fallback={<div>Loading...</div>}>
        <EditProductContent />
     </Suspense>
  )
}