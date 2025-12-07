"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    GraduationCap,
    Calendar,
    Clock,
    MapPin,
    User,
    Filter,
    X,
} from "lucide-react";
import { Training } from "@/utils/@types/training";
import { useState, useMemo, useEffect } from "react";
import { SelectTrainee } from "./SelectTrainee";
import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/lib/api";
import { Trainee } from "@/utils/@types/trainee";
import { GetAllTrainees } from "@/services/trainees.service";
import { SelectVolunteer } from "./SelectVolunteer";
import { GetAllVolunteers } from "@/services/volunteers.service";
import { Volunteer } from "@/utils/@types/volunteer";
import { Address } from "@/utils/@types/address";
import { GetAllCustomerAddresses } from "@/services/addresses.service";
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
    const [ showFilters, setShowFilters ] = useState(true);
    const [ filters, setFilters ] = useState<FilterState>({
        traineeName: undefined,
        volunteerName: undefined,
        date: undefined,
    });

    const traineesData = useQuery<ApiResponse<Trainee[]>, Error>({
        queryKey: [ "get-all-trainees" ],
        queryFn: GetAllTrainees,
        staleTime: 1000 * 60,
    });
    const allTrainees = traineesData.data?.data;

    const volunteersData = useQuery<ApiResponse<Volunteer[]>, Error>({
        queryKey: [ "get-all-volunteers" ],
        queryFn: GetAllVolunteers,
        staleTime: 1000 * 60, // 1 minuto de cache
    });

    const allVolunteers = volunteersData.data?.data;

    // Aplicar filtros aos treinamentos
    const filteredTrainings = useMemo(() => {
        if (!trainings) return [];

        return trainings.filter((training) => {
            // Filtro por nome do aluno
            if (filters.traineeName && filters.traineeName.trim() !== "") {
                const traineeMatch = training.Trainee.name
                    .toLowerCase()
                    .includes(filters.traineeName.toLowerCase());
                if (!traineeMatch) return false;
            }

            // Filtro por nome do volunteer
            if (filters.volunteerName && filters.volunteerName.trim() !== "") {
                const volunteerMatch = training.Volunteer.name
                    .toLowerCase()
                    .includes(filters.volunteerName.toLowerCase());
                if (!volunteerMatch) return false;
            }

            // Filtro por data inicial
            if (filters.date && filters.date.trim() !== "") {
                const trainingDate = new Date(training.dueDate);
                const startDate = new Date(filters.date);
                if (trainingDate < startDate) return false;
            }

            return true;
        });
    }, [ trainings, filters ]);

    const hasActiveFilters = useMemo(() => {
        return (
            (filters.traineeName && filters.traineeName.trim() !== "") ||
      (filters.volunteerName && filters.volunteerName.trim() !== "") ||
      (filters.date && filters.date.trim() !== "")
        );
    }, [ filters ]);

    const handleClearFilters = () => {
        setFilters({
            traineeName: undefined,
            volunteerName: undefined,
            date: undefined,
        });
    };

    return (
        <div className="space-y-4">
            {/* Área de Filtros */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            <h2 className="font-semibold text-lg">Filtros</h2>
                            {hasActiveFilters && (
                                <Badge variant="secondary">
                                    {filteredTrainings.length} de {trainings?.length || 0}
                                </Badge>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={ () => setShowFilters(!showFilters) }
                        >
                            {showFilters ? "Ocultar" : "Mostrar"}
                        </Button>
                    </div>

                    {showFilters && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Filtro por Aluno */}
                                <div className="space-y-2">
                                    <Label htmlFor="traineeName">Nome do Aluno</Label>
                                    <SelectTrainee
                                        trainees={ allTrainees }
                                        selectedTrainee={ filters.traineeName }
                                        onTraineeChange={ (traineeName) => {
                                            setFilters((prev) => ({
                                                ...prev,
                                                traineeName,
                                            }));
                                        } }
                                    />
                                </div>

                                {/* Filtro por Volunteer */}
                                <div className="space-y-2">
                                    <Label htmlFor="volunteerName">Nome do Volunteer</Label>
                                    <SelectVolunteer
                                        volunteers={ allVolunteers }
                                        selectedVolunteer={ filters.volunteerName }
                                        onVolunteerChange={ (volunteerName) => {
                                            setFilters((prev) => ({
                                                ...prev,
                                                volunteerName,
                                            }));
                                        } }
                                    />
                                </div>

                                {/* Filtro por Data Inicial */}
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Data Inicial</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={ filters.date || "" }
                                        onChange={ (e) =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                startDate: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            </div>

                            {hasActiveFilters && (
                                <div className="flex justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={ handleClearFilters }
                                    >
                                        <X className="h-4 w-4 mr-2" />
                    Limpar Filtros
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Lista de Treinamentos */}
            <div className="grid gap-4">
                {filteredTrainings.length === 0 ? (
                    <Card>
                        <CardContent className="p-6 text-center text-muted-foreground">
              Nenhum treinamento encontrado com os filtros aplicados.
                        </CardContent>
                    </Card>
                ) : (
                    filteredTrainings.map((training) => (
                        <TrainingCard key={ training.trainingId } training={ training } />
                    ))
                )}
            </div>
        </div>
    );
}
