"use client";

import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, User, Phone } from "lucide-react";
import { Volunteer } from "@/utils/@types/volunteer";

interface VolunteersListProps {
  volunteers: Volunteer[] | undefined;
}

export function VolunteersList({ volunteers }: VolunteersListProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {volunteers?.map((volunteer) => (
                <Card key={ volunteer.volunteerId }>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <User className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold">{volunteer.name}</h3>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>{volunteer.documentNumber}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{volunteer.cellphone}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
