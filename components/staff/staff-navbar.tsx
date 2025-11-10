"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Users, ClipboardList, Calendar, FileText, BarChart3, BookOpen, FileBarChart, UserCog } from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard/staff",
    icon: BarChart3,
  },
  {
    title: "Schedule Management",
    href: "/dashboard/staff/schedules",
    icon: UserCog,
  },
  {
    title: "User Management",
    href: "/dashboard/staff/users",
    icon: Users,
  },
  {
    title: "Client Management",
    href: "/dashboard/staff/clients",
    icon: UserCog,
  },
  {
    title: "My Cases",
    href: "/dashboard/staff/cases",
    icon: ClipboardList,
  },
  {
    title: "Service Plans",
    href: "/dashboard/staff/service-plans",
    icon: FileText,
  },
  {
    title: "Appointments",
    href: "/dashboard/staff/appointments",
    icon: Calendar,
  },
  {
    title: "Reports",
    href: "/dashboard/staff/reports",
    icon: FileBarChart,
  },
  {
    title: "Resources",
    href: "/dashboard/staff/resources",
    icon: BookOpen,
  },
  {title: "Goals", href: "/dashboard/staff/goals", icon: BarChart3 },

  {title: "clients", href: "/dashboard/staff/clients", icon: BarChart3 },

];

export function StaffNavbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-white dark:bg-zinc-950">
      <div className="flex items-center space-x-4 px-6 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                isActive
                  ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100"
                  : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
