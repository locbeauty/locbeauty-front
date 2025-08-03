"use client";

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { type Dispatch, type SetStateAction, useEffect } from "react";

import { UserDropdown } from "./UserDropdown";
import { CartSheet } from "@/components/pages/bookings/create/cart-sheet";
import { ROUTES } from "@/utils/routes";
import { Label } from "../label";
import { Progress } from "../progress";
import { Badge } from "../badge";

export function DashboardHeader({
    setSidebarOpen,
}: {
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
}) {
    const pathname = usePathname();

    useEffect(() => {
        setSidebarOpen(false);
    }, [ pathname, setSidebarOpen ]);

    return (
        <header className="z-40 border-b bg-background">
            <div className="flex h-16 items-center px-4">
                <Button
                    variant="outline"
                    size="icon"
                    className="md:hidden bg-primary text-white mr-2"
                    onClick={ () => setSidebarOpen((prev) => !prev) }
                >
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle sidebar</span>
                </Button>
                <div className="flex gap-4 items-center ml-auto">
                    {
                        pathname ===  ROUTES.CREATE_BOOKING && (
                            <div className="flex">
                                <CartSheet />
                            </div>
                        )
                    }
                    {/* <div className="">
                        <div className="flex justify-between">
                            <span className="text-sm font-bold">R$ 250,00 / R$ 500,00</span>
                        </div>
                        <div className="w-full h-5 rounded-full bg-border overflow-hidden relative">
                            <div
                                className="h-full bg-primary absolute left-0 top-0 transition-all"
                                style={ { width: "90%" } }
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-white text-xs font-bold z-10">
        50% concluído
                                </span>
                            </div>
                        </div>
                    </div> */}
                    <div className="flex items-center ml-auto">
                        <UserDropdown />
                    </div>
                </div>
            </div>
        </header>
    );
}
