import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HọcVui - Lớp Học Tương Tác & Gamification Tiểu Học",
  description: "Nền tảng hỗ trợ giáo viên tiểu học giảng dạy tương tác với vòng quay may mắn, câu hỏi máy chiếu và khen thưởng ngôi sao",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased min-h-screen flex flex-col bg-[#FDFBF7]">
        {children}
      </body>
    </html>
  );
}
