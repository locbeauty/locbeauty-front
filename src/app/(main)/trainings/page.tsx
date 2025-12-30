"use client";

import { useEffect, useState } from "react";
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
import { TrainingsList } from "@/components/pages/trainings/TrainingsList";
import { TraineesList } from "@/components/pages/trainings/TraineeList";
import { VolunteersList } from "@/components/pages/trainings/VolunteersList";
import { SummarySection } from "@/components/pages/trainings/SummarySection";
import { GetAllGears } from "@/services/gears.service";
import { Gear } from "@/utils/@types/gears";
import { CreateVolunteerDialog } from "@/components/pages/trainings/CreateVolunteerDialog";
import { TraineeDetailsDialog } from "@/components/pages/trainings/TraineeDetailsDialog";

export default function Treinamentos() {
    const [ activeTab, setActiveTab ] = useState("treinamentos");
    const [ dialogNewVolunteer, setDialogNewVolunteer ] =
    useState(false);
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

    const [ selectedTrainee, setSelectedTrainee ] = useState<Trainee | null>(null);
    const [ isDialogOpen, setIsDialogOpen ] = useState(false);

    // Função passada para a lista apenas selecionar
    const handleSelectTrainee = (trainee: Trainee) => {
        setSelectedTrainee(trainee);
        setIsDialogOpen(true);
    };

    return (
        <div className="container mx-auto py-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
          Sistema de Treinamentos
                </h1>
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
                        <CreateTrainingDialog
                            dialogNovoTreinamento={ dialogNovoTreinamento }
                            setDialogNovoTreinamento={ setDialogNovoTreinamento }
                            volunteers={ volunteers }
                            trainees={ trainees }
                            gears={ gears }
                        />
                    </div>

                    <TrainingsList trainings={ trainings } />
                </TabsContent>

                {/* Tab Alunos */}
                <TabsContent value="alunos" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Alunos</h2>
                        <CreateTraineeDialog
                            dialogNovoAluno={ dialogNovoAluno }
                            setDialogNovoAluno={ setDialogNovoAluno }
                        />
                    </div>

                    <TraineesList
                        trainees={ trainees }
                        onViewDetails={ handleSelectTrainee }
                    />
                </TabsContent>

                {/* Tab Volunteeres */}
                <TabsContent value="Volunteeres" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Pacientes modelo</h2>
                        <CreateVolunteerDialog
                            dialogNewVolunteer={ dialogNewVolunteer }
                            setDialogNewVolunteer={ setDialogNewVolunteer }
                        />
                    </div>

                    <VolunteersList volunteers={ volunteers } />
                </TabsContent>
            </Tabs>
            <TraineeDetailsDialog
                isOpen={ isDialogOpen }
                setIsOpen={ setIsDialogOpen }
                trainee={ selectedTrainee }
            />
        </div>
    );
}
