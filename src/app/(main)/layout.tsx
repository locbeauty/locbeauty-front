"use client";

import { AuthProvider } from "@/contexts/auth-provider";
import PageWithAuth from "./page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export default function DashboardLayout({
    children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
        <AuthProvider>
            <PageWithAuth>
                <QueryClientProvider client={ queryClient }>
                    {children}
                </QueryClientProvider>
            </PageWithAuth>
        </AuthProvider>
    );
}
