"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    GraduationCap, Calendar,
    Clock,
    MapPin, User
} from "lucide-react";
import { Training } from "@/utils/@types/training";

interface TrainingsListProps {
    trainings: Training[] | undefined
}

export function TrainingsList({ trainings }: TrainingsListProps) {
    return (
        <div className="grid gap-4">
            {trainings?.map((training) => (
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
                                        <span>
                                            {
                                                training.Professor.name
                                            }
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span>
                                            {
                                                training.Student.name
                                            }
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span>
                                            {new Date(training.dueDate).toLocaleDateString(
                                                "pt-BR"
                                            )}
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
                                            { training.Address.street.streetName }, { training.Address.neighborhood.neighborhoodName }, {training.Address.addressComplement} - { training.Address.city.cityName }/{ training.Address.state.UF }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}