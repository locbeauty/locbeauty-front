"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useMounted } from "@/hooks/useMounted";

export function DarkModeSwitcher() {
    const { theme, setTheme } = useTheme();
    const mounted = useMounted();

    if(!mounted) return null;

    return (
        <Button
            onClick={ () => setTheme(theme === "dark" ? "light" : "dark") }
            variant="outline"
            size="icon"
        >
            { theme === "dark" ? (
                <Sun className="h-5 w-5" />
            ) : (
                <Moon className="h-5 w-5" />
            ) }
        </Button>
    );
}
