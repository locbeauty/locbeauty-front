"use client";

import { cn } from "@/lib/utils";
import { ROUTES } from "@/utils/routes";
import {
  BicepsFlexed,
  Building2,
  Calendar1,
  Home,
  MapPin,
  Package,
  TargetIcon,
  UserRound,
  Users,
  Cake,
  Megaphone,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { useAccess } from "@/contexts/access-provider";
import { useAuth } from "@/contexts/auth-provider";
import { USER_ROLES } from "@/utils/constants";

export function Sidebar({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const pathname = usePathname();
  const { can } = useAccess();
  const { user } = useAuth();

  const routes = [
    {
      name: "Dashboard",
      href: ROUTES.DASHBOARD,
      icon: Home,
      module: SYSTEM_MODULES.DASHBOARD,
    },
    {
      name: "Clientes",
      href: ROUTES.CUSTOMERS,
      icon: Users,
      module: SYSTEM_MODULES.CUSTOMERS,
    },
    {
      name: "Equipamentos",
      href: ROUTES.GEARS,
      icon: Package,
      module: SYSTEM_MODULES.GEARS,
    },
    {
      name: "Filiais",
      href: ROUTES.FILIALS,
      icon: Building2,
      module: SYSTEM_MODULES.FILIALS,
    },
    {
      name: "Funcionários",
      href: ROUTES.EMPLOYEES,
      icon: UserRound,
      module: SYSTEM_MODULES.EMPLOYEES,
    },
    {
      name: "Rotas",
      href: ROUTES.ROUTES,
      icon: MapPin,
      module: SYSTEM_MODULES.ROUTES,
      allowedRoles: [ USER_ROLES.MASTER, USER_ROLES.GERENTE, USER_ROLES.MOTORISTA, USER_ROLES.MOTORISTA_CHEFE, USER_ROLES.LOGISTICA ],
    },
    {
      name: "Agenda",
      href: ROUTES.SCHEDULE,
      icon: Calendar1,
      module: SYSTEM_MODULES.CALENDAR,
    },
    {
      name: "Metas",
      href: ROUTES.GOALS,
      icon: TargetIcon,
      module: SYSTEM_MODULES.GOALS,
    },
    {
      name: "Treinamentos",
      href: ROUTES.TRAININGS,
      icon: BicepsFlexed,
      module: SYSTEM_MODULES.TRAININGS,
    },
    {
      name: "Aniversariantes",
      href: ROUTES.BIRTHDAYS,
      icon: Cake,
      module: SYSTEM_MODULES.BIRTHDAYS,
    },
    {
      name: "Avisos",
      href: ROUTES.NOTICES,
      icon: Megaphone,
      module: SYSTEM_MODULES.NOTICES,
    },
  ];

  return (
    <aside
      className={ cn(
        "m-2 rounded-r-2xl flex flex-col bg-primary dark:bg-primary-foreground text-primary-foreground fixed inset-y-0 left-0 z-50 w-48 transform transition-transform duration-200 ease-in-out md:translate-x-0",
        className,
      ) }
    >
      <div className="flex h-16 items-center justify-center border-b border-primary-foreground/10 px-4">
        <Image
          src="/logo.png"
          alt="Locbeauty"
          width={ 195 }
          height={ 126 }
          priority
          className="h-11 w-auto"
        />
      </div>
      <nav className="flex-1 overflow-auto py-4">
        <ul className="grid gap-1 px-2">
          {routes
            .filter((route) => {
              if (!can(route.module, "canView")) return false;
              if ("allowedRoles" in route && route.allowedRoles) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return (route.allowedRoles as any[]).includes(user?.role);
              }
              return true;
            })
            .map((route) => (
              <li key={ route.href }>
                <Link
                  href={ route.href }
                  className={ cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-primary-foreground/10 dark:hover:bg-secondary-foreground/10 hover:text-white transition-colors",
                    pathname.includes(route.href)
                      ? "bg-primary-foreground/10 dark:hover:text-gray-400 dark:bg-secondary-foreground/10 text-white"
                      : "text-primary-foreground/80 dark:text-secondary-foreground",
                  ) }
                >
                  <route.icon className="h-5 w-5" />
                  {route.name}
                </Link>
              </li>
            ))}
        </ul>
      </nav>
    </aside>
  );
}
