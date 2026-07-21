"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, ClipboardCheck, History, BarChart2, Zap } from "lucide-react";
import clsx from "clsx";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/listings", label: "Anúncios", icon: ShoppingBag },
  { href: "/approvals", label: "Aprovações", icon: ClipboardCheck },
  { href: "/history", label: "Histórico", icon: History },
  { href: "/ads", label: "Ads", icon: BarChart2 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-gray-900 text-white shrink-0">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-700">
        <Zap className="text-blue-400" size={22} />
        <div>
          <p className="font-bold text-sm leading-tight">MTL Nutrition</p>
          <p className="text-xs text-gray-400">Painel Mercado Livre</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-gray-700 text-xs text-gray-500">
        v1.0.0 · modo mock
      </div>
    </aside>
  );
}
