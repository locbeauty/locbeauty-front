import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/utils/routes";
import { Users, Package, Building2, UserRound, Calendar } from "lucide-react";
import Link from "next/link";

const CardList = [
    {
        title: "Clientes",
        description: "Gerenciar cadastro de clientes",
        link: ROUTES.CUSTOMERS,
        icon: Users,
    },
    {
        title: "Equipamentos",
        description: "Gerenciar cadastro de equipamentos",
        link: ROUTES.GEARS,
        icon: Package,
    },
    {
        title: "Regionais",
        description: "Gerenciar cadastro de regionais",
        link: ROUTES.REGIONALS,
        icon: Building2,
    },
    {
        title: "Funcionários",
        description: "Gerenciar cadastro de funcionários",
        link: ROUTES.EMPLOYEES,
        icon: UserRound,
    },
    {
        title: "Agendamentos",
        description: "Gerenciar agendamentos de locações",
        link: ROUTES.BOOKINGS,
        icon: Calendar,
    },
];

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Bem-vindo ao Sistema de Gestão. Você pode navegar pelo sistema com as
                    opções abaixo.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                { CardList.map((card) => (
                    <Link key={ card.title } href={ card.link }>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-lg font-medium">
                                    { card.title }
                                </CardTitle>
                                <card.icon className="size-5 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <CardDescription>{ card.description }</CardDescription>
                            </CardContent>
                        </Card>
                    </Link>
                )) }
            </div>
        </div>
    );
}
