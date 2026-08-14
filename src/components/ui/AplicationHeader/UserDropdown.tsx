"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LoaderCircle, LogOut, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DarkModeSwitcher } from "@/components/shared/DarkModeSwitcher";
import { useAuth } from "@/contexts/auth-provider";
import Link from "next/link";
import { User } from "lucide-react";
import { Can } from "@/components/auth/Can";
import { SYSTEM_MODULES } from "@/utils/@types/access";

export function UserDropdown() {
  const { user, isLoading, handleLogout } = useAuth();

  if (isLoading || !user) {
    return <LoaderCircle className="animate-spin" />;
  }
  const nameInitials =
    user.fullname
      ?.split(" ")
      .map((name: string) => name[0])
      .join("")
      .slice(0, 2) || "-";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-3 px-3 py-2 h-auto rounded-lg ml-auto hover:text-muted-foreground hover:bg-muted-foreground/10 transition-colors"
        >
          <Avatar className="h-9 w-9 border">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {nameInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium leading-none">
              {user.fullname}
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              {user.role}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 ml-1 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 mt-1">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">
            {user.email || "antoniomarcelob12@gmail.com"}
          </p>
          <p className="text-xs text-muted-foreground">
            {user.SourceFilial?.filialName || "Filial Recife"}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Button
            variant="ghost"
            className="cursor-pointer w-full justify-start h-auto px-2 py-1.5"
            asChild
          >
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              <span>Meu Perfil</span>
            </Link>
          </Button>
        </DropdownMenuItem>

        <Can module={ SYSTEM_MODULES.AUDITORIA } action="canView">
          <DropdownMenuItem asChild>
            <Button
              variant="ghost"
              className="cursor-pointer w-full justify-start h-auto px-2 py-1.5"
              asChild
            >
              <Link href="/audit">
                <ScrollText className="mr-2 h-4 w-4" />
                <span>Auditoria</span>
              </Link>
            </Button>
          </DropdownMenuItem>
        </Can>

        <DropdownMenuSeparator />
        <DarkModeSwitcher />
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Button
            onClick={handleLogout}
            disabled={isLoading}
            variant="ghost"
            className="cursor-pointer text-red-500 hover:text-red-600 focus:text-red-600 w-full justify-start h-auto px-2 py-1.5"
          >
            {isLoading ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            <span>{isLoading ? "Logging out..." : "Log out"}</span>
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
