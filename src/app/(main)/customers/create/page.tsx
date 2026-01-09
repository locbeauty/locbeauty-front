import { CreateCustomerForm } from "@/components/pages/customers/create/CreateCustomerForm";
import { CreationPageFooter } from "@/components/shared/CreationPageFooter";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/utils/routes";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { SYSTEM_MODULES } from "@/utils/@types/access";

export default function CreateCustomerPage() {
    return (
        <RouteGuard module={ SYSTEM_MODULES.CUSTOMERS } action="canCreate">
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={ ROUTES.CUSTOMERS }>
                            <ArrowLeft className="h-4 w-4" />
                            <span className="sr-only">Voltar</span>
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Novo Cliente</h1>
                        <p className="text-muted-foreground">
              Cadastre um novo cliente no sistema
                        </p>
                    </div>
                </div>

                <CreateCustomerForm />

                <CreationPageFooter
                    formId="create-customer-form"
                    cancelUrl={ ROUTES.CUSTOMERS }
                />
            </div>
        </RouteGuard>
    );
}
