"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Mail,
    Phone,
    GraduationCap,
    MoreHorizontal,
    Eye
} from "lucide-react";
import { Trainee } from "@/utils/@types/trainee";

interface TraineeCardProps {
    trainee: Trainee | undefined;
    onViewDetails: (trainee: Trainee) => void;
}

export function TraineeCard({ trainee, onViewDetails }: TraineeCardProps) {

    if (!trainee) return null;

    return (
        <Card
            key={ trainee.traineeId }
            className="overflow-hidden group hover:shadow-md transition-all relative flex flex-col"
        >
            <CardContent className="p-4 sm:p-6">

                {/* --- CABEÇALHO DO CARD --- */}
                <div className="relative">
                    {/* Menu de Ações */}
                    <div className="absolute top-0 right-0 z-10">
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
                                    onSelect={ () => setTimeout(() => onViewDetails(trainee), 100) }
                                    className="cursor-pointer"
                                >
                                    <Eye className="mr-2 h-4 w-4" />
                                    Visualizar detalhes
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="flex items-start gap-4 pr-8">
                        <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                            <GraduationCap className="h-6 w-6 text-primary" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate pr-2 text-lg" title={ trainee.name }>
                                {trainee.name}
                            </h3>
                            <div className="flex flex-col gap-1 mt-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span className="truncate" title={ trainee.email }>{trainee.email}</span>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <Phone className="h-3.5 w-3.5" />
                                    <span className="whitespace-nowrap">{trainee.cellphone}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}