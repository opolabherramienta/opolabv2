import { LogoutButton } from "@/components/auth/LogoutButton";
import { Sidebar } from "@/components/layout/Sidebar";
import { requireAdmin } from "@/lib/auth/authorization";

const adminItems = [
  { href: "/admin", label: "Panel", icon: "shield" as const },
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
    <div className="min-h-screen lg:flex">
      <Sidebar
        footerAction={<LogoutButton />}
        items={adminItems}
        productName="Opolab Admin"
      />
      <main className="min-w-0 flex-1 px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
