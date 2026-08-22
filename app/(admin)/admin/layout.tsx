import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Управление сайтом",
  // админка не должна попадать в поиск ни при каких условиях
  robots: { index: false, follow: false },
};

/**
 * Отдельный корневой layout: админка живёт в своей ветке дерева и не тянет
 * за собой ни плавную прокрутку, ни кастомный курсор, ни анимации сайта.
 */
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className="bg-ink text-sand antialiased">{children}</body>
    </html>
  );
}
