// src/types/review.ts

export interface Review {
  _id: string;
  rating: number; // Đây là kiểu Int32 bạn đã chuyển đổi ở DB
  comment: string;
  user: {
    _id: string;
    name: string;
  };
  product: string; // ID của sản phẩm
  createdAt: string;
}

// Bạn cũng có thể thêm kiểu dữ liệu cho việc gửi Review mới
export interface CreateReviewInput {
  rating: number;
  comment: string;
}