"use client";

import { motion } from "framer-motion";
import { cn } from "@/app/lib/cn"; // Import hàm cn để gộp class nếu cần

// 1. Khai báo Interface cho props
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string; // Thêm dòng này để chấp nhận className (dấu ? nghĩa là không bắt buộc)
}

export default function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      // 2. Truyền className vào motion.div
      className={className} 
    >
      {children}
    </motion.div>
  );
}