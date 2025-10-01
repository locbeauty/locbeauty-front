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
    Plus
} from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { queryClient } from "@/app/(main)/layout";
import DocumentInput from "@/components/shared/DocumentInput";
import PhoneInput from "@/components/shared/PhoneInput";
import { CreateStudentFormDataType, CreateStudentSchema } from "@/lib/zod/CreateStudentValidation";
import { CreateStudent } from "@/services/students.service";
import { StudentAddressForm } from "./StudentAddressForm";

interface CreateStudentDialogProps {
    dialogNovoAluno: boolean,
    setDialogNovoAluno: (openStatus: boolean) => void
}

export function CreateStudentDialog({ dialogNovoAluno, setDialogNovoAluno }: CreateStudentDialogProps) {

    const studentForm = useForm<CreateStudentFormDataType>({
        resolver: zodResolver(CreateStudentSchema),
    });

    const onSubmitStudent = async (data: CreateStudentFormDataType) => {
        const response = await CreateStudent(data);

        if (response.statusCode !== 201) {
            toast.warning(response.message, { style: { fontSize: "1rem" } });
            window.scroll({ top: 0 });
        } else {
            queryClient.invalidateQueries({ queryKey: [ "get-all-students" ] });

            toast.success(response.message, { style: { fontSize: "1rem" } });
            window.scroll({ top: 0 });
            studentForm.reset();
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
                <form onSubmit={ studentForm.handleSubmit(onSubmitStudent) }>
                    <DialogHeader>
                        <DialogTitle>Cadastrar Novo Aluno</DialogTitle>
                        <DialogDescription>
                      Preencha as informações do aluno
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="studentName">Nome Completo *</Label>
                            <Input
                                id="studentName"
                                { ...studentForm.register("name") }
                                placeholder="Ex: João Pereira"
                            />
                            {studentForm.formState.errors.name && (
                                <p className="text-sm text-red-600">
                                    {studentForm.formState.errors.name.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="studentDocument">CPF *</Label>
                            <DocumentInput
                                isCPF={ true }
                                placeholder="Digite o CPF"
                                register={ studentForm.register("documentNumber") }
                            />

                            {studentForm.formState.errors.documentNumber && (
                                <p className="text-sm text-red-600">
                                    {studentForm.formState.errors.documentNumber.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="studentEmail">Email *</Label>
                            <Input
                                id="studentEmail"
                                type="email"
                                { ...studentForm.register("email") }
                                placeholder="aluno@empresa.com"
                            />
                            {studentForm.formState.errors.email && (
                                <p className="text-sm text-red-600">
                                    {studentForm.formState.errors.email.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="studentCellphone">Telefone *</Label>
                            <PhoneInput
                                register={ studentForm.register("cellphone") }
                            />
                            {studentForm.formState.errors.cellphone && (
                                <p className="text-sm text-red-600">
                                    {studentForm.formState.errors.cellphone.message}
                                </p>
                            )}
                        </div>
                        <FormProvider { ...studentForm }>
                            <StudentAddressForm />
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