"use client";
import { CreateBookingForm } from "@/components/pages/bookings/create/CreateBookingForm";
import { Button } from "@/components/ui/button";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { SYSTEM_MODULES } from "@/utils/@types/access";

export default function CreateBookingPage() {
  const router = useRouter();

  return (
    <RouteGuard module={ SYSTEM_MODULES.BOOKINGS } action="canCreate">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Button onClick={ () => router.back() } variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Voltar</span>
            </Button>
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

        <CreateBookingForm />
      </div>
    </RouteGuard>
  );
}
