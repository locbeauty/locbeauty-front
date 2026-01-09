"use client";

import { EditProfileForm } from "@/components/pages/profile/EditProfileForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const router = useRouter();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={ () => router.back() }>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Voltar</span>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
                    <p className="text-muted-foreground">
            Gerencie suas informações pessoais
                    </p>
                </div>
            </div>

            <div className="">
                <EditProfileForm />
            </div>
        </div>
    );
}
