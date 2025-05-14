"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useMounted } from "@/hooks/useMounted";
import { Switch } from "../ui/switch";

export function DarkModeSwitcher() {
    const { setTheme, resolvedTheme } = useTheme();
    const mounted = useMounted();

    const toggleTheme = () => {
        if(resolvedTheme === "dark") {
            setTheme("light");
        } else {
            setTheme("dark");
        }
    };

    if(!mounted) return null;

    return (
        <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2">
                {mounted && resolvedTheme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <span className="text-sm">Dark Mode</span>
            </div>
            {mounted && <Switch checked={ resolvedTheme === "dark" } onCheckedChange={ toggleTheme } aria-label="Toggle dark mode" />}
        </div>
    );
}
