"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Mail,
    Phone,
    GraduationCap,
    MoreHorizontal,
    Eye,
    Search
} from "lucide-react";
import { Trainee } from "@/utils/@types/trainee";
import { TraineeCard } from "./TraineeCard";

interface TraineesListProps {
  trainees: Trainee[] | undefined;
  onViewDetails: (trainee: Trainee) => void;
}

export function TraineesList({ trainees, onViewDetails }: TraineesListProps) {
    const [ searchTerm, setSearchTerm ] = useState("");

    // Lógica de filtragem
    const filteredTrainees = trainees?.filter((trainee) => {
        if (!searchTerm) return true;
        return trainee.name.toLowerCase().includes(searchTerm.toLowerCase());
    }) || [];

    return (
        <div className="space-y-6">

            {/* --- ÁREA DE FILTRO --- */}
            <div className="flex w-full max-w-sm items-center space-x-2">
                <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Filtrar por nome do aluno..."
                        className="pl-9"
                        value={ searchTerm }
                        onChange={ (e) => setSearchTerm(e.target.value) }
                    />
                </div>
            </div>

            {/* --- LISTAGEM --- */}
            {filteredTrainees.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg">
                    Nenhum aluno encontrado com esse nome.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredTrainees.map((trainee) => (
                        <TraineeCard onViewDetails={ onViewDetails } trainee={ trainee } key={ trainee.traineeId } />
                    ))}
                </div>
            )}
        </div>
    );
}