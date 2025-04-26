import { CreateGearForm } from "@/components/pages/gears/CreateGearForm";
import { CreationPageFooter } from "@/components/shared/CreationPageFooter";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/utils/routes";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateGearPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href={ ROUTES.GEARS }>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Voltar</span>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Novo Equipamento
                    </h1>
                    <p className="text-muted-foreground">
                        Cadastre um novo equipamento no sistema
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dados do Equipamento</CardTitle>
                    <CardDescription>Preencha os dados do equipamento</CardDescription>
                </CardHeader>
                <CreateGearForm />
            </Card>

            <CreationPageFooter cancelUrl={ ROUTES.GEARS } />
        </div>
    );
}
