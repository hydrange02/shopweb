"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "@/services/products";
import type { Product } from "@/types/product";
import { Save, ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface ProductFormProps {
  initialData?: Product;
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = !!initialData;
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    price: initialData?.price || 0,
    category: initialData?.category || "Áo",
    description: initialData?.description || "",
    images: initialData?.images?.[0] || "",
    slug: initialData?.slug || "",
    variants: initialData?.variants?.length 
      ? initialData.variants 
      : [{ size: "", stock: 0 }],
  });

  // 🔥 FIX: Thêm Number() để tránh lỗi chuỗi
  const totalStock = useMemo(() => {
    return formData.variants.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0);
  }, [formData.variants]);

  const handleVariantChange = (index: number, field: "size" | "stock", value: string | number) => {
    const newVariants = [...formData.variants];
    // @ts-ignore
    newVariants[index][field] = value;
    setFormData({ ...formData, variants: newVariants });
  };

  const addVariant = () => {
    setFormData({ ...formData, variants: [...formData.variants, { size: "", stock: 0 }] });
  };

  const removeVariant = (index: number) => {
    const newVariants = formData.variants.filter((_, i) => i !== index);
    setFormData({ ...formData, variants: newVariants });
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (formData.variants.some(v => !v.size.trim())) {
        toast.error("Vui lòng nhập tên Size cho tất cả phân loại");
        setSubmitting(false);
        return;
      }

      const imageList = formData.images.trim() ? [formData.images.trim()] : [];
      const payload = { ...formData, images: imageList, stock: totalStock };

      if (isEdit && initialData?._id) {
        await updateProduct(initialData._id, payload);
        toast.success("Cập nhật sản phẩm thành công!");
      } else {
        await createProduct(payload);
        toast.success("Thêm sản phẩm mới thành công!");
      }

      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      if (initialData?._id) await queryClient.invalidateQueries({ queryKey: ["product", initialData._id] });

      router.push("/admin/products");
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between mb-6">
        <button type="button" onClick={() => router.back()} className="flex items-center text-gray-500 hover:text-black transition"><ArrowLeft className="w-4 h-4 mr-1" /> Quay lại</button>
        <h1 className="text-2xl font-bold">{isEdit ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}</h1>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm grid grid-cols-2 gap-6">
        <div className="col-span-2">
          <label className="block text-sm font-bold mb-2 ml-1">Tên sản phẩm</label>
          <input required className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition" placeholder="Ví dụ: Áo thun Basic..." value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2 ml-1">Giá bán (VNĐ)</label>
          <input type="number" required min={0} className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2 ml-1">Danh mục</label>
          <select className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition bg-white" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
            <option value="Áo">Áo</option>
            <option value="Quần">Quần</option>
            <option value="Váy">Váy</option>
            <option value="Phụ kiện">Phụ kiện</option>
            <option value="Giày">Giày</option>
          </select>
        </div>

        <div className="col-span-2 bg-gray-50 p-4 rounded-2xl border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-bold text-gray-700">Phân loại hàng (Size & Số lượng)</label>
            <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full border">Tổng kho: <b className="text-black">{totalStock}</b></span>
          </div>
          <div className="space-y-3">
            {formData.variants.map((variant, index) => (
              <div key={index} className="flex gap-3 items-center">
                <div className="flex-1"><input placeholder="Size (S, M, L...)" className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none text-sm uppercase" value={variant.size} onChange={(e) => handleVariantChange(index, "size", e.target.value)} /></div>
                <div className="w-32"><input type="number" min={0} placeholder="Số lượng" className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none text-sm" value={variant.stock} onChange={(e) => handleVariantChange(index, "stock", Number(e.target.value))} /></div>
                {formData.variants.length > 1 && (
                  <button type="button" onClick={() => removeVariant(index)} className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addVariant} className="mt-4 flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition"><Plus className="w-4 h-4 mr-1" /> Thêm phân loại</button>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-bold mb-2 ml-1">Link Ảnh (URL)</label>
          <input type="text" placeholder="https://example.com/image.png" className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition" value={formData.images} onChange={(e) => setFormData({ ...formData, images: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2 ml-1">Slug (URL tuỳ chỉnh)</label>
          <input className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition text-gray-500" placeholder="Tuỳ chọn (để trống sẽ tự tạo)" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-bold mb-2 ml-1">Mô tả chi tiết</label>
          <textarea rows={5} className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition" placeholder="Mô tả về sản phẩm..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
        </div>
      </div>

      <button type="submit" disabled={submitting} className="w-full h-14 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition flex justify-center items-center gap-2 shadow-xl disabled:opacity-50">
        {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />} {submitting ? "Đang xử lý..." : "Lưu sản phẩm"}
      </button>
    </form>
  );
}