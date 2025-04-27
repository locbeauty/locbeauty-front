"use client";

import { DashboardHeader } from "@/components/pages/dashboard/DashboardHeader";
import { Sidebar } from "@/components/shared/Sidebar";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode
  }>) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="max-h-screen flex bg-background">
            <Sidebar
                className={ cn(sidebarOpen ? "translate-x-0" : "-translate-x-full") }
            />

            <div className="flex-1 md:ml-48">
                <DashboardHeader setSidebarOpen={ setSidebarOpen } />
                <main className="p-6">{ children }</main>
            </div>

            { /* Overlay for mobile */ }
            { sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={ () => setSidebarOpen(false) } />
            ) }
        </div>
    );
}