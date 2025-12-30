"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { ReviewForm } from "./ReviewForm";
import { ReviewList } from "./ReviewList";
import { api } from "@/lib/api";

interface ReviewsSectionProps {
  productId: string;
}

interface ReviewUser {
  _id: string;
  name: string;
}

// Interface này cần khớp với ReviewList
interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: ReviewUser | null; // Cho phép null
}

export function ReviewsSection({ productId }: ReviewsSectionProps) {
  const { data: reviews = [], refetch, isLoading } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const res = await api.get<Review[]>(`/api/v1/products/${productId}/reviews`);
      return res.data;
    },
  });

  return (
    <section id="reviews" className="py-12 border-t border-gray-100 mt-16 scroll-mt-24">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">Đánh giá khách hàng ({reviews.length})</h2>
      </div>

      <div className="grid md:grid-cols-12 gap-10">
        {/* Cột Trái: LUÔN HIỆN FORM ĐÁNH GIÁ (Bất kể đã login hay chưa) */}
        <div className="md:col-span-4 space-y-6">
          <div className="sticky top-24">
            <h3 className="text-lg font-bold mb-4">Viết đánh giá</h3>
            <p className="text-sm text-gray-500 mb-4">
              Chia sẻ cảm nhận của bạn về sản phẩm này.
            </p>
            <ReviewForm 
              productId={productId} 
              onSuccess={() => refetch()} 
            />
          </div>
        </div>

        {/* Cột Phải: Danh Sách Đánh Giá */}
        <div className="md:col-span-8">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-gray-400 w-8 h-8"/>
            </div>
          ) : (
            <ReviewList reviews={reviews} />
          )}
        </div>
      </div>
    </section>
  );
}