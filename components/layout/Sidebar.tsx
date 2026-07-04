import Link from "next/link";
import type { ReactNode } from "react";

export type SidebarItem = {
  href: string;
  label: string;
};

type SidebarProps = {
  items: SidebarItem[];
  productName: string;
  footerAction?: ReactNode;
};

export function Sidebar({
  footerAction,
  items,
  productName,
}: SidebarProps) {
  return (
    <aside className="flex min-h-screen w-full flex-col border-r border-slate-200 bg-white px-5 py-6 lg:w-72">
      <Link className="text-xl font-bold text-violet-800" href="/">
        {productName}
      </Link>
      <nav className="mt-8 grid gap-1">
        {items.map((item) => (
          <Link
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-violet-50 hover:text-violet-800"
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      {footerAction ? <div className="mt-auto pt-8">{footerAction}</div> : null}
    </aside>
  );
}
