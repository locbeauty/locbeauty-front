"use client";

import { cn } from "@/lib/utils";
import { ROUTES } from "@/utils/routes";
import { Building2, Calendar, Home, Package, UserRound, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Label } from "../ui/label";

export function Sidebar({ className }: React.HTMLAttributes<HTMLDivElement>
) {
    const pathname = usePathname();

    const routes = [
        {
            name: "Dashboard",
            href: ROUTES.DASHBOARD,
            icon: Home,
        },
        {
            name: "Clientes",
            href: ROUTES.CUSTOMERS,
            icon: Users,
        },
        {
            name: "Equipamentos",
            href: ROUTES.GEARS,
            icon: Package,
        },
        {
            name: "Regionais",
            href: ROUTES.REGIONALS,
            icon: Building2,
        },
        {
            name: "Funcionários",
            href: ROUTES.EMPLOYEES,
            icon: UserRound,
        },
        {
            name: "Agendamentos",
            href: ROUTES.BOOKINGS,
            icon: Calendar,
        },
    ];

    return (
        <aside className={ cn("m-2 rounded-r-2xl flex flex-col bg-primary dark:bg-primary-foreground text-primary-foreground fixed inset-y-0 left-0 z-50 w-48 transform transition-transform duration-200 ease-in-out md:translate-x-0", className) }>
            <div className="flex h-16 items-center border-b border-primary-foreground/10 px-4">
                <div className="flex items-center justify-center gap-4 w-full">
                    <div className="w-8 h-8 bg-white dark:bg-locbeauty rounded-full flex items-center justify-center">
                        <Users className="size-5 text-black" />
                    </div>
                    <Label className="text-lg font-bold dark:text-locbeauty">Locbeauty</Label>
                </div>
            </div>
            <nav className="flex-1 overflow-auto py-4">
                <ul className="grid gap-1 px-2">
                    { routes.map((route) => (
                        <li key={ route.href }>
                            <Link
                                href={ route.href }
                                className={ cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-primary-foreground/10 dark:hover:bg-secondary-foreground/10 hover:text-white transition-colors",
                                    pathname === route.href ? "bg-primary-foreground/10 dark:hover:text-gray-400 dark:bg-secondary-foreground/10 text-white" : "text-primary-foreground/80 dark:text-secondary-foreground",
                                ) }
                            >
                                <route.icon className="h-5 w-5" />
                                { route.name }
                            </Link>
                        </li>
                    )) }
                </ul>
            </nav>
        </aside>
    );
}