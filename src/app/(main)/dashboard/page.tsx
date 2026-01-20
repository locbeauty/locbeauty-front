"use client";

import { Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { OverviewTab } from "@/components/pages/dashboard/tabs/OverviewTab";
import { DetailsTab } from "@/components/pages/dashboard/tabs/DetailsTab";
import { CustomersTab } from "@/components/pages/dashboard/tabs/CustomersTab";
import { LocationsTab } from "@/components/pages/dashboard/tabs/LocationsTab";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { InsightsTab } from "@/components/pages/dashboard/tabs/InsightsTab";

export default function DashboardPage() {
  return (
    <RouteGuard module={ SYSTEM_MODULES.DASHBOARD } action="canView">
      <div className="flex flex-col">
        <div className="">
          <main className="flex-1 overflow-auto">
            <div className="flex flex-col gap-6">
              <div className="flex gap-4 items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Exportar relatório</span>
                  </Button>
                </div>
              </div>
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="">
                  <TabsTrigger className="text-xs md:text-sm" value="overview">
                    Visão Geral
                  </TabsTrigger>
                  <TabsTrigger className="text-xs md:text-sm" value="analytics">
                    Análise Detalhada
                  </TabsTrigger>
                  <TabsTrigger
                    className="text-xs md:text-sm"
                    value="new-insights"
                  >
                    Novos Insights
                  </TabsTrigger>
                  <TabsTrigger className="text-xs md:text-sm" value="customers">
                    Clientes
                  </TabsTrigger>
                  <TabsTrigger className="text-xs md:text-sm" value="locations">
                    Localidades
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                  <OverviewTab />
                </TabsContent>
                <TabsContent value="customers" className="space-y-4">
                  <CustomersTab />
                </TabsContent>
                <TabsContent value="analytics" className="space-y-4">
                  <DetailsTab />
                </TabsContent>
                <TabsContent value="new-insights" className="space-y-4">
                  <InsightsTab />
                </TabsContent>
                <TabsContent value="locations" className="space-y-4">
                  <LocationsTab />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </RouteGuard>
  );
}
