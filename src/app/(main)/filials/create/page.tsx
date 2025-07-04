import { CreateFilialForm } from "@/components/pages/filials/create/CreateFilialForm";
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

export default function CreateFilialPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href={ ROUTES.FILIALS }>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Voltar</span>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Nova Filial</h1>
                    <p className="text-muted-foreground">
            Cadastre uma nova filial no sistema
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dados da filial</CardTitle>
                    <CardDescription>Preencha os dados da filial</CardDescription>
                </CardHeader>
                <CreateFilialForm />
            </Card>

            <CreationPageFooter
                cancelUrl={ ROUTES.FILIALS }
                formId="create-filial-form"
            />
        </div>
    );
}
