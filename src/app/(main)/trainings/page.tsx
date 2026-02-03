"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState, useMemo } from "react";
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
import { findAllFilials } from "@/services/filials.service";
import { Filial } from "@/utils/@types/filials";
import { USER_ROLES } from "@/utils/constants";
import { useAuth } from "@/contexts/auth-provider";
import { useAccess } from "@/contexts/access-provider";

export default function Treinamentos() {
  const [ activeTab, setActiveTab ] = useState("treinamentos");
  const [ dialogNewVolunteer, setDialogNewVolunteer ] = useState(false);
  const [ dialogNovoAluno, setDialogNovoAluno ] = useState(false);
  const [ dialogNovoTreinamento, setDialogNovoTreinamento ] = useState(false);
  const [ isVisible, setIsVisible ] = useState(false);

  const traineesData = useQuery<ApiResponse<Trainee[]>, Error>({
    queryKey: [ "get-all-trainees", isVisible ],
    queryFn: () => GetAllTrainees(isVisible ? { isVisible: "false" } : {}),
    staleTime: 1000 * 60,
  });

  const volunteersData = useQuery<ApiResponse<Volunteer[]>, Error>({
    queryKey: [ "get-all-volunteers", isVisible ],
    queryFn: () => GetAllVolunteers(isVisible ? { isVisible: "false" } : {}),
    staleTime: 1000 * 60,
  });

  const trainingsData = useQuery<ApiResponse<Training[]>, Error>({
    queryKey: [ "get-all-trainings", isVisible ],
    queryFn: () => GetAllTrainings(isVisible ? "false" : undefined),
    staleTime: 1000 * 60,
  });

  const gearsData = useQuery<ApiResponse<Gear[]>, Error>({
    queryKey: [ "get-all-gears" ],
    queryFn: () => GetAllGears({}),
    staleTime: 1000 * 60,
  });

  const filialsData = useQuery<Filial[], Error>({
    queryKey: [ "get-all-filials" ],
    queryFn: () => findAllFilials(),
    staleTime: 1000 * 60,
  });

  const volunteers = volunteersData.data?.data;
  const trainees = traineesData.data?.data;
  const trainings = trainingsData.data?.data;
  const gears = gearsData.data?.data;
  const { user } = useAuth();
  const { accesses } = useAccess();

  const filials = filialsData.data;

  // Filtrar filiais baseado no acesso do usuário
  const accessibleFilials = useMemo(() => {
    if (!filials) return [];
    if (user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MASTER)
      return filials;

    const accessibleFilialIds = accesses
      .filter((a) => a.module === SYSTEM_MODULES.TRAININGS && a.canView)
      .map((a) => a.filialId);

    return filials.filter((f) => accessibleFilialIds.includes(f.filialId));
  }, [ filials, user, accesses ]);

  // Filtrar dados baseado nas filiais acessíveis
  const filteredData = useMemo(() => {
    const accessibleFilialIds = accessibleFilials.map((f) => f.filialId);

    // Se for ADMIN/MASTER, accessibleFilials já contém todas as filiais (ou a lógica acima retorna todas)
    // Mas para garantir, se user é ADMIN/MASTER, retornamos tudo sem filtro adicional
    if (user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MASTER) {
      return {
        trainings: trainings,
        trainees: trainees,
        volunteers: volunteers,
      };
    }

    // Filtrar Treinamentos
    const filteredTrainings = trainings?.filter((t) =>
      accessibleFilialIds.includes(t.sourceFilialId),
    );

    // Filtrar Alunos (aqueles que tem pelo menos um treinamento em uma filial acessível)
    // Precisamos cruzar com os treinamentos filtrados ou verificar todos os treinamentos do aluno?
    // Se o aluno fez um curso na filial A (acessível) e B (não acessível), devo ver o aluno? Sim.
    // Devo ver o curso da filial B? Não (já filtrado na lista de treinamentos).
    // Mas na lista de alunos, ele deve aparecer.

    // Set de IDs de alunos que tem treinamento nas filiais acessíveis
    // Filtrar Alunos
    const visibleTraineeIds = new Set<string>();
    trainings?.forEach((t) => {
      if (accessibleFilialIds.includes(t.sourceFilialId)) {
        if (t.traineeId) visibleTraineeIds.add(t.traineeId);
        t.Trainees?.forEach((trainee) =>
          visibleTraineeIds.add(trainee.customerId),
        );
      }
    });

    const filteredTrainees = trainees?.filter(
      (t) =>
        (t.sourceFilialId && accessibleFilialIds.includes(t.sourceFilialId)) ||
        visibleTraineeIds.has(t.customerId),
    );

    // Filtrar Voluntários
    const visibleVolunteerIds = new Set<string>();
    trainings?.forEach((t) => {
      if (accessibleFilialIds.includes(t.sourceFilialId)) {
        if (t.volunteerId) visibleVolunteerIds.add(t.volunteerId);
        t.Volunteers?.forEach((volunteer) =>
          visibleVolunteerIds.add(volunteer.volunteerId),
        );
      }
    });

    const filteredVolunteers = volunteers?.filter(
      (v) =>
        (v.sourceFilialId && accessibleFilialIds.includes(v.sourceFilialId)) ||
        visibleVolunteerIds.has(v.volunteerId),
    );

    return {
      trainings: filteredTrainings,
      trainees: filteredTrainees,
      volunteers: filteredVolunteers,
    };
  }, [ trainings, trainees, volunteers, accessibleFilials, user ]);

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
          {(user?.role === USER_ROLES.MASTER ||
            user?.role === USER_ROLES.ADMIN) && (
            <div className="flex items-center space-x-2">
              <Switch
                id="view-deleted-trainings"
                checked={ isVisible }
                onCheckedChange={ setIsVisible }
              />
              <Label htmlFor="view-deleted-trainings">Ver Excluídos</Label>
            </div>
          )}
        </div>

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
            <TrainingsTable
              trainings={ filteredData.trainings }
              filials={ accessibleFilials }
            />
          </TabsContent>

          {/* Tab Alunos */}
          <TabsContent value="alunos" className="space-y-4">
            <TraineesTable
              trainees={ filteredData.trainees }
              allTrainings={ filteredData.trainings || [] }
              filials={ accessibleFilials }
            />
          </TabsContent>

          {/* Tab Volunteeres */}
          <TabsContent value="Volunteeres" className="space-y-4">
            <VolunteersTable
              volunteers={ filteredData.volunteers }
              allTrainings={ filteredData.trainings || [] }
              filials={ accessibleFilials }
            />
          </TabsContent>
        </Tabs>
      </div>
    </RouteGuard>
  );
}
