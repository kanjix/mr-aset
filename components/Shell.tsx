"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LangSwitch from "./LangSwitch";
import SignOutButton from "./SignOutButton";
import { useT } from "./I18nProvider";
import { site } from "@/lib/config";

export default function Shell({
  role,
  name,
  groupName,
  children,
}: {
  role: string;
  name: string;
  groupName?: string | null;
  children: React.ReactNode;
}) {
  const t = useT();
  const pathname = usePathname();

  const studentNav = [
    { href: "/dashboard", label: t.shell.home },
    { href: "/lessons", label: t.shell.lessons },
    { href: "/materials", label: t.shell.materials },
    { href: "/support", label: t.shell.support },
  ];
  const adminNav = [
    { href: "/admin", label: t.shell.students },
    { href: "/admin/materials", label: t.shell.adminMaterials },
    { href: "/admin/lessons", label: t.shell.adminLessons },
    { href: "/admin/assignments", label: t.shell.adminAssignments },
    { href: "/admin/review", label: t.shell.review },
  ];
  // Профиль — не в нижней панели вкладок (там и так тесно), а отдельной ссылкой.
  const sidebarNav = role === "admin" ? [...adminNav, { href: "/profile", label: t.shell.profile }] : [...studentNav, { href: "/profile", label: t.shell.profile }];
  const tabNav = role === "admin" ? adminNav : studentNav;
  const home = role === "admin" ? "/admin" : "/dashboard";

  const isActive = (href: string) =>
    href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const groupLabel = groupName ? t.common.groupOf(groupName) : "";
  const groupText = groupLabel.charAt(0).toUpperCase() + groupLabel.slice(1);

  return (
    <div className="md:flex">
      {/* Боковое меню на компьютере */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-rule px-5 py-6 md:flex">
        <Link href={home} className="text-lg font-semibold tracking-tight">
          {site.brand}
        </Link>
        {role === "admin" ? (
          <p className="mt-1 text-sm text-muted">{t.shell.manage}</p>
        ) : (
          groupName && <p className="mt-1 text-sm text-muted">{groupText}</p>
        )}

        <nav className="mt-8 flex flex-col gap-1">
          {sidebarNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`rounded-md px-3 py-2 text-[0.9375rem] transition-colors ${
                isActive(item.href)
                  ? "bg-pen-soft font-medium text-pen"
                  : "text-ink hover:bg-pen-soft/60"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-rule pt-4">
          <LangSwitch className="mb-4" />
          <p className="mb-3 truncate text-sm">{name}</p>
          <SignOutButton />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Верхняя полоса на телефоне */}
        <header className="flex items-center justify-between gap-2 border-b border-rule px-5 py-3 md:hidden">
          <Link href={home} className="font-semibold tracking-tight">
            {site.brand}
          </Link>
          <div className="flex items-center gap-2">
            <LangSwitch />
            <Link
              href="/profile"
              aria-current={isActive("/profile") ? "page" : undefined}
              className={`btn btn-ghost btn-sm ${isActive("/profile") ? "text-pen" : ""}`}
            >
              {t.shell.profile}
            </Link>
            <SignOutButton />
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl px-5 py-8 pb-28 md:px-10 md:py-12 md:pb-16">
          {children}
        </main>
      </div>

      {/* Нижнее меню на телефоне: без профиля, чтобы вкладки не теснились */}
      <nav
        className="fixed inset-x-0 bottom-0 z-10 grid border-t border-rule bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        style={{ gridTemplateColumns: `repeat(${tabNav.length}, minmax(0, 1fr))` }}
      >
        {tabNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive(item.href) ? "page" : undefined}
            className={`px-1 py-3.5 text-center text-[0.8125rem] ${
              isActive(item.href) ? "font-medium text-pen" : "text-muted"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}