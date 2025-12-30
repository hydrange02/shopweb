export type Product = {
  _id: string;
  title: string;
  slug: string;
  price: number;
  images: string[];
  stock: number;
  rating?: number;
  brand?: string;
  variants?: { 
    size: string; 
    stock: number 
  }[];
  description?: string;
  category?: string;
  discountPercent?: number;
};

export type Review = {
  _id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
    avatar?: string;
  };
};