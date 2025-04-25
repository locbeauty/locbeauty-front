import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/utils/routes";
import { Users, Package, Building2, UserRound, Calendar } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Bem-vindo ao Sistema de Gestão. Você pode navegar pelo sistema com as opções abaixo.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Link href={ROUTES.CUSTOMERS}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-medium">Clientes</CardTitle>
                            <Users className="size-5 text-accent" />
                        </CardHeader>
                        <CardContent>
                            <CardDescription>Gerenciar cadastro de clientes</CardDescription>
                        </CardContent>
                    </Card>
                </Link>

                <Link href={ROUTES.GEARS}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-medium">Equipamentos</CardTitle>
                            <Package className="size-5 text-accent" />
                        </CardHeader>
                        <CardContent>
                            <CardDescription>Gerenciar cadastro de equipamentos</CardDescription>
                        </CardContent>
                    </Card>
                </Link>

                <Link href={ROUTES.REGIONALS}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-medium">Filiais</CardTitle>
                            <Building2 className="size-5 text-accent" />
                        </CardHeader>
                        <CardContent>
                            <CardDescription>Gerenciar cadastro de filiais</CardDescription>
                        </CardContent>
                    </Card>
                </Link>

                <Link href={ROUTES.EMPLOYEES}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-medium">Funcionários</CardTitle>
                            <UserRound className="size-5 text-accent" />
                        </CardHeader>
                        <CardContent>
                            <CardDescription>Gerenciar cadastro de funcionários</CardDescription>
                        </CardContent>
                    </Card>
                </Link>

                <Link href={ROUTES.BOOKINGS}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-medium">Agendamentos</CardTitle>
                            <Calendar className="size-5 text-accent" />
                        </CardHeader>
                        <CardContent>
                            <CardDescription>Gerenciar agendamentos de locações</CardDescription>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}

