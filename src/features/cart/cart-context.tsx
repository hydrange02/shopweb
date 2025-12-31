"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";

export interface CartItem {
  productId: string;
  quantity: number;
  selectedSize?: string;
  title?: string;
  price?: number;
  image?: string;
  slug?: string;
  stock?: number;
}

interface CartContextType {
  items: CartItem[];
  cartCount: number;
  subtotal: number;
  isLoading: boolean;
  hydrated: boolean;
  addToCart: (params: { productId: string; quantity: number; selectedSize: string }) => Promise<void>;
  removeFromCart: (productId: string, selectedSize: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number, selectedSize: string) => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("hydrange:token");
    }
    return null;
  };

  const fetchCart = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setItems([]);
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/v1/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const mappedItems = data.items?.map((item: any) => ({
          productId: item.productId._id,
          title: item.productId.title,
          price: item.productId.price,
          image: item.productId.images?.[0],
          slug: item.productId.slug,
          stock: item.productId.stock,
          quantity: item.quantity,
          selectedSize: item.selectedSize
        })) || [];
        setItems(mappedItems);
      }
    } catch (error) {
      console.error("Lỗi tải giỏ hàng:", error);
    }
  }, []);

  useEffect(() => {
    fetchCart();
    const handleAuthChange = () => fetchCart();
    window.addEventListener("auth-change", handleAuthChange);
    return () => window.removeEventListener("auth-change", handleAuthChange);
  }, [fetchCart]);

  const addToCart = async ({ productId, quantity, selectedSize }: { productId: string; quantity: number; selectedSize: string }) => {
    const token = getToken();
    if (!token) {
      toast.error("Vui lòng đăng nhập để mua hàng!");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("http://localhost:4000/api/v1/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity, selectedSize }),
      });

      if (!res.ok) throw new Error("Lỗi kết nối");
      
      await fetchCart();
      toast.success("Đã thêm vào giỏ hàng!");
    } catch (error) {
      console.error(error);
      toast.error("Không thể thêm vào giỏ");
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId: string, selectedSize: string) => {
    const token = getToken();
    setItems(prev => prev.filter(item => !(item.productId === productId && item.selectedSize === selectedSize)));

    try {
      await fetch("http://localhost:4000/api/v1/cart/remove", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, selectedSize }),
      });
      await fetchCart();
      toast.success("Đã xóa sản phẩm");
    } catch (error) {
      fetchCart();
      toast.error("Lỗi khi xóa");
    }
  };

  const updateQuantity = async (productId: string, quantity: number, selectedSize: string) => {
     const token = getToken();
     if(quantity < 1) return;

     setItems(prev => prev.map(item => 
       (item.productId === productId && item.selectedSize === selectedSize)
         ? { ...item, quantity } 
         : item
     ));

     try {
       await fetch("/api/v1/cart/update", {
         method: "PUT",
         headers: {
           "Content-Type": "application/json",
           Authorization: `Bearer ${token}`,
         },
         body: JSON.stringify({ productId, quantity, selectedSize }),
       });
     } catch (error) {
       fetchCart();
     }
  };

  const clearCart = () => setItems([]);

  const cartCount = useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{ items, cartCount, subtotal, addToCart, removeFromCart, updateQuantity, clearCart, isLoading, hydrated }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};