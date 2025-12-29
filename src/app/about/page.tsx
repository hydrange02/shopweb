import Link from "next/link";
import { ShieldCheck, Truck, Recycle, Award } from "lucide-react";

export default function AboutPage() {
  const values = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
      title: "Chất lượng cao cấp",
      description: "Chúng tôi tỉ mỉ trong từng đường kim mũi chỉ và chất liệu vải để đảm bảo sự thoải mái nhất."
    },
    {
      icon: <Recycle className="w-6 h-6 text-blue-600" />,
      title: "Thời trang bền vững",
      description: "Ưu tiên các chất liệu thân thiện với môi trường và quy trình sản xuất có đạo đức."
    },
    {
      icon: <Truck className="w-6 h-6 text-blue-600" />,
      title: "Giao hàng nhanh chóng",
      description: "Hệ thống vận chuyển tối ưu giúp sản phẩm đến tay bạn trong thời gian ngắn nhất."
    },
    {
      icon: <Award className="w-6 h-6 text-blue-600" />,
      title: "Thiết kế độc bản",
      description: "Phong cách được tuyển chọn giúp bạn tự tin thể hiện cá tính riêng biệt của mình."
    }
  ];

  return (
    <main className="relative pt-20 px-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <section className="py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">
          Chúng tôi định nghĩa lại <br />
          <span className="text-blue-600">Thời trang hiện đại.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-gray-500 text-lg leading-relaxed">
          Ra đời từ năm 2024, mục tiêu của chúng tôi không chỉ là bán quần áo. 
          Chúng tôi mang đến giải pháp về phong cách sống, giúp mỗi cá nhân tìm thấy phiên bản tự tin nhất của chính mình qua những bộ trang phục tối giản nhưng tinh tế.
        </p>
      </section>

      {/* Story Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-16">
        <div className="rounded-3xl overflow-hidden h-[400px] bg-gray-200">
           {/* Bạn có thể thay div này bằng thẻ <img /> thực tế */}
           <div className="w-full h-full bg-gradient-to-tr from-gray-300 to-gray-100 flex items-center justify-center text-gray-400 italic">
             <img src="./images" alt="" />
           </div>
        </div>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">Câu chuyện của chúng tôi</h2>
          <p className="text-gray-600">
            Mọi hành trình đều bắt đầu từ một nhu cầu đơn giản: Tìm kiếm những món đồ cơ bản nhưng có chất lượng vượt trội. Chúng tôi đã đi khắp nơi để tìm nguồn vải tốt nhất, từ bông hữu cơ đến các loại sợi tái chế.
          </p>
          <p className="text-gray-600">
            Mỗi bộ sưu tập tại cửa hàng đều trải qua quy trình kiểm duyệt khắt khe về độ bền, màu sắc và phom dáng trước khi đến tay khách hàng.
          </p>
        </div>
      </section>

      {/* Core Values Grid */}
      <section className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Giá trị cốt lõi</h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((item, index) => (
            <div key={index} className="p-8 rounded-2xl bg-[#f5f5f7] hover:bg-white border border-transparent hover:border-gray-200 transition duration-300">
              <div className="mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="my-20 p-12 rounded-3xl bg-black text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Sẵn sàng nâng tầm phong cách?</h2>
        <p className="text-gray-400 mb-8 max-w-lg mx-auto">
          Tham gia cùng hơn 10.000+ khách hàng đã tin tưởng và lựa chọn phong cách của chúng tôi.
        </p>
        <Link 
          href="/shop" 
          className="inline-block bg-white text-black px-10 py-4 rounded-full font-medium hover:bg-gray-200 transition transform hover:scale-105"
        >
          Ghé thăm cửa hàng
        </Link>
      </section>
    </main>
  );
}