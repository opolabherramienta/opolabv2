"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";

export type SidebarItem = {
  href: string;
  label: string;
  icon?: IconName;
  /** Shorter label for the mobile tab bar. */
  shortLabel?: string;
};

type SidebarProps = {
  items: SidebarItem[];
  productName: string;
  footerAction?: ReactNode;
};

const maxTabs = 5;

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

function Brand({ productName }: { productName: string }) {
  return (
    <Link aria-label={productName} className="inline-flex" href="/">
      <Logo height={38} variant="blanco" />
    </Link>
  );
}

export function Sidebar({ footerAction, items, productName }: SidebarProps) {
  const pathname = usePathname();
  const tabs = items.slice(0, maxTabs);
  const extras = items.slice(maxTabs);

  return (
    <>
      {/* Desktop: side rail */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-boli px-4 py-6 text-white lg:flex">
        <div className="px-2">
          <Brand productName={productName} />
        </div>
        <nav className="mt-8 grid grid-cols-1 gap-1.5">
          {items.map((item) => {
            const isActive = isActiveItem(pathname, item.href, items);

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={[
                  "flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-[15px] font-bold transition-colors",
                  isActive
                    ? "border-white bg-white text-violet-700 shadow-[0_3px_0_var(--color-boli-edge)]"
                    : "border-transparent text-white/85 hover:bg-white/15 hover:text-white",
                ].join(" ")}
                href={item.href}
                key={item.href}
              >
                {item.icon ? <Icon name={item.icon} /> : null}
                {item.label}
              </Link>
            );
          })}
        </nav>
        {footerAction ? (
          <div className="mt-auto [&_button]:text-white/85 [&_button]:hover:bg-white/15 [&_button]:hover:text-white">
            {footerAction}
          </div>
        ) : null}
      </aside>

      {/* Mobile: slim top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between bg-boli px-4 py-2.5 text-white lg:hidden">
        <Brand productName={productName} />
        <div className="flex items-center gap-1">
          {extras.map((item) => {
            const isActive = isActiveItem(pathname, item.href, items);

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                aria-label={item.label}
                className={[
                  "flex h-10 items-center justify-center rounded-xl px-2.5 text-sm font-bold",
                  isActive ? "bg-white text-violet-700" : "text-white",
                ].join(" ")}
                href={item.href}
                key={item.href}
              >
                {item.icon ? <Icon name={item.icon} /> : item.label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Mobile: bottom tab bar */}
      <nav
        aria-label="Secciones"
        className="fixed inset-x-0 bottom-0 z-20 grid auto-cols-fr grid-flow-col border-t-2 border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        {tabs.map((item) => {
          const isActive = isActiveItem(pathname, item.href, items);

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={[
                "flex flex-col items-center gap-0.5 px-1 pt-2 pb-1.5 text-[11px] font-bold transition-colors",
                isActive ? "text-violet-700" : "text-slate-500",
              ].join(" ")}
              href={item.href}
              key={item.href}
            >
              <span
                className={[
                  "flex h-8 w-12 items-center justify-center rounded-full transition-colors",
                  isActive ? "bg-violet-100" : "",
                ].join(" ")}
              >
                {item.icon ? <Icon name={item.icon} /> : null}
              </span>
              <span className="max-w-full truncate">
                {item.shortLabel ?? item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
