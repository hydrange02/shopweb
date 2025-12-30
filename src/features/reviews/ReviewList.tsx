"use client";

import { Star } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    _id: string;
    name: string;
  } | null;
}

interface ReviewListProps {
  reviews: Review[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return <div className="text-gray-500">Chưa có đánh giá nào.</div>;
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {review.user?.name || "Người dùng ẩn danh"}
              </span>
              <span className="text-gray-400 text-xs">
                • {format(new Date(review.createdAt), "dd/MM/yyyy", { locale: vi })}
              </span>
            </div>
          </div>
          
          <div className="flex text-yellow-400 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < review.rating ? "fill-current" : "text-gray-300"}`}
              />
            ))}
          </div>
          
          <p className="text-gray-700 leading-relaxed text-sm">
            {review.comment}
          </p>
        </div>
      ))}
    </div>
  );
}