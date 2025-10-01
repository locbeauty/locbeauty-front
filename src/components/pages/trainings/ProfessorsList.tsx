"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
    GraduationCap, User, Phone
} from "lucide-react";
import { Professor } from "@/utils/@types/professor";

interface ProfessorsListProps {
    professors: Professor[] | undefined
}

export function ProfessorsList({ professors }: ProfessorsListProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {professors?.map((professor) => (
                <Card key={ professor.professorId }>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <GraduationCap className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold">{professor.name}</h3>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>{professor.documentNumber}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{professor.cellphone}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}