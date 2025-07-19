"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LoaderCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DarkModeSwitcher } from "@/components/shared/DarkModeSwitcher";
import { useAuth } from "@/contexts/auth-provider";
import { redirect } from "next/navigation";

export function UserDropdown() {
    const { user, isLoading } = useAuth();

    if(isLoading || !user) {
        return <LoaderCircle className="animate-spin" />;
    }
    const nameInitials = user.employeeName.split(" ").map(name => name[0]).join("").slice(0, 2);

    async function handleLogout() {
        await fetch("http://localhost:3000/api/logout");
        redirect("/login");
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex items-center gap-3 px-3 py-2 h-auto rounded-lg ml-auto hover:text-muted-foreground hover:bg-muted-foreground/10 transition-colors"
                >
                    <Avatar className="h-9 w-9 border">
                        <AvatarFallback>{nameInitials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                        <span className="text-sm font-medium leading-none">{user.employeeName}</span>
                        <span className="text-xs text-muted-foreground mt-1">{user.role}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 ml-1 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 mt-1">

                <DarkModeSwitcher />

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                    <Button onClick={ () => handleLogout() } variant="outline" className="cursor-pointer text-red-500 hover:text-red-600 focus:text-red-600 w-full">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </Button>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
