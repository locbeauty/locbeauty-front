import { CreateRegionalForm } from "@/components/pages/regionals/create/CreateRegionalForm";
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

export default function CreateRegionalPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href={ ROUTES.REGIONALS }>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Voltar</span>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Nova Regional</h1>
                    <p className="text-muted-foreground">
            Cadastre uma nova regional no sistema
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dados da regional</CardTitle>
                    <CardDescription>Preencha os dados da regional</CardDescription>
                </CardHeader>
                <CreateRegionalForm />
            </Card>

            <CreationPageFooter
                cancelUrl={ ROUTES.REGIONALS }
                formId="create-regional-form"
            />
        </div>
    );
}
