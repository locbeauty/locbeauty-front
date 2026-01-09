"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GetAllTrainees } from "@/services/trainees.service";
import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/lib/api";
import { Trainee } from "@/utils/@types/trainee";
import { GetAllVolunteers } from "@/services/volunteers.service";
import { Volunteer } from "@/utils/@types/volunteer";
import { CreateTrainingDialog } from "@/components/pages/trainings/CreateTrainingDialog";
import { Training } from "@/utils/@types/training";
import { GetAllTrainings } from "@/services/trainings.service";
import { CreateTraineeDialog } from "@/components/pages/trainings/CreateTraineeDialog";
import { TrainingsTable } from "@/components/pages/trainings/TrainingsTable";
import { TraineesTable } from "@/components/pages/trainings/TraineesTable";
import { VolunteersTable } from "@/components/pages/trainings/VolunteersTable";
import { SummarySection } from "@/components/pages/trainings/SummarySection";
import { GetAllGears } from "@/services/gears.service";
import { Gear } from "@/utils/@types/gears";
import { CreateVolunteerDialog } from "@/components/pages/trainings/CreateVolunteerDialog";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Can } from "@/components/auth/Can";
import { SYSTEM_MODULES } from "@/utils/@types/access";

export default function Treinamentos() {
    const [ activeTab, setActiveTab ] = useState("treinamentos");
    const [ dialogNewVolunteer, setDialogNewVolunteer ] = useState(false);
    const [ dialogNovoAluno, setDialogNovoAluno ] = useState(false);
    const [ dialogNovoTreinamento, setDialogNovoTreinamento ] = useState(false);

    const traineesData = useQuery<ApiResponse<Trainee[]>, Error>({
        queryKey: [ "get-all-trainees" ],
        queryFn: GetAllTrainees,
        staleTime: 1000 * 60, // 1 minuto de cache
    });

    const volunteersData = useQuery<ApiResponse<Volunteer[]>, Error>({
        queryKey: [ "get-all-volunteers" ],
        queryFn: GetAllVolunteers,
        staleTime: 1000 * 60, // 1 minuto de cache
    });

    const trainingsData = useQuery<ApiResponse<Training[]>, Error>({
        queryKey: [ "get-all-trainings" ],
        queryFn: GetAllTrainings,
        staleTime: 1000 * 60, // 1 minuto de cache
    });

    const gearsData = useQuery<ApiResponse<Gear[]>, Error>({
        queryKey: [ "get-all-gears" ],
        queryFn: () => GetAllGears({}),
        staleTime: 1000 * 60, // 1 minuto de cache
    });

    const volunteers = volunteersData.data?.data;
    const trainees = traineesData.data?.data;
    const trainings = trainingsData.data?.data;
    const gears = gearsData.data?.data;

    return (
        <RouteGuard module={ SYSTEM_MODULES.TRAININGS }>
            <div className="container mx-auto py-2">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Treinamentos</h1>
                    <p className="text-gray-600">
            Gerencie treinamentos, alunos e pacientes modelos
                    </p>
                </div>

                {/* Estatísticas */}
                <SummarySection
                    volunteers={ volunteers }
                    trainees={ trainees }
                    trainings={ trainings }
                />

                {/* Tabs */}
                <Tabs value={ activeTab } onValueChange={ setActiveTab }>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="treinamentos">Treinamentos</TabsTrigger>
                        <TabsTrigger value="alunos">Alunos</TabsTrigger>
                        <TabsTrigger value="Volunteeres">Pacientes modelo</TabsTrigger>
                    </TabsList>

                    {/* Tab Treinamentos */}
                    <TabsContent value="treinamentos" className="space-y-4 ml-2 mt-10">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Sessões de Treinamento</h2>
                            <Can module={ SYSTEM_MODULES.TRAININGS } action="canCreate">
                                <CreateTrainingDialog
                                    dialogNovoTreinamento={ dialogNovoTreinamento }
                                    setDialogNovoTreinamento={ setDialogNovoTreinamento }
                                    volunteers={ volunteers }
                                    trainees={ trainees }
                                    gears={ gears }
                                />
                            </Can>
                        </div>

                        <TrainingsTable trainings={ trainings } />
                    </TabsContent>

                    {/* Tab Alunos */}
                    <TabsContent value="alunos" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Alunos</h2>
                            <Can module={ SYSTEM_MODULES.TRAININGS } action="canCreate">
                                <CreateTraineeDialog
                                    dialogNovoAluno={ dialogNovoAluno }
                                    setDialogNovoAluno={ setDialogNovoAluno }
                                />
                            </Can>
                        </div>

                        <TraineesTable trainees={ trainees } allTrainings={ trainings || [] } />
                    </TabsContent>

                    {/* Tab Volunteeres */}
                    <TabsContent value="Volunteeres" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Pacientes modelo</h2>
                            <Can module={ SYSTEM_MODULES.TRAININGS } action="canCreate">
                                <CreateVolunteerDialog
                                    dialogNewVolunteer={ dialogNewVolunteer }
                                    setDialogNewVolunteer={ setDialogNewVolunteer }
                                />
                            </Can>
                        </div>

                        <VolunteersTable
                            volunteers={ volunteers }
                            allTrainings={ trainings || [] }
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </RouteGuard>
    );
}
