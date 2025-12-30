import { useState } from "react";
import {
    MoreHorizontal,
    Eye,
    Calendar,
    Clock,
    MapPin,
    GraduationCap,
    User
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TrainingDetailsDialog } from "./TrainingDetailsDialog";
import { Training } from "@/utils/@types/training";

// Assumindo que você tem essa tipagem baseada no seu código anterior
interface TrainingCardProps {
  training: Training; // Substitua pelo seu tipo 'Training' correto (Prisma/Zod)
}

export function TrainingCard({ training }: TrainingCardProps) {
    const [ isDetailsOpen, setIsDetailsOpen ] = useState(false);

    return (
        <>
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-lg">
                                        {training.Gear.gearName}
                                    </h3>
                                    {/* Badge dinâmica baseada no status (exemplo) */}
                                    <Badge
                                        // variant="secondary"
                                        className={ training.trainingStatus === "Concluido" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-blue-100 text-blue-800 hover:bg-blue-100" }
                                    >
                                        {training.trainingStatus || "Agendado"}
                                    </Badge>
                                </div>

                                {/* --- MENU DROPDOWN (Reticências) --- */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Abrir menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={ () => {
                                                setTimeout(() => {
                                                    setIsDetailsOpen(true);
                                                }, 100);
                                            } }
                                            className="cursor-pointer"
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                      Ver Detalhes
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                    <span>{training.Volunteer.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span>{training.Trainee.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>
                                        {new Date(training.dueDate).toLocaleDateString("pt-BR")}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>
                                        {String(Math.floor(training.hourInMinutes / 60)).padStart(2, "0")}:
                                        {String(training.hourInMinutes % 60).padStart(2, "0")}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 md:col-span-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="truncate">
                                        {training.Address.Street.streetName}, {training.Address.Neighborhood.neighborhoodName}
                    , {training.Address.addressComplement} - {training.Address.City.cityName}/{training.Address.State.UF}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* --- DIALOG DE DETALHES --- */}
            <TrainingDetailsDialog
                open={ isDetailsOpen }
                onOpenChange={ setIsDetailsOpen }
                selectedTraining={ training }
            />
        </>
    );
}