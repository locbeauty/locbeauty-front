"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area"; // Opcional, mas bom para listas longas
import {
    User,
    Mail,
    Phone,
    MapPin,
    FileText,
    Hash,
    Home
} from "lucide-react";
import { Student } from "@/utils/@types/student";
import { Dispatch, SetStateAction } from "react";
import { Badge } from "@/components/ui/badge"; // Se você tiver o componente Badge, fica legal

interface StudentDetailsDialogProps {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    student: Student | null;
}

export function StudentDetailsDialog({
    isOpen,
    setIsOpen,
    student
}: StudentDetailsDialogProps) {
    if (!student) return null;

    return (
        <Dialog open={ isOpen } onOpenChange={ setIsOpen }>
            <DialogContent className="max-h-[90vh] w-[90vw] md:w-[600px] overflow-hidden flex flex-col">
                <DialogHeader className="px-1">
                    <DialogTitle className="text-xl">Detalhes do Aluno</DialogTitle>
                    <DialogDescription>
                        Informações completas do cadastro
                    </DialogDescription>
                </DialogHeader>

                {/* Área rolável para o conteúdo */}
                <div className="flex-1 overflow-y-auto pr-2 -mr-2 py-4">
                    <div className="space-y-6">

                        {/* Cabeçalho com Nome Principal */}
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-full bg-primary/10">
                                <User className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">{student.name}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Estudante Ativo</span>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Dados Pessoais */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <FileText className="h-3 w-3" /> Dados Pessoais
                            </h4>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-medium text-muted-foreground">CPF:</span>
                                    <span>{student.documentNumber || "Não informado"}</span>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Contato */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Phone className="h-3 w-3" /> Contato
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg border">
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-primary/70 shrink-0" />
                                    <span className="truncate" title={ student.email }>{student.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-primary/70 shrink-0" />
                                    <span>{student.cellphone}</span>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Lista de Endereços */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <MapPin className="h-3 w-3" /> Endereços Cadastrados
                                </h4>
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                    {student.Addresses?.length || 0}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {student.Addresses && student.Addresses.length > 0 ? (
                                    student.Addresses.map((addr, index) => (
                                        <div
                                            key={ index } // Idealmente use addr.id se existir
                                            className="relative flex flex-col gap-1 p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
                                        >
                                            <div className="absolute top-3 right-3">
                                                <Home className="h-4 w-4 text-muted-foreground/30" />
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="mt-1">
                                                    <div className="flex h-2 w-2 rounded-full bg-primary" />
                                                </div>
                                                <div className="text-sm">
                                                    <p className="font-medium leading-none mb-1">
                                                        {addr.street.streetName}, {addr.buildingNumber}
                                                    </p>

                                                    {addr.addressComplement && (
                                                        <p className="text-muted-foreground text-xs mb-1">
                                                            Comp: {addr.addressComplement}
                                                        </p>
                                                    )}

                                                    <p className="text-muted-foreground">
                                                        {addr.neighborhood.neighborhoodName}
                                                    </p>
                                                    <p className="text-muted-foreground">
                                                        {addr.city.cityName} - {addr.state.stateName}
                                                    </p>

                                                    {addr.zipCode && (
                                                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground bg-muted/50 w-fit px-2 py-1 rounded">
                                                            <Hash className="h-3 w-3" />
                                                            {addr.zipCode}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-6 text-center border-2 border-dashed rounded-lg">
                                        <MapPin className="h-8 w-8 text-muted-foreground/30 mb-2" />
                                        <p className="text-sm text-muted-foreground">Nenhum endereço vinculado.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}