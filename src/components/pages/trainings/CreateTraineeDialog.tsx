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
import { Plus } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { queryClient } from "@/app/(main)/layout";
import DocumentInput from "@/components/shared/DocumentInput";
import PhoneInput from "@/components/shared/PhoneInput";
import {
    CreateTraineeFormDataType,
    CreateTraineeSchema,
} from "@/lib/zod/CreateTraineeValidation";
import { CreateTrainee } from "@/services/trainees.service";
import { TraineeAddressForm } from "./TraineeAddressForm";

interface CreateTraineeDialogProps {
  dialogNovoAluno: boolean;
  setDialogNovoAluno: (openStatus: boolean) => void;
}

export function CreateTraineeDialog({
    dialogNovoAluno,
    setDialogNovoAluno,
}: CreateTraineeDialogProps) {
    const traineeForm = useForm<CreateTraineeFormDataType>({
        resolver: zodResolver(CreateTraineeSchema),
    });

    const onSubmitTrainee = async (data: CreateTraineeFormDataType) => {
        const response = await CreateTrainee(data);

        if (response.statusCode !== 201) {
            toast.warning(response.message, { style: { fontSize: "1rem" } });
            window.scroll({ top: 0 });
        } else {
            queryClient.invalidateQueries({ queryKey: [ "get-all-trainees" ] });

            toast.success(response.message, { style: { fontSize: "1rem" } });
            window.scroll({ top: 0 });
            traineeForm.reset();
            setDialogNovoAluno(false);
        }
    };

    return (
        <Dialog open={ dialogNovoAluno } onOpenChange={ setDialogNovoAluno }>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
          Novo Aluno
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[90%] h-[80%] overflow-scroll">
                <form onSubmit={ traineeForm.handleSubmit(onSubmitTrainee) }>
                    <DialogHeader>
                        <DialogTitle>Cadastrar Novo Aluno</DialogTitle>
                        <DialogDescription>
              Preencha as informações do aluno
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="traineeName">Nome Completo *</Label>
                            <Input
                                id="traineeName"
                                { ...traineeForm.register("name") }
                                placeholder="Ex: João Pereira"
                            />
                            {traineeForm.formState.errors.name && (
                                <p className="text-sm text-red-600">
                                    {traineeForm.formState.errors.name.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="traineeDocument">CPF *</Label>
                            <DocumentInput
                                isCPF={ true }
                                placeholder="Digite o CPF"
                                register={ traineeForm.register("documentNumber") }
                            />

                            {traineeForm.formState.errors.documentNumber && (
                                <p className="text-sm text-red-600">
                                    {traineeForm.formState.errors.documentNumber.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="traineeEmail">Email *</Label>
                            <Input
                                id="traineeEmail"
                                type="email"
                                { ...traineeForm.register("email") }
                                placeholder="aluno@empresa.com"
                            />
                            {traineeForm.formState.errors.email && (
                                <p className="text-sm text-red-600">
                                    {traineeForm.formState.errors.email.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="traineeCellphone">Telefone *</Label>
                            <PhoneInput register={ traineeForm.register("cellphone") } />
                            {traineeForm.formState.errors.cellphone && (
                                <p className="text-sm text-red-600">
                                    {traineeForm.formState.errors.cellphone.message}
                                </p>
                            )}
                        </div>
                        <FormProvider { ...traineeForm }>
                            <TraineeAddressForm />
                        </FormProvider>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={ () => setDialogNovoAluno(false) }
                        >
              Cancelar
                        </Button>
                        <Button type="submit">Cadastrar Aluno</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
