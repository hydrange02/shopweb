"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { deleteProduct } from "@/services/products";
import { formatVND } from "@/app/lib/format";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Edit, Plus } from "lucide-react";
import toast from "react-hot-toast"; // 🔥 Import Toast
import type { Product } from "@/types/product";

type AdminProductsResponse = {
  data: Product[];
  total: number;
  page: number;
};

export default function AdminProductsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      return apiFetch<AdminProductsResponse>("/api/v1/products?limit=100");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      // 🔥 Thông báo đẹp
      toast.success("Đã xoá sản phẩm thành công!");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Lỗi khi xoá sản phẩm");
    }
  });

  const handleDelete = (id: string) => {
    // Vẫn dùng confirm native cho nhanh, nhưng kết quả sẽ dùng toast
    if (confirm("Bạn có chắc chắn muốn xoá sản phẩm này?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div className="p-8">Đang tải danh sách...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6 p-5">
        <div>
          <h1 className="text-2xl font-bold">Sản phẩm</h1>
          <p className="text-gray-500 text-sm">Quản lý kho hàng của bạn</p>
        </div>
        <Link 
          href="/admin/products/new"
          className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg"
        >
          <Plus className="w-4 h-4" /> Thêm mới
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-4">Sản phẩm</th>
              <th className="px-6 py-4">Giá bán</th>
              <th className="px-6 py-4">Kho</th>
              <th className="px-6 py-4">Danh mục</th>
              <th className="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.data.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50/50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      <Image src={p.images?.[0] || "/placeholder.png"} alt={p.title} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 line-clamp-1">{p.title}</p>
                      <p className="text-xs text-gray-400 font-mono">#{p._id.slice(-6)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium">{formatVND(p.price)}</td>
                <td className="px-6 py-4">
                  {p.stock > 0 ? (
                    <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded-md text-xs">{p.stock} sẵn hàng</span>
                  ) : (
                    <span className="text-red-500 font-bold bg-red-50 px-2 py-1 rounded-md text-xs">Hết hàng</span>
                  )}
                </td>
                <td className="px-6 py-4 capitalize text-gray-500">{p.category || "—"}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link 
                      href={`/admin/products/${p._id}`}
                      className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition" 
                      title="Sửa"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(p._id)}
                      disabled={deleteMutation.isPending}
                      className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition disabled:opacity-50" 
                      title="Xoá"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {(!data?.data || data.data.length === 0) && (
           <div className="p-10 text-center text-gray-500">Chưa có sản phẩm nào.</div>
        )}
      </div>
    </div>
  );
}