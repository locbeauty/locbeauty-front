"use client";

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { type Dispatch, type SetStateAction, useEffect } from "react";
import { DarkModeSwitcher } from "../../shared/DarkModeSwitcher";

import { UserDropdown } from "./UserDropdown";

export function DashboardHeader({
  setSidebarOpen,
}: {
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const pathname = usePathname();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  return (
    <header className="z-40 border-b bg-background">
      <div className="flex h-16 items-center px-4">
        <Button
          variant="outline"
          size="icon"
          className="md:hidden bg-primary text-white mr-2"
          onClick={() => setSidebarOpen((prev) => !prev)}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        <div className="flex items-center ml-auto">
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
