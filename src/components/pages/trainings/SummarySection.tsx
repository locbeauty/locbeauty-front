import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Volunteer } from "@/utils/@types/volunteer";
import { Trainee } from "@/utils/@types/trainee";
import { Training } from "@/utils/@types/training";
import {
    GraduationCap,
    Users,
    Calendar,
    BookOpen,
    Loader2,
} from "lucide-react";

interface SummarySectionProps {
  volunteers: Volunteer[] | undefined;
  trainees: Trainee[] | undefined;
  trainings: Training[] | undefined;
}

export function SummarySection({
    volunteers,
    trainees,
    trainings,
}: SummarySectionProps) {
    const calcularEstatisticas = () => {
        return {
            totalTreinamentos: trainings?.length,
            agendados: trainings?.length,
            volunteers: volunteers?.length,
            totalAlunos: trainees?.length,
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
                    {estatisticas.totalTreinamentos !== undefined ? (
                        <div className="text-2xl font-bold">
                            {estatisticas.totalTreinamentos}
                        </div>
                    ) : (
                        <div className="text-2xl font-bold">
                            <Loader2 className="animate-spin" />
                        </div>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Agendados</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {estatisticas.agendados !== undefined ? (
                        <div className="text-2xl font-bold">{estatisticas.agendados}</div>
                    ) : (
                        <div className="text-2xl font-bold">
                            <Loader2 className="animate-spin" />
                        </div>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Alunos</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {estatisticas.totalAlunos !== undefined ? (
                        <div className="text-2xl font-bold">{estatisticas.totalAlunos}</div>
                    ) : (
                        <div className="text-2xl font-bold">
                            <Loader2 className="animate-spin" />
                        </div>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
            Pacientes modelos
                    </CardTitle>
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {estatisticas.volunteers !== undefined ? (
                        <div className="text-2xl font-bold">{estatisticas.volunteers}</div>
                    ) : (
                        <div className="text-2xl font-bold">
                            <Loader2 className="animate-spin" />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
