"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Eye, Clock, Calendar } from "lucide-react";

import { Training } from "@/utils/@types/training";
import { Button } from "@/components/ui/button";
import { ResponsiveCard } from "@/components/shared/ResponsiveCard";
import { Badge } from "@/components/ui/badge";

import { TrainingDetailsDialog } from "./TrainingDetailsDialog"; // Assuming we have this or similar for viewing details

interface TrainingsTableProps {
  trainings: Training[] | undefined;
}

export function TrainingsTable({ trainings }: TrainingsTableProps) {
    const [ selectedTraining, setSelectedTraining ] = useState<Training | null>(
        null
    );
    const [ isDetailsOpen, setIsDetailsOpen ] = useState(false);

    const handleOpenDetails = (training: Training) => {
        setSelectedTraining(training);
        setIsDetailsOpen(true);
    };

    const sortedTrainings = useMemo(() => {
        if (!trainings) return [];
        return [ ...trainings ].sort(
            (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
        );
    }, [ trainings ]);

    // Helper to format duration
    const formatDuration = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    };

    const getStatusBadge = (status: string) => {
        let colorClass = "bg-gray-100 text-gray-800";
        if (status === "Pago" || status === "Confirmado")
            colorClass = "bg-green-100 text-green-800";
        if (status === "Pendente")
            colorClass = "bg-yellow-100 text-yellow-800 text-yellow-600";
        if (status === "Cancelado") colorClass = "bg-red-100 text-red-800";

        return (
            <Badge variant="outline" className={ colorClass }>
                {status}
            </Badge>
        );
    };

    const handleToggleDialog = (open: boolean, data: unknown) => {
        if (open && data) {
            handleOpenDetails(data as Training);
        } else {
            setIsDetailsOpen(open);
        }
    };

    return (
        <>
            <div className="border rounded-lg w-full overflow-x-auto hidden md:block">
                <table className="min-w-[800px] w-full">
                    <thead className="bg-muted">
                        <tr>
                            <th className="text-left p-3 font-medium">Data</th>
                            <th className="text-left p-3 font-medium">Equipamento</th>
                            <th className="text-left p-3 font-medium">Aluno</th>
                            <th className="text-left p-3 font-medium">Modelo</th>
                            <th className="text-center p-3 font-medium">Duração</th>
                            <th className="text-center p-3 font-medium">Status</th>
                            <th className="text-center p-3 font-medium">Detalhes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(!trainings || trainings.length === 0) && (
                            <tr>
                                <td className="text-center p-4" colSpan={ 7 }>
                  Nenhum treinamento encontrado.
                                </td>
                            </tr>
                        )}
                        {sortedTrainings.map((training) => (
                            <tr
                                key={ training.trainingId }
                                className="border-t hover:bg-muted/50"
                            >
                                <td className="p-3 text-sm">
                                    {format(new Date(training.dueDate), "dd/MM/yyyy HH:mm")}
                                </td>
                                <td className="p-3 text-sm font-medium">
                                    {training.Gear?.gearName || "N/A"}
                                </td>
                                <td className="p-3 text-sm">
                                    {training.Trainee?.name || "N/A"}
                                </td>
                                <td className="p-3 text-sm">
                                    {training.Volunteer?.name || "N/A"}
                                </td>
                                <td className="p-3 text-center text-sm">
                                    {formatDuration(training.hourInMinutes)}
                                </td>
                                <td className="p-3 text-center text-sm">
                                    {getStatusBadge(training.trainingStatus)}
                                </td>
                                <td className="p-3 flex justify-center items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={ () => handleOpenDetails(training) }
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
                {sortedTrainings.map((training) => (
                    <ResponsiveCard
                        key={ training.trainingId }
                        cardData={ {
                            id: training.trainingId,
                            title: training.Gear?.gearName || "Treinamento",
                            description: format(
                                new Date(training.dueDate),
                                "dd/MM/yyyy HH:mm"
                            ),
                            items: [
                                {
                                    itemLabel: "Aluno: ",
                                    itemInfo: training.Trainee?.name || "N/A",
                                },
                                {
                                    itemLabel: "Modelo: ",
                                    itemInfo: training.Volunteer?.name || "N/A",
                                },
                                { itemLabel: "Status: ", itemInfo: training.trainingStatus },
                            ],
                        } }
                        rawData={ training }
                        handleToggleDialog={ handleToggleDialog }
                    />
                ))}
                {(!trainings || trainings.length === 0) && (
                    <p className="text-center text-muted-foreground py-8">
            Nenhum treinamento encontrado.
                    </p>
                )}
            </div>

            {selectedTraining && (
                <TrainingDetailsDialog
                    open={ isDetailsOpen }
                    onOpenChange={ setIsDetailsOpen }
                    selectedTraining={ selectedTraining }
                    setSelectedTraining={ setSelectedTraining }
                />
            )}
        </>
    );
}
