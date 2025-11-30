"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Loader2,
    Plus
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { queryClient } from "@/app/(main)/layout";
import { CreateProfessorFormDataType, CreateProfessorSchema } from "@/lib/zod/CreateProfessorValidation";
import { CreateProfessor } from "@/services/professors.service";
import DocumentInput from "@/components/shared/DocumentInput";
import PhoneInput from "@/components/shared/PhoneInput";

interface CreatePacienteModeloDialogProps {
    dialogNovoPacienteModelo: boolean,
    setDialogNovoPacienteModelo: (openStatus: boolean) => void
}

export function CreatePacienteModeloDialog({ dialogNovoPacienteModelo, setDialogNovoPacienteModelo }: CreatePacienteModeloDialogProps) {

    const professorForm = useForm<CreateProfessorFormDataType>({
        resolver: zodResolver(CreateProfessorSchema),
    });

    const { reset, formState: { errors, isSubmitting } } = professorForm;

    const onSubmitProfessor = async (data: CreateProfessorFormDataType) => {
        const response = await CreateProfessor(data);

        if (response.statusCode !== 201) {
            toast.warning(response.message, { style: { fontSize: "1rem" } });
            window.scroll({ top: 0 });
        } else {
            queryClient.invalidateQueries({ queryKey: [ "get-all-professors" ] });

            toast.success(response.message, { style: { fontSize: "1rem" } });
            window.scroll({ top: 0 });
            reset();
            setDialogNovoPacienteModelo(false);
        }
    };

    return (

        <Dialog
            open={ dialogNovoPacienteModelo }
            onOpenChange={ setDialogNovoPacienteModelo }
        >
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                  Novo paciente modelo
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[80%]">
                <form onSubmit={ professorForm.handleSubmit(onSubmitProfessor) }>
                    <DialogHeader>
                        <DialogTitle>Cadastrar Novo paciente modelo</DialogTitle>
                        <DialogDescription>
                      Preencha as informações do paciente modelo
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome Completo *</Label>
                            <Input
                                id="name"
                                { ...professorForm.register("name") }
                                placeholder="Ex: Dr. Carlos Silva"
                            />
                            {professorForm.formState.errors.name && (
                                <p className="text-sm text-red-600">
                                    {professorForm.formState.errors.name.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="documentNumber">CPF *</Label>
                            <DocumentInput
                                isCPF={ true }
                                placeholder="Digite o CPF"
                                register={ professorForm.register("documentNumber") }
                            />
                            {professorForm.formState.errors.documentNumber && (
                                <p className="text-sm text-red-600">
                                    {
                                        professorForm.formState.errors.documentNumber
                                            .message
                                    }
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cellphone">Telefone *</Label>
                            <PhoneInput
                                register={ professorForm.register("cellphone") }
                            />

                            {professorForm.formState.errors.cellphone && (
                                <p className="text-sm text-red-600">
                                    {professorForm.formState.errors.cellphone.message}
                                </p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={ () => setDialogNovoPacienteModelo(false) }
                        >
                      Cancelar
                        </Button>
                        <Button disabled={ isSubmitting } className="cursor-pointer" type="submit">
                            {
                                isSubmitting ? <Loader2 className="animate-spin" /> : "Cadastrar paciente modelo"
                            }
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}