import { CreateBookingForm } from "@/components/pages/bookings/CreateBookingForm";
import { CreationPageFooter } from "@/components/shared/CreationPageFooter";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { ROUTES } from "@/utils/routes";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateBookingPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href={ ROUTES.BOOKINGS }>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Voltar</span>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Novo Agendamento
                    </h1>
                    <p className="text-muted-foreground">
                        Cadastre um novo agendamento de locação
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dados do Agendamento</CardTitle>
                    <CardDescription>Preencha os dados do agendamento</CardDescription>
                </CardHeader>
                <CreateBookingForm />
            </Card>

            <CreationPageFooter cancelUrl={ ROUTES.BOOKINGS } />
        </div>
    );
}
