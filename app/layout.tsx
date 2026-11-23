import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-opolab-display",
  subsets: ["latin"],
});

const body = Figtree({
  variable: "--font-opolab-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Opolab · Organiza tu oposición docente",
  description: "Ordena tu temario, tus prácticos y tus semanas de estudio para llegar al examen de oposición sabiendo cómo vas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
