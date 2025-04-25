import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
            <div className="text-center space-y-6 max-w-md">
                <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary text-6xl font-bold">?</span>
                    </div>
                </div>

                <h1 className="text-4xl font-bold text-primary">Página não encontrada</h1>

                <div className="space-y-2">
                    <p className="text-xl text-muted-foreground">A página que você está procurando não existe ou foi movida.</p>
                    <p className="text-muted-foreground">
                        Verifique o endereço digitado ou utilize uma das opções abaixo para navegar.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Button asChild size="lg" className="gap-2">
                        <Link href="/dashboard">
                            <Home className="h-4 w-4" />
                            Ir para o Dashboard
                        </Link>
                    </Button>
                </div>

                <div className="text-sm text-muted-foreground pt-8">
                    <p>Código: 404 | Sistema de Gestão</p>
                </div>
            </div>
        </div>
    );
}
