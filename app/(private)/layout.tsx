import { LogoutButton } from "@/components/auth/LogoutButton";
import { Sidebar } from "@/components/layout/Sidebar";

const privateItems = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/temas", label: "Temas" },
  { href: "/practicos", label: "Practicos" },
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
      <main className="flex-1 px-6 py-8 lg:px-10">{children}</main>
    </div>
  );
}
