"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "@/services/products";
import type { Product } from "@/types/product";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query"; // Import thêm

interface ProductFormProps {
  initialData?: Product;
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient(); // Init QueryClient
  const isEdit = !!initialData;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    price: initialData?.price || 0,
    category: initialData?.category || "Áo",
    description: initialData?.description || "",
    images: initialData?.images?.[0] || "", 
    stock: initialData?.stock || 100,
    slug: initialData?.slug || "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      // Logic xử lý ảnh: Nếu chuỗi rỗng thì gửi mảng rỗng
      const imageList = formData.images.trim() ? [formData.images.trim()] : [];

      const payload = {
        ...formData,
        images: imageList,
      };

      if (isEdit && initialData?._id) {
        await updateProduct(initialData._id, payload);
        alert("Cập nhật thành công!");
      } else {
        await createProduct(payload);
        alert("Thêm mới thành công!");
      }
      
      // 🔥 QUAN TRỌNG: Xóa cache cũ để danh sách cập nhật ngay lập tức
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      // Nếu đang sửa, invalidate cả cache chi tiết sản phẩm đó
      if (initialData?._id) {
         await queryClient.invalidateQueries({ queryKey: ["product", initialData._id] });
      }

      router.push("/admin/products"); 
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between mb-6">
        <button type="button" onClick={() => router.back()} className="flex items-center text-gray-500 hover:text-black transition">
          <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại
        </button>
        <h1 className="text-2xl font-bold">{isEdit ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}</h1>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
          Lỗi: {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm grid grid-cols-2 gap-6">
        <div className="col-span-2">
          <label className="block text-sm font-bold mb-2 ml-1">Tên sản phẩm</label>
          <input 
            required
            className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
            placeholder="Ví dụ: Áo thun Basic..."
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2 ml-1">Giá bán (VNĐ)</label>
          <input 
            type="number" required min={0}
            className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition"
            value={formData.price}
            onChange={e => setFormData({...formData, price: Number(e.target.value)})}
          />
        </div>

        <div>
           <label className="block text-sm font-bold mb-2 ml-1">Số lượng tồn kho</label>
           <input 
             type="number" required min={0}
             className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition"
             value={formData.stock}
             onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
           />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-bold mb-2 ml-1">Link Ảnh (URL)</label>
          <input 
            type="text" 
            placeholder="https://example.com/image.png"
            className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition"
            value={formData.images}
            onChange={e => setFormData({...formData, images: e.target.value})}
          />
          <p className="text-[11px] text-gray-400 mt-1 ml-1">Dán đường dẫn ảnh từ internet (để trống nếu chưa có)</p>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2 ml-1">Danh mục</label>
          <select 
            className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition bg-white"
            value={formData.category}
            onChange={e => setFormData({...formData, category: e.target.value})}
          >
            <option value="Áo">Áo</option>
            <option value="Quần">Quần</option>
            <option value="Váy">Váy</option>
            <option value="Phụ kiện">Phụ kiện</option>
            <option value="Giày">Giày</option>
          </select>
        </div>

        <div>
           <label className="block text-sm font-bold mb-2 ml-1">Slug (URL tuỳ chỉnh)</label>
           <input 
             className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition text-gray-500"
             placeholder="Tuỳ chọn (để trống sẽ tự tạo)"
             value={formData.slug}
             onChange={e => setFormData({...formData, slug: e.target.value})}
           />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-bold mb-2 ml-1">Mô tả chi tiết</label>
          <textarea 
            rows={5}
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition"
            placeholder="Mô tả về sản phẩm..."
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>
      </div>

      <button 
        type="submit" 
        disabled={submitting}
        className="w-full h-14 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition flex justify-center items-center gap-2 shadow-xl disabled:opacity-50"
      >
        {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
        {submitting ? "Đang xử lý..." : "Lưu sản phẩm"}
      </button>
    </form>
  );
}