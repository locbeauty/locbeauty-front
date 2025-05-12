"use client";

import { useState } from "react";
import {
    Download
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OverviewTab } from "@/components/pages/dashboard/tabs/OverviewTab";
import { DetailsTab } from "@/components/pages/dashboard/tabs/DetailsTab";
import { CustomersTab } from "@/components/pages/dashboard/tabs/CustomersTab";
import { LocationsTab } from "@/components/pages/dashboard/tabs/LocationsTab";

export default function DashboardPage() {
    const [ period, setPeriod ] = useState("mensal");

    return (
        <div className="flex flex-col">
            <div className="">
                <main className="flex-1 overflow-auto">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                            <div className="flex items-center gap-2">
                                <Select defaultValue={ period } onValueChange={ setPeriod }>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Selecione o período" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="diario">Diário</SelectItem>
                                        <SelectItem value="semanal">Semanal</SelectItem>
                                        <SelectItem value="mensal">Mensal</SelectItem>
                                        <SelectItem value="anual">Anual</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button variant="outline" size="icon">
                                    <Download className="h-4 w-4" />
                                    <span className="sr-only">Exportar relatório</span>
                                </Button>
                            </div>
                        </div>
                        <Tabs defaultValue="overview" className="space-y-4">
                            <TabsList className="">
                                <TabsTrigger className="text-xs md:text-sm" value="overview">Visão Geral</TabsTrigger>
                                <TabsTrigger className="text-xs md:text-sm" value="analytics">Análise Detalhada</TabsTrigger>
                                <TabsTrigger className="text-xs md:text-sm" value="customers">Clientes</TabsTrigger>
                                <TabsTrigger className="text-xs md:text-sm" value="locations">Localidades</TabsTrigger>
                            </TabsList>
                            <TabsContent value="overview" className="space-y-4">
                                <OverviewTab period={ period } />
                            </TabsContent>
                            <TabsContent value="analytics" className="space-y-4">
                                <DetailsTab />
                            </TabsContent>
                            <TabsContent value="customers" className="space-y-4">
                                <CustomersTab />
                            </TabsContent>
                            <TabsContent value="locations" className="space-y-4">
                                <LocationsTab />
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </div>
        </div>
    );
}
