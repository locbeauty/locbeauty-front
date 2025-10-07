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
    X
} from "lucide-react";
import { Training } from "@/utils/@types/training";
import { useState, useMemo } from "react";
import { SelectStudent } from "./SelectStudent";
import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/lib/api";
import { Student } from "@/utils/@types/student";
import { GetAllStudents } from "@/services/students.service";
import { SelectProfessor } from "./SelectProfessor";
import { GetAllProfessors } from "@/services/professors.service";
import { Professor } from "@/utils/@types/professor";
import { Address } from "@/utils/@types/address";
import { GetAllCustomerAddresses } from "@/services/addresses.service";

export interface FilterState {
    studentName?: string;
    professorName?: string;
    date?: string;
}

interface TrainingsListProps {
    trainings: Training[] | undefined;
}

export function TrainingsList({ trainings }: TrainingsListProps) {
    const [ showFilters, setShowFilters ] = useState(true);
    const [ filters, setFilters ] = useState<FilterState>({
        studentName: undefined,
        professorName: undefined,
        date: undefined,
    });

    const studentsData = useQuery<ApiResponse<Student[]>, Error>({
        queryKey: [ "get-all-students" ],
        queryFn: GetAllStudents,
        staleTime: 1000 * 60,
    });
    const allStudents = studentsData.data?.data;


    const professorsData = useQuery<ApiResponse<Professor[]>, Error>({
        queryKey: [ "get-all-professors" ],
        queryFn: GetAllProfessors,
        staleTime: 1000 * 60, // 1 minuto de cache
    });

    const allProfessors = professorsData.data?.data;

    // Aplicar filtros aos treinamentos
    const filteredTrainings = useMemo(() => {
        if (!trainings) return [];

        return trainings.filter((training) => {
            // Filtro por nome do aluno
            if (filters.studentName && filters.studentName.trim() !== "") {
                const studentMatch = training.Student.name
                    .toLowerCase()
                    .includes(filters.studentName.toLowerCase());
                if (!studentMatch) return false;
            }

            // Filtro por nome do professor
            if (filters.professorName && filters.professorName.trim() !== "") {
                const professorMatch = training.Professor.name
                    .toLowerCase()
                    .includes(filters.professorName.toLowerCase());
                if (!professorMatch) return false;
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
            (filters.studentName && filters.studentName.trim() !== "") ||
            (filters.professorName && filters.professorName.trim() !== "") ||
            (filters.date && filters.date.trim() !== "")
        );
    }, [ filters ]);

    const handleClearFilters = () => {
        setFilters({
            studentName: undefined,
            professorName: undefined,
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
                                    <Label htmlFor="studentName">Nome do Aluno</Label>
                                    <SelectStudent
                                        students={ allStudents }
                                        selectedStudent={ filters.studentName }
                                        onStudentChange={ (studentName) => {
                                            setFilters(prev => ({
                                                ...prev,
                                                studentName
                                            }));
                                        } }
                                    />
                                </div>

                                {/* Filtro por Professor */}
                                <div className="space-y-2">
                                    <Label htmlFor="professorName">Nome do Professor</Label>
                                    <SelectProfessor
                                        professors={ allProfessors }
                                        selectedProfessor={ filters.professorName }
                                        onProfessorChange={ (professorName) => {
                                            setFilters(prev => ({
                                                ...prev,
                                                professorName
                                            }));
                                        } } />
                                </div>

                                {/* Filtro por Data Inicial */}
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Data Inicial</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={ filters.date || "" }
                                        onChange={ (e) =>
                                            setFilters(prev => ({
                                                ...prev,
                                                startDate: e.target.value
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
                        <Card key={ training.trainingId }>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold text-lg">
                                                {training.Gear.gearName}
                                            </h3>
                                            <Badge className="bg-blue-100 text-blue-800">
                                                Agendado
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                                <span>{training.Professor.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <span>{training.Student.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span>
                                                    {new Date(
                                                        training.dueDate
                                                    ).toLocaleDateString("pt-BR")}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span>
                                                    {String(training.hour).padStart(2, "0")}:
                                                    {String(training.minute).padStart(2, "0")}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                <span>
                                                    {training.Address.street.streetName},{" "}
                                                    {training.Address.neighborhood.neighborhoodName}
                                                    , {training.Address.addressComplement} -{" "}
                                                    {training.Address.city.cityName}/
                                                    {training.Address.state.UF}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}