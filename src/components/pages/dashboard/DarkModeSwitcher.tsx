"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export function DarkModeSwitcher() {
    const { theme, setTheme } = useTheme();

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
