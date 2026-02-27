"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/dashboard", icon: "grid_view", label: "Dashboard" },
  { href: "/dashboard/schedule", icon: "calendar_today", label: "Schedule" },
  { href: "/dashboard/courses", icon: "book_5", label: "Courses" },
  { href: "/dashboard/insights", icon: "analytics", label: "Insights" },
  { href: "/dashboard/settings", icon: "settings", label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="w-64 bg-background-dark text-white flex flex-col shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary rounded-lg p-1">
          <span className="material-symbols-outlined text-background-dark font-bold">query_stats</span>
        </div>
        <h1 className="text-lg font-bold leading-tight tracking-tight">StudyLoad</h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navLinks.map((link) => {
          const active = isActive(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                active
                  ? "bg-primary/10 border-r-4 border-primary text-primary"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className={`material-symbols-outlined ${active ? "filled-icon" : ""}`}>{link.icon}</span>
              <span className="font-medium text-sm">{link.label}</span>
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
