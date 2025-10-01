"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GetAllStudents } from "@/services/students.service";
import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/lib/api";
import { Student } from "@/utils/@types/student";
import { GetAllProfessors } from "@/services/professors.service";
import { Professor } from "@/utils/@types/professor";
import { CreateTrainingDialog } from "@/components/pages/trainings/CreateTrainingDialog";
import { Training } from "@/utils/@types/training";
import { GetAllTrainings } from "@/services/trainings.service";
import { CreateProfessorDialog } from "@/components/pages/trainings/CreateProfessorDialog";
import { CreateStudentDialog } from "@/components/pages/trainings/CreateStudentDialog";
import { TrainingsList } from "@/components/pages/trainings/TrainingsList";
import { StudentsList } from "@/components/pages/trainings/StudentsList";
import { ProfessorsList } from "@/components/pages/trainings/ProfessorsList";
import { SummarySection } from "@/components/pages/trainings/SummarySection";

export default function Treinamentos() {
    const [ activeTab, setActiveTab ] = useState("treinamentos");
    const [ dialogNovoProfessor, setDialogNovoProfessor ] = useState(false);
    const [ dialogNovoAluno, setDialogNovoAluno ] = useState(false);
    const [ dialogNovoTreinamento, setDialogNovoTreinamento ] = useState(false);

    const studentsData = useQuery<ApiResponse<Student[]>, Error>({
        queryKey: [ "get-all-students" ],
        queryFn: GetAllStudents,
        staleTime: 1000 * 60, // 1 minuto de cache
    });

    const professorsData = useQuery<ApiResponse<Professor[]>, Error>({
        queryKey: [ "get-all-professors" ],
        queryFn: GetAllProfessors,
        staleTime: 1000 * 60, // 1 minuto de cache
    });

    const trainingsData = useQuery<ApiResponse<Training[]>, Error>({
        queryKey: [ "get-all-trainings" ],
        queryFn: GetAllTrainings,
        staleTime: 1000 * 60, // 1 minuto de cache
    });

    const professors = professorsData.data?.data;
    const students = studentsData.data?.data;
    const trainings = trainingsData.data?.data;

    return (
        <div className="container mx-auto py-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
          Sistema de Treinamentos
                </h1>
                <p className="text-gray-600">
          Gerencie treinamentos, professores e alunos
                </p>
            </div>

            {/* Estatísticas */}
            <SummarySection professors={ professors } students={ students } trainings={ trainings } />

            {/* Tabs */}
            <Tabs value={ activeTab } onValueChange={ setActiveTab }>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="treinamentos">Treinamentos</TabsTrigger>
                    <TabsTrigger value="professores">Professores</TabsTrigger>
                    <TabsTrigger value="alunos">Alunos</TabsTrigger>
                </TabsList>

                {/* Tab Treinamentos */}
                <TabsContent value="treinamentos" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Sessões de Treinamento</h2>
                        <CreateTrainingDialog
                            dialogNovoTreinamento={ dialogNovoTreinamento }
                            setDialogNovoTreinamento={ setDialogNovoTreinamento }
                            professors={ professors }
                            students={ students }
                        />
                    </div>

                    <TrainingsList trainings={ trainings } />
                </TabsContent>

                {/* Tab Professores */}
                <TabsContent value="professores" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Professores</h2>
                        <CreateProfessorDialog dialogNovoProfessor={ dialogNovoProfessor } setDialogNovoProfessor={ setDialogNovoProfessor } />
                    </div>

                    <ProfessorsList professors={ professors } />
                </TabsContent>

                {/* Tab Alunos */}
                <TabsContent value="alunos" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Alunos</h2>
                        <CreateStudentDialog dialogNovoAluno={ dialogNovoAluno } setDialogNovoAluno={ setDialogNovoAluno }  />
                    </div>

                    <StudentsList students={ students } />
                </TabsContent>
            </Tabs>
        </div>
    );
}
