"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

export type SidebarItem = {
  href: string;
  label: string;
};

type SidebarProps = {
  items: SidebarItem[];
  productName: string;
  footerAction?: ReactNode;
};

function isActiveItem(pathname: string, href: string, items: SidebarItem[]) {
  if (pathname === href) {
    return true;
  }

  if (!pathname.startsWith(`${href}/`)) {
    return false;
  }

  // A parent entry such as /admin must not stay active on /admin/temas.
  return !items.some(
    (item) =>
      item.href !== href &&
      item.href.startsWith(`${href}/`) &&
      (pathname === item.href || pathname.startsWith(`${item.href}/`)),
  );
}

export function Sidebar({ footerAction, items, productName }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside className="sticky top-0 z-20 border-b border-slate-200 bg-white lg:static lg:flex lg:min-h-screen lg:w-72 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
      <div className="flex items-center justify-between px-5 py-3 lg:p-0">
        <Link
          className="text-xl font-bold text-violet-800"
          href="/"
          onClick={() => setIsOpen(false)}
        >
          {productName}
        </Link>
        <button
          aria-controls="sidebar-menu"
          aria-expanded={isOpen}
          className="inline-flex h-10 items-center rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 lg:hidden"
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          {isOpen ? "Cerrar" : "Menú"}
        </button>
      </div>
      <div
        className={[
          isOpen ? "flex" : "hidden",
          "flex-col px-5 pb-5 lg:flex lg:flex-1 lg:p-0",
        ].join(" ")}
        id="sidebar-menu"
      >
        <nav className="grid gap-1 lg:mt-8">
          {items.map((item) => {
            const isActive = isActiveItem(pathname, item.href, items);

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={[
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-violet-100 text-violet-900"
                    : "text-slate-700 hover:bg-violet-50 hover:text-violet-800",
                ].join(" ")}
                href={item.href}
                key={item.href}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        {footerAction ? (
          <div className="pt-6 lg:mt-auto lg:pt-8">{footerAction}</div>
        ) : null}
      </div>
    </aside>
  );
}
