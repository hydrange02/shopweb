export type PaymentMethod = "cod" | "banking" | "momo";

export type OrderItem = {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: { color: string; size?: string };
};

export type Order = {
  _id: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee?: number;
  total: number;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  paymentMethod?: PaymentMethod;
  note?: string;
  // 🔥 SỬA: Đồng bộ trạng thái với Backend Controller và Admin Page
  status?: "pending" | "paid" | "shipping" | "completed" | "canceled";
  createdAt?: string;
};