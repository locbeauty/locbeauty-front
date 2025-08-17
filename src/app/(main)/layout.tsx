"use client";

import { DashboardHeader } from "@/components/ui/AplicationHeader/DashboardHeader";
import { Sidebar } from "@/components/shared/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AuthProvider } from "@/contexts/auth-provider";
import { CartProvider } from "@/contexts/cart-provider";
import PageWithAuth from "./page";

export default function DashboardLayout({
    children,
}: Readonly<{
  children: React.ReactNode;
}>) {

    return (
        <AuthProvider>
            <PageWithAuth>{children}</PageWithAuth>
        </AuthProvider>
    );
}
