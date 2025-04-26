import Link from "next/link";
import { Button } from "../ui/button";
import { Save } from "lucide-react";

interface CreationPageFooterProps {
  cancelUrl: string;
}

export function CreationPageFooter({ cancelUrl }: CreationPageFooterProps) {
    return (
        <div className="flex justify-end gap-4">
            <Button variant="outline" asChild>
                <Link href={ cancelUrl }>Cancelar</Link>
            </Button>
            <Button form="new-booking-form">
                <Save className="mr-2 h-4 w-4" />
                Salvar
            </Button>
        </div>
    );
}
