"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
    User,
    Mail,
    Phone
} from "lucide-react";
import { Student } from "@/utils/@types/student";

interface StudentsListProps {
    students: Student[] | undefined
}

export function StudentsList({ students }: StudentsListProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {students?.map((student) => (
                <Card key={ student.studentId }>
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <User className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">{student.name}</h3>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Mail className="h-3 w-3" />
                                            {student.email}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Phone className="h-3 w-3" />
                                            {student.cellphone}
                                        </div>
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