import { LogoutButton } from "@/components/auth/LogoutButton";
import { Sidebar } from "@/components/layout/Sidebar";

const privateItems = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/temas", label: "Temas" },
  { href: "/practicos", label: "Prácticos" },
  { href: "/calendario", label: "Calendario" },
  { href: "/progreso", label: "Progreso" },
  { href: "/sugerencias", label: "Sugerencias" },
  { href: "/ajustes", label: "Ajustes" },
];

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <Sidebar
        footerAction={<LogoutButton />}
        items={privateItems}
        productName="Opolab Planner"
      />
      <main className="flex-1 min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
    </div>
  );
}
