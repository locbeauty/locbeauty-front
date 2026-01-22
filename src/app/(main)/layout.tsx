"use client";

import { AuthProvider } from "@/contexts/auth-provider";
import PageWithAuth from "./page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AccessProvider } from "@/contexts/access-provider";

export const queryClient = new QueryClient();

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <AccessProvider>
        <PageWithAuth>
          <QueryClientProvider client={ queryClient }>
            {children}
          </QueryClientProvider>
        </PageWithAuth>
      </AccessProvider>
    </AuthProvider>
  );
}
