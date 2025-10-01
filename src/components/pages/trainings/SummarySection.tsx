import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Professor } from "@/utils/@types/professor";
import { Student } from "@/utils/@types/student";
import { Training } from "@/utils/@types/training";
import { GraduationCap, Users, Calendar, BookOpen } from "lucide-react";

interface SummarySectionProps {
    professors: Professor[] | undefined
    students: Student[] | undefined
    trainings: Training[] | undefined
}

export function SummarySection({ professors, students, trainings }: SummarySectionProps) {

    const calcularEstatisticas = () => {
        return {
            totalTreinamentos: trainings?.length,
            agendados: trainings?.length,
            totalProfessores: professors?.length,
            totalAlunos: students?.length,
        };
    };

    const estatisticas = calcularEstatisticas();

    return (
        <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
              Total Treinamentos
                    </CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {estatisticas.totalTreinamentos}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Agendados</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                        {estatisticas.agendados}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Professores</CardTitle>
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {estatisticas.totalProfessores}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Alunos</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{estatisticas.totalAlunos}</div>
                </CardContent>
            </Card>
        </div>
    );
}