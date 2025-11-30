"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    User,
    Mail,
    Phone,
    GraduationCap,
    MoreHorizontal,
    Eye
} from "lucide-react";
import { Student } from "@/utils/@types/student";
import { StudentDetailsDialog } from "./StudentDetailsDialog"; // Importe o componente criado acima

interface StudentsListProps {
    students: Student[] | undefined
    onViewDetails: (student: Student) => void

}

export function StudentsList({ students, onViewDetails }: StudentsListProps) {
    // const [ isDialogOpen, setIsDialogOpen ] = useState(false);
    // const [ selectedStudent, setSelectedStudent ] = useState<Student | null>(null);

    // const handleViewDetails = (student: Student) => {
    //     setSelectedStudent(student);
    //     setIsDialogOpen(true);
    // };

    return (
        <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {students?.map((student) => (
                    <Card key={ student.studentId } className="overflow-hidden group hover:shadow-md transition-shadow">
                        <CardContent className="p-4 sm:p-6 relative">

                            {/* Botão de Ações (Posicionado Absolutamente no Topo Direito) */}
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
                                        {/* <DropdownMenuItem
                                            onClick={ () => onViewDetails(student) }
                                            className="cursor-pointer"
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            Visualizar detalhes
                                        </DropdownMenuItem> */}
                                        <DropdownMenuItem
                                            onSelect={ () => {
                                            // NÃO use e.preventDefault() aqui. Deixe o menu fechar.

                                                // Use setTimeout para jogar a abertura do Dialog para o final da fila de eventos
                                                // Isso permite que o Dropdown feche e limpe os pointer-events antes do Dialog abrir
                                                setTimeout(() => {
                                                    onViewDetails(student);
                                                }, 100);
                                            } }
                                            className="cursor-pointer"
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                        Visualizar detalhes
                                        </DropdownMenuItem>
                                        {/* Você pode adicionar Editar ou Excluir aqui futuramente */}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="flex items-start justify-between pr-8">
                                {/* pr-8 adicionado para o texto não ficar por baixo do botão de menu */}

                                <div className="flex items-center gap-4 w-full">
                                    <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                                        <GraduationCap className="h-6 w-6 text-primary" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold truncate pr-2" title={ student.name }>
                                            {student.name}
                                        </h3>

                                        <div className="flex flex-col gap-2 mt-2 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1 min-w-0">
                                                <Mail className="h-3 w-3 flex-shrink-0" />
                                                <span className="truncate" title={ student.email }>
                                                    {student.email}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <Phone className="h-3 w-3" />
                                                <span className="whitespace-nowrap">
                                                    {student.cellphone}
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

            {/* Componente do Dialog Controlado */}
            {/* <StudentDetailsDialog
                isOpen={ isDialogOpen }
                setIsOpen={ setIsDialogOpen }
                student={ selectedStudent }
            /> */}
        </>
    );
}