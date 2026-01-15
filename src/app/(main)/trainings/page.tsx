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
    queryFn: () => GetAllTrainees(),
    staleTime: 1000 * 60,
  });

  const volunteersData = useQuery<ApiResponse<Volunteer[]>, Error>({
    queryKey: [ "get-all-volunteers" ],
    queryFn: () => GetAllVolunteers(),
    staleTime: 1000 * 60,
  });

  const trainingsData = useQuery<ApiResponse<Training[]>, Error>({
    queryKey: [ "get-all-trainings" ],
    queryFn: () => GetAllTrainings(),
    staleTime: 1000 * 60,
  });

  const gearsData = useQuery<ApiResponse<Gear[]>, Error>({
    queryKey: [ "get-all-gears" ],
    queryFn: () => GetAllGears({}),
    staleTime: 1000 * 60,
  });

  const volunteers = volunteersData.data?.data;
  const trainees = traineesData.data?.data;
  const trainings = trainingsData.data?.data;
  const gears = gearsData.data?.data;

  // Filter Logic removed from here, to be handled in child components or similar if desired.
  // Actually, for cleaner Props drilling, we might want to keep the data passing simple.
  // User asked to remove the Summary section and 'just leave the tabs'.

  return (
    <RouteGuard module={ SYSTEM_MODULES.TRAININGS }>
      <div className="container mx-auto py-4 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Treinamentos
            </h1>
            <p className="text-muted-foreground">
              Gerencie treinamentos, alunos e pacientes modelos
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={ activeTab }
          onValueChange={ setActiveTab }
          className="space-y-4"
        >
          <div className="flex justify-between items-center">
            <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
              <TabsTrigger value="treinamentos">Treinamentos</TabsTrigger>
              <TabsTrigger value="alunos">Alunos</TabsTrigger>
              <TabsTrigger value="Volunteeres">Pacientes modelo</TabsTrigger>
            </TabsList>
            {activeTab === "treinamentos" && (
              <Can module={ SYSTEM_MODULES.TRAININGS } action="canCreate">
                <CreateTrainingDialog
                  dialogNovoTreinamento={ dialogNovoTreinamento }
                  setDialogNovoTreinamento={ setDialogNovoTreinamento }
                  gears={ gears }
                />
              </Can>
            )}
            {activeTab === "alunos" && (
              <Can module={ SYSTEM_MODULES.TRAININGS } action="canCreate">
                <CreateTraineeDialog
                  dialogNovoAluno={ dialogNovoAluno }
                  setDialogNovoAluno={ setDialogNovoAluno }
                />
              </Can>
            )}
            {activeTab === "Volunteeres" && (
              <Can module={ SYSTEM_MODULES.TRAININGS } action="canCreate">
                <CreateVolunteerDialog
                  dialogNewVolunteer={ dialogNewVolunteer }
                  setDialogNewVolunteer={ setDialogNewVolunteer }
                />
              </Can>
            )}
          </div>
          {/* Tab Treinamentos */}
          <TabsContent value="treinamentos" className="space-y-4">
            <TrainingsTable trainings={ trainings } />
          </TabsContent>

          {/* Tab Alunos */}
          <TabsContent value="alunos" className="space-y-4">
            <TraineesTable trainees={ trainees } allTrainings={ trainings || [] } />
          </TabsContent>

          {/* Tab Volunteeres */}
          <TabsContent value="Volunteeres" className="space-y-4">
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
