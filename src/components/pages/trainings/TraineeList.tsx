"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Mail,
    Phone,
    GraduationCap,
    MoreHorizontal,
    Eye
} from "lucide-react";
import { Trainee } from "@/utils/@types/trainee";

interface TraineesList {
  trainees: Trainee[] | undefined;
  onViewDetails: (trainee: Trainee) => void;
}

export function TraineesList({ trainees, onViewDetails }: TraineesList) {

    return (
        <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {trainees?.map((trainee) => (
                    <Card
                        key={ trainee.traineeId }
                        className="overflow-hidden group hover:shadow-md transition-shadow"
                    >
                        <CardContent className="p-4 sm:p-6 relative">
                            <div className="absolute top-4 right-4">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Abrir menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                        <DropdownMenuItem
                                            onSelect={ () => {
                                                setTimeout(() => {
                                                    onViewDetails(trainee);
                                                }, 100);
                                            } }
                                            className="cursor-pointer"
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                      Visualizar detalhes
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="flex items-start justify-between pr-8">
                                <div className="flex items-center gap-4 w-full">
                                    <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                                        <GraduationCap className="h-6 w-6 text-primary" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3
                                            className="font-semibold truncate pr-2"
                                            title={ trainee.name }
                                        >
                                            {trainee.name}
                                        </h3>

                                        <div className="flex flex-col gap-2 mt-2 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1 min-w-0">
                                                <Mail className="h-3 w-3 flex-shrink-0" />
                                                <span className="truncate" title={ trainee.email }>
                                                    {trainee.email}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <Phone className="h-3 w-3" />
                                                <span className="whitespace-nowrap">
                                                    {trainee.cellphone}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );
}
