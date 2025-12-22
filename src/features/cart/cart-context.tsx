// src/features/cart/cart-context.tsx
"use client";
import { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
import type { CartAction, CartState } from "@/types/cart";
import { getToken } from "@/lib/auth"; 
import { apiFetch } from "@/lib/api";

const LS_KEY = "shoply:cart";

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const idx = state.items.findIndex(
        (it) => it.productId === action.payload.productId && it.selectedSize === action.payload.selectedSize
      );
      if (idx >= 0) {
        const next = [...state.items];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + action.payload.quantity };
        return { items: next };
      }
      return { items: [...state.items, action.payload] };
    }
    case "REMOVE":
      return { 
        items: state.items.filter(
          (it) => !(it.productId === action.payload.productId && it.selectedSize === action.payload.selectedSize)
        ) 
      };
    case "SET_QTY":
      return {
        items: state.items.map((it) =>
          it.productId === action.payload.productId && it.selectedSize === action.payload.selectedSize
            ? { ...it, quantity: Math.max(1, action.payload.quantity) }
            : it
        ),
      };
    case "CLEAR":
      return { items: [] };
    case "REPLACE": // Logic để ghi đè giỏ hàng khi load từ server
      return { items: action.payload };
    default:
      return state;
  }
} 

function loadInitial(): CartState {
  if (typeof window === "undefined") return { items: [] };
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as CartState) : { items: [] };
  } catch {
    return { items: [] };
  }
}

const CartCtx = createContext<{
  state: CartState;
  dispatch: (action: CartAction) => void;
  totalItems: number;
  subtotal: number;
  hydrated: boolean;
} | null>(null);

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [state, dispatchLocal] = useReducer(reducer, undefined, loadInitial);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Hàm tải giỏ hàng (Dùng chung cho lúc mới vào và lúc đăng nhập/xuất)
  const refreshCart = async () => {
    const token = getToken();
    const hasToken = !!token;
    setIsLoggedIn(hasToken);

    if (hasToken) {
      // 🟢 ĐÃ ĐĂNG NHẬP: Gọi API lấy giỏ hàng riêng của User
      try {
        const res = await apiFetch<{ ok: boolean, items: any[] }>("/api/v1/cart");
        if (res.ok && res.items) {
           // Map dữ liệu từ DB (structure hơi khác) về chuẩn CartItem của Frontend
           const mappedItems = res.items.map((item: any) => ({
              productId: item.productId._id || item.productId,
              slug: item.productId.slug,
              title: item.productId.title,
              price: item.productId.price, 
              image: item.productId.images?.[0],
              quantity: item.quantity,
              selectedSize: item.selectedSize
           }));
           dispatchLocal({ type: "REPLACE", payload: mappedItems });
        }
      } catch (err) {
        console.error("Failed to load user cart", err);
      }
    } else {
      // ⚪ KHÁCH VÃNG LAI: Load lại từ LocalStorage hoặc reset về rỗng
      const localCart = loadInitial(); 
      dispatchLocal({ type: "REPLACE", payload: localCart.items });
    }
  };

  // 1. Lắng nghe sự kiện auth-change (khi Login/Logout)
  useEffect(() => {
    setHydrated(true);
    refreshCart(); // Chạy lần đầu

    const handleAuthChange = () => refreshCart();
    window.addEventListener("auth-change", handleAuthChange);
    return () => window.removeEventListener("auth-change", handleAuthChange);
  }, []);

  // 2. Lưu LocalStorage (Chỉ dùng khi chưa đăng nhập để backup)
  useEffect(() => {
    if (hydrated && !isLoggedIn) {
      window.localStorage.setItem(LS_KEY, JSON.stringify(state));
    }
  }, [state, isLoggedIn, hydrated]);

  // 3. Wrapper Dispatch: Vừa cập nhật UI ngay, vừa gọi API
  const dispatch = async (action: CartAction) => {
    // Cập nhật UI ngay lập tức cho mượt
    dispatchLocal(action);

    // Nếu ĐÃ ĐĂNG NHẬP -> Đồng bộ lên Server
    if (isLoggedIn) {
      try {
        if (action.type === "ADD") {
           await apiFetch("/api/v1/cart/add", { method: "POST", body: JSON.stringify(action.payload) });
        } else if (action.type === "REMOVE") {
           await apiFetch("/api/v1/cart/remove", { method: "DELETE", body: JSON.stringify(action.payload) });
        } else if (action.type === "SET_QTY") {
           await apiFetch("/api/v1/cart/update", { method: "PUT", body: JSON.stringify(action.payload) });
        }
      } catch (err) {
        console.error("Lỗi đồng bộ giỏ hàng:", err);
      }
    }
  };

  const totalItems = useMemo(() => state.items.reduce((s, it) => s + it.quantity, 0), [state.items]);
  const subtotal = useMemo(() => state.items.reduce((s, it) => s + it.price * it.quantity, 0), [state.items]);

  const value = useMemo(() => ({ state, dispatch, totalItems, subtotal, hydrated }), [state, totalItems, subtotal, hydrated]);
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}