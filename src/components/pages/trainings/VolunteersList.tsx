"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // Certifique-se de ter este componente
import { User, Phone, Search } from "lucide-react";
import { Volunteer } from "@/utils/@types/volunteer";

interface VolunteersListProps {
  volunteers: Volunteer[] | undefined;
}

export function VolunteersList({ volunteers }: VolunteersListProps) {
    const [ searchTerm, setSearchTerm ] = useState("");

    // Lógica de filtragem
    const filteredVolunteers = volunteers?.filter((volunteer) => {
        if (!searchTerm) return true;
        return volunteer.name.toLowerCase().includes(searchTerm.toLowerCase());
    }) || [];

    return (
        <div className="space-y-6">
            {/* --- ÁREA DE FILTRO --- */}
            <div className="flex w-full max-w-sm items-center space-x-2">
                <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Filtrar por nome..."
                        className="pl-9" // Padding left para não ficar em cima do ícone
                        value={ searchTerm }
                        onChange={ (e) => setSearchTerm(e.target.value) }
                    />
                </div>
            </div>

            {/* --- LISTAGEM --- */}
            {filteredVolunteers.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg">
                    Nenhum paciente modelo encontrado com esse nome.
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredVolunteers.map((volunteer) => (
                        <Card key={ volunteer.volunteerId } className="hover:bg-muted/5 transition-colors">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <User className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold truncate max-w-[200px]" title={ volunteer.name }>
                                            {volunteer.name}
                                        </h3>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span>{volunteer.documentNumber}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span>{volunteer.cellphone}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}