import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgroInsight - Consultor Agricola com IA",
  description: "Plataforma de inteligencia para o produtor rural brasileiro",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
