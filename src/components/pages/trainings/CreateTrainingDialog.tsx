"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { Controller, FormProvider, useForm } from "react-hook-form";
import { SelectTrainingGear } from "@/components/pages/trainings/SelectTrainingGear";
import { CreateTrainingDataType, CreateTrainingSchema } from "@/lib/zod/CreateTrainingValidation";
import { Professor } from "@/utils/@types/professor";
import { Student } from "@/utils/@types/student";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { CreateTraining } from "@/services/trainings.service";
import { toast } from "sonner";
import { queryClient } from "@/app/(main)/layout";
import PriceInput from "@/components/shared/PriceInput";

interface CreateTrainingDialogProps {
    dialogNovoTreinamento: boolean,
    setDialogNovoTreinamento: (openStatus: boolean) => void
    professors: Professor[] | undefined,
    students: Student[] | undefined
}

export function CreateTrainingDialog({ dialogNovoTreinamento, setDialogNovoTreinamento, professors, students }: CreateTrainingDialogProps) {

    const createTrainingMethods = useForm<CreateTrainingDataType>({
        resolver: zodResolver(CreateTrainingSchema),
        defaultValues: {
            professorId: "",
            studentId: "",
            hour: undefined,
            minute: undefined,
            dueDate: undefined,
            addressId: "",
            price: "",
            gearId: ""
        }
    });

    const { handleSubmit, formState, watch, setValue, control, reset } = createTrainingMethods;

    const watchPrice = watch("price");

    const [ selectedStudent, setSelectedStudent ] = useState<Student | undefined>(undefined);
    const watchSelectedStudentId = watch("studentId");

    useEffect(() => {
        const student = students?.find((student) => student.studentId === watchSelectedStudentId);
        setSelectedStudent(student);
    }, [ watchSelectedStudentId, students ]);

    const onSubmitTraining = async (data: CreateTrainingDataType) => {
        const response = await CreateTraining(data);

        if (response.statusCode !== 201) {
            toast.warning(response.message, { style: { fontSize: "1rem" } });
            window.scroll({ top: 0 });
        } else {
            queryClient.invalidateQueries({ queryKey: [ "get-all-trainings" ] });

            toast.success(response.message, { style: { fontSize: "1rem" } });
            window.scroll({ top: 0 });
            reset();
            setDialogNovoTreinamento(false);
        }
    };

    return (

        <Dialog
            open={ dialogNovoTreinamento }
            onOpenChange={ setDialogNovoTreinamento }
        >
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                  Novo Treinamento
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl overflow-scroll">
                <form onSubmit={ handleSubmit(onSubmitTraining) }>
                    <DialogHeader>
                        <DialogTitle>
                        Criar Nova Sessão de Treinamento
                        </DialogTitle>
                        <DialogDescription>
                        Preencha as informações para criar uma nova sessão
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <FormProvider { ...createTrainingMethods }>
                                <SelectTrainingGear />
                            </FormProvider>
                            {formState.errors.gearId && (
                                <p className="text-sm text-red-600">
                                    {formState.errors.gearId.message}
                                </p>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="professorId">Professor *</Label>
                                <Controller
                                    control={ control }
                                    name="professorId"
                                    render={ ({ field }) => (
                                        <Select
                                            value={ field.value ?? "" }
                                            onValueChange={ field.onChange }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o professor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {professors?.map((professor) => (
                                                    <SelectItem
                                                        key={ professor.professorId }
                                                        value={ professor.professorId }
                                                    >
                                                        {professor.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) }
                                />
                                {formState.errors.professorId && (
                                    <p className="text-sm text-red-600">
                                        {
                                            formState.errors.professorId
                                                .message
                                        }
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="studentId">Aluno *</Label>
                                <Controller
                                    control={ control }
                                    name="studentId"
                                    render={ ({ field }) => (
                                        <Select
                                            value={ field.value }
                                            onValueChange={ field.onChange }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o aluno" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {students?.map((student) => (
                                                    <SelectItem
                                                        key={ student.studentId }
                                                        value={ student.studentId }
                                                    >
                                                        {student.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) }
                                />
                                {formState.errors.studentId && (
                                    <p className="text-sm text-red-600">
                                        {formState.errors.studentId.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address-input">Endereço *</Label>
                                <Select
                                    value={ watch("addressId") }
                                    onValueChange={ (value) =>
                                        setValue("addressId", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o endereço" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {
                                            selectedStudent?.Addresses.map(addr => (
                                                <SelectItem
                                                    key={ addr.addressId }
                                                    value={ addr.addressId }
                                                >
                                                    { addr.street.streetName }, { addr.neighborhood.neighborhoodName }, {addr.addressComplement} - { addr.city.cityName }/{ addr.state.UF }
                                                </SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                                {formState.errors.addressId && (
                                    <p className="text-sm text-red-600">
                                        {formState.errors.addressId.message}
                                    </p>
                                )}
                            </div>
                        </div>
                        {/* <div className="space-y-2 flex items-center gap-10"> */}
                        <div className="space-y-2 flex items-start gap-10">
                            <div className="space-y-2">
                                <Label htmlFor="dueDate">Data do Treinamento *</Label>
                                <Controller
                                    control={ control }
                                    name="dueDate"
                                    render={ ({ field }) => (
                                        <Input
                                            id="dueDate"
                                            type="date"
                                            value={
                                                field.value
                                                    ? new Date(field.value)
                                                        .toISOString()
                                                        .split("T")[0]
                                                    : ""
                                            }
                                            onChange={ (e) => {
                                                const dateValue = e.target.value;
                                                field.onChange(
                                                    dateValue ? new Date(dateValue) : null
                                                );
                                            } }
                                        />
                                    ) }
                                />
                                {formState.errors.dueDate && (
                                    <p className="text-sm text-red-600">
                                        {formState.errors.dueDate.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="hour">Hora *</Label>
                                <Controller
                                    control={ control }
                                    name="hour"
                                    render={ ({ field }) => (
                                        <Select
                                            value={ field.value?.toString() }
                                            onValueChange={ (value) =>
                                                field.onChange(parseInt(value))
                                            }
                                        >
                                            <SelectTrigger id="hour">
                                                <SelectValue placeholder="Selecione a hora" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 24 }, (_, i) => (
                                                    <SelectItem key={ i } value={ i.toString() }>
                                                        {i.toString().padStart(2, "0")}:00
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) }
                                />
                                {formState.errors.hour && (
                                    <p className="text-sm text-red-600">
                                        {formState.errors.hour.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="minute">Minuto *</Label>
                                <Controller
                                    control={ control }
                                    name="minute"
                                    render={ ({ field }) => (
                                        <Select
                                            value={ field.value?.toString() }
                                            onValueChange={ (value) =>
                                                field.onChange(parseInt(value))
                                            }
                                        >
                                            <SelectTrigger id="minute">
                                                <SelectValue placeholder="Selecione o minuto" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[ 0, 15, 30, 45 ].map((minute) => (
                                                    <SelectItem
                                                        key={ minute }
                                                        value={ minute.toString() }
                                                    >
                                                        {minute.toString().padStart(2, "0")}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) }
                                />
                                {formState.errors.minute && (
                                    <p className="text-sm text-red-600">
                                        {formState.errors.minute.message}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Preço *</Label>
                            <Controller
                                control={ control }
                                name="price"
                                render={ ({ field }) => (
                                    <PriceInput withLabel={ false } register={ createTrainingMethods.register("price") } value={ watchPrice } setValue={ setValue } name="price" />

                                ) }
                            />
                            {formState.errors.price && (
                                <p className="text-sm text-red-600">
                                    {formState.errors.price.message}
                                </p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={ () => setDialogNovoTreinamento(false) }
                        >
                      Cancelar
                        </Button>
                        <Button type="submit">Criar Treinamento</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}