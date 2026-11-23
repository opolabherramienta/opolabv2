import { LogoutButton } from "@/components/auth/LogoutButton";
import { Sidebar, type SidebarItem } from "@/components/layout/Sidebar";

const privateItems: SidebarItem[] = [
  { href: "/dashboard", label: "Inicio", icon: "home" },
  { href: "/temas", label: "Temas", icon: "balls" },
  { href: "/practicos", label: "Prácticos", icon: "flask" },
  { href: "/calendario", label: "Calendario", icon: "calendar", shortLabel: "Agenda" },
  { href: "/progreso", label: "Progreso", icon: "chart" },
  { href: "/ajustes", label: "Ajustes", icon: "settings" },
];

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar
        footerAction={<LogoutButton />}
        items={privateItems}
        productName="Opolab"
      />
      <main className="min-w-0 flex-1 px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
