import { apiFetch } from "@/lib/api";
import { Review } from "@/types/review";

/**
 * Lấy danh sách review của một sản phẩm
 * Khớp với: GET /api/v1/products/:productId/reviews
 */
export const getProductReviews = async (productId: string) => {
  try {
    const response = await apiFetch<Review[]>(`/api/v1/products/${productId}/reviews`);
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy reviews:", error);
    return [];
  }
};

/**
 * Gửi đánh giá mới lên server
 * Khớp với: POST /api/v1/products/:productId/reviews
 */
export const postReview = async (productId: string, rating: number, comment: string) => {
  // Lưu ý: apiFetch của bạn phải được cấu hình để tự động lấy Token
  // Nếu chưa, bạn cần thêm header Authorization tại đây
  return await apiFetch(`/api/v1/products/${productId}/reviews`, {
    method: "POST",
    body: JSON.stringify({ rating, comment }),
  });
};