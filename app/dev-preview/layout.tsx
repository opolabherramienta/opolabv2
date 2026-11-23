import { notFound } from "next/navigation";
import { Sidebar, type SidebarItem } from "@/components/layout/Sidebar";

// Design previews with made-up data. Never served in production.
const items: SidebarItem[] = [
  { href: "/dev-preview/inicio", label: "Inicio", icon: "home" },
  { href: "/dev-preview/hoy", label: "Hoy", icon: "check" },
  { href: "/dev-preview/temas", label: "Temas", icon: "balls" },
  { href: "/dev-preview/practicos", label: "Prácticos", icon: "flask" },
  { href: "/dev-preview/calendario", label: "Calendario", icon: "calendar", shortLabel: "Agenda" },
  { href: "/dev-preview/progreso", label: "Progreso", icon: "chart" },
];

export default function DevPreviewLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar items={items} productName="OpoLab" />
      <main className="min-w-0 flex-1 px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
