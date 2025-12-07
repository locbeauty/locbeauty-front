"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    CalendarIcon,
    FilterX,
    Search,
} from "lucide-react";

// UI Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Services & Types
import { Training } from "@/utils/@types/training";
import { Trainee } from "@/utils/@types/trainee";
import { Volunteer } from "@/utils/@types/volunteer";
import { ApiResponse } from "@/lib/api";
import { GetAllTrainees } from "@/services/trainees.service";
import { GetAllVolunteers } from "@/services/volunteers.service";

// Custom Components
import { SelectTrainee } from "./SelectTrainee";
import { SelectVolunteer } from "./SelectVolunteer";
import { TrainingCard } from "./TrainingCard";

export interface FilterState {
    traineeName?: string;
    volunteerName?: string;
    date?: string;
}

interface TrainingsListProps {
    trainings: Training[] | undefined;
}

export function TrainingsList({ trainings }: TrainingsListProps) {
    const [ filters, setFilters ] = useState<FilterState>({
        traineeName: undefined,
        volunteerName: undefined,
        date: undefined,
    });

    // --- Queries ---
    const traineesData = useQuery<ApiResponse<Trainee[]>, Error>({
        queryKey: [ "get-all-trainees" ],
        queryFn: GetAllTrainees,
        staleTime: 1000 * 60,
    });
    const allTrainees = traineesData.data?.data;

    const volunteersData = useQuery<ApiResponse<Volunteer[]>, Error>({
        queryKey: [ "get-all-volunteers" ],
        queryFn: GetAllVolunteers,
        staleTime: 1000 * 60,
    });
    const allVolunteers = volunteersData.data?.data;

    // --- Filtragem ---
    const filteredTrainings = useMemo(() => {
        if (!trainings) return [];

        return trainings.filter((training) => {
            // Filtro por Aluno
            if (filters.traineeName?.trim()) {
                const traineeMatch = training.Trainee.name
                    .toLowerCase()
                    .includes(filters.traineeName.toLowerCase());
                if (!traineeMatch) return false;
            }

            // Filtro por Modelo
            if (filters.volunteerName?.trim()) {
                const volunteerMatch = training.Volunteer.name
                    .toLowerCase()
                    .includes(filters.volunteerName.toLowerCase());
                if (!volunteerMatch) return false;
            }

            // Filtro por Data (Treinos a partir da data X)
            if (filters.date) {
                // Zera as horas para comparar apenas o dia
                const trainingDate = new Date(training.dueDate).setHours(0,0,0,0);
                // O input date vem como YYYY-MM-DD, precisamos tratar fuso se necessário,
                // mas new Date(string) geralmente funciona bem para comparação simples
                const filterDate = new Date(filters.date + "T00:00:00").setHours(0,0,0,0);

                if (trainingDate < filterDate) return false;
            }

            return true;
        });
    }, [ trainings, filters ]);

    const hasActiveFilters = !!(filters.traineeName || filters.volunteerName || filters.date);

    const handleClearFilters = () => {
        setFilters({
            traineeName: undefined,
            volunteerName: undefined,
            date: undefined,
        });
    };

    return (
        <div className="space-y-6">

            {/* --- BARRA DE FILTROS MINIMALISTA --- */}
            <div className="flex flex-col gap-4 border-b pb-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                    {/* Grupo de Inputs */}
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">

                        {/* Wrapper com largura fixa para manter alinhamento visual clean */}
                        <div className="w-full sm:w-[240px]">
                            <SelectTrainee
                                trainees={ allTrainees }
                                selectedTrainee={ filters.traineeName }
                                onTraineeChange={ (traineeName) =>
                                    setFilters((prev) => ({ ...prev, traineeName }))
                                }
                            />
                        </div>

                        <div className="w-full sm:w-[240px]">
                            <SelectVolunteer
                                volunteers={ allVolunteers }
                                selectedVolunteer={ filters.volunteerName }
                                onVolunteerChange={ (volunteerName) =>
                                    setFilters((prev) => ({ ...prev, volunteerName }))
                                }
                            />
                        </div>

                        <div className="relative w-full sm:w-[180px]">
                            <Input
                                type="date"
                                className="w-full h-10"
                                value={ filters.date || "" }
                                onChange={ (e) =>
                                    setFilters((prev) => ({ ...prev, date: e.target.value }))
                                }
                            />
                        </div>

                        {/* Botão Limpar (Só aparece quando necessário) */}
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={ handleClearFilters }
                                className="h-10 w-10 text-muted-foreground hover:text-destructive"
                                title="Limpar filtros"
                            >
                                <FilterX className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {/* Contador de Resultados */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap ml-auto">
                        <span className="font-medium text-foreground">{filteredTrainings.length}</span>
                        <span>registros encontrados</span>
                    </div>
                </div>
            </div>

            {/* --- LISTAGEM --- */}
            <div className="grid gap-4">
                {filteredTrainings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/10 border-dashed">
                        <div className="bg-muted p-3 rounded-full mb-3">
                            <Search className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium text-lg">Nenhum treinamento encontrado</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mt-1">
                            Não encontramos resultados com os filtros atuais. Tente limpar os filtros ou buscar por outra data.
                        </p>
                        {hasActiveFilters && (
                            <Button variant="link" onClick={ handleClearFilters } className="mt-4">
                                Limpar todos os filtros
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredTrainings.map((training) => (
                            <TrainingCard key={ training.trainingId } training={ training } />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}