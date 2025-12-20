import { 
  BookOpen, 
  Zap, 
  Shield, 
  Users, 
  Heart,
  Code,
  Sparkles,
  Github,
  Mail
} from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
        <div className="container relative py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Về chúng tôi</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Chào mừng đến với
            <span className="block mt-2 bg-gradient-to-r from-yellow-200 to-yellow-400 text-transparent bg-clip-text">
              Horizon Blog
            </span>
          </h1>
          
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Nơi bạn có thể chia sẻ câu chuyện, kết nối cộng đồng và khám phá những góc nhìn mới mẻ
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="container py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Sứ mệnh của chúng tôi
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Horizon Blog được tạo ra với mục tiêu xây dựng một không gian viết lách 
              hiện đại, dễ sử dụng và hoàn toàn miễn phí cho mọi người.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Viết & Chia sẻ
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Tạo bài viết với trình soạn thảo mạnh mẽ, thêm ảnh và chia sẻ với cộng đồng
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nhanh chóng
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Tải trang siêu nhanh với Vite và React, trải nghiệm mượt mà như native app
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                An toàn
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Dữ liệu được bảo vệ an toàn, bạn có toàn quyền kiểm soát nội dung của mình
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Tương tác
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Thích, lưu bài viết yêu thích và bình luận để kết nối với tác giả
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Cộng đồng
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Kết nối với những người có cùng sở thích và chia sẻ kiến thức
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Hiện đại
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Giao diện đẹp mắt, responsive và được xây dựng với công nghệ mới nhất
              </p>
            </div>

          </div>

          {/* Tech Stack */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-4">
                <Code className="h-4 w-4" />
                <span className="text-sm font-medium">Công nghệ</span>
              </div>
              <h2 className="text-3xl font-bold mb-3">
                Được xây dựng với
              </h2>
              <p className="text-gray-300">
                Các công nghệ web hiện đại và mạnh mẽ
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "React 19", desc: "UI Library" },
                { name: "TypeScript", desc: "Type Safety" },
                { name: "Vite", desc: "Build Tool" },
                { name: "TailwindCSS", desc: "Styling" },
                { name: "TanStack Router", desc: "Routing" },
                { name: "React Query", desc: "Data Fetching" },
                { name: "ShadCN UI", desc: "Components" },
                { name: "MockAPI", desc: "Backend" },
              ].map((tech) => (
                <div
                  key={tech.name}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="font-semibold text-white mb-1">{tech.name}</div>
                  <div className="text-sm text-gray-400">{tech.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Liên hệ với chúng tôi
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Có câu hỏi, góp ý hoặc muốn hợp tác? Chúng tôi rất vui được lắng nghe từ bạn!
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="mailto:contact@horizonblog.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
              >
                <Mail className="h-5 w-5" />
                Email chúng tôi
              </a>
              
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors shadow-lg"
              >
                <Github className="h-5 w-5" />
                GitHub
              </a>
            </div>
          </div>

          {/* Footer Quote */}
          <div className="mt-16 text-center p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
            <p className="text-2xl font-semibold text-gray-900 mb-2">
              "Mọi câu chuyện đều đáng được kể"
            </p>
            <p className="text-gray-600">
              Bắt đầu hành trình viết lách của bạn ngay hôm nay
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}