import { LogoutButton } from "@/components/auth/LogoutButton";
import { Sidebar } from "@/components/layout/Sidebar";

const adminItems = [
  { href: "/admin", label: "Dashboard admin" },
  { href: "/admin/especialidades", label: "Especialidades" },
  { href: "/admin/temas", label: "Temas" },
  { href: "/admin/sugerencias", label: "Sugerencias" },
  { href: "/admin/usuarios", label: "Usuarios" },
];

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <Sidebar
        footerAction={<LogoutButton />}
        items={adminItems}
        productName="Opolab Admin"
      />
      <main className="flex-1 px-6 py-8 lg:px-10">{children}</main>
    </div>
  );
}
