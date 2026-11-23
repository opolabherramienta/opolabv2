import { LogoutButton } from "@/components/auth/LogoutButton";
import { Sidebar } from "@/components/layout/Sidebar";
import { requireAdmin } from "@/lib/auth/authorization";

const adminItems = [
  { href: "/admin", label: "Dashboard admin" },
  { href: "/admin/especialidades", label: "Especialidades" },
  { href: "/admin/temas", label: "Temas" },
  { href: "/admin/sugerencias", label: "Sugerencias" },
  { href: "/admin/usuarios", label: "Usuarios" },
];

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdmin();
  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <Sidebar
        footerAction={<LogoutButton />}
        items={adminItems}
        productName="Opolab Admin"
      />
      <main className="flex-1 min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
    </div>
  );
}
