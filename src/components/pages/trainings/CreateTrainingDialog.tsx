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
    Loader2,
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
import { SelectStudent } from "./SelectStudent";
import { SelectProfessor } from "./SelectProfessor";
import { Gear } from "@/utils/@types/gears";
import { SelectTrainingAddress } from "./SelectTrainingAddress";
import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/lib/api";
import { Address } from "@/utils/@types/address";
import { GetAllCustomerAddresses, GetAllStudentAddresses } from "@/services/addresses.service";

interface CreateTrainingDialogProps {
    dialogNovoTreinamento: boolean,
    setDialogNovoTreinamento: (openStatus: boolean) => void
    professors: Professor[] | undefined,
    students: Student[] | undefined
    gears: Gear[] | undefined
}

export function CreateTrainingDialog({ dialogNovoTreinamento, setDialogNovoTreinamento, professors, students, gears }: CreateTrainingDialogProps) {

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

    const { handleSubmit, formState: { errors, isSubmitting }, watch, setValue, control, reset } = createTrainingMethods;

    const watchPrice = watch("price");

    const [ selectedStudent, setSelectedStudent ] = useState<Student | undefined>(undefined);
    const [ selectedProfessorName, setSelectedProfessorName ] = useState<string | undefined>(undefined);
    const [ selectedStudentName, setSelectedStudentName ] = useState<string | undefined>(undefined);
    const [ selectedGearName, setSelectedGearName ] = useState<string | undefined>(undefined);

    const watchSelectedStudentId = watch("studentId");
    const watchSelectedProfessorId = watch("professorId");
    const watchSelectedAddress = watch("addressId");

    const addressesData = useQuery<ApiResponse<Address[]>, Error>({
        queryKey: [ "get-all-student-addresses", watchSelectedStudentId ],
        queryFn: () => GetAllStudentAddresses({ studentId: watchSelectedStudentId }),
        staleTime: 1000 * 60,
    });
    const allCustomerAddresses = addressesData.data?.data;

    useEffect(() => {
        const student = students?.find((student) => student.studentId === watchSelectedStudentId);
        setSelectedStudent(student);
        setSelectedStudentName(student?.name);
    }, [ watchSelectedStudentId, students ]);

    useEffect(() => {
        const professor = professors?.find((professor) => professor.professorId === watchSelectedProfessorId);
        setSelectedProfessorName(professor?.name);
    }, [ watchSelectedProfessorId, professors ]);

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
            setSelectedProfessorName(undefined);
            setSelectedStudentName(undefined);
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
                            <Label htmlFor="gearId">Equipamento *</Label>
                            <SelectTrainingGear
                                selectedGear={ selectedGearName }
                                onGearChange={ (gearName) => {
                                    const gear = gears?.find(g => g.gearName === gearName);
                                    if (gear) {
                                        setValue("gearId", gear.gearId);
                                        setSelectedGearName(gearName);
                                    }
                                } }
                            />
                            {errors.gearId && (
                                <p className="text-sm text-red-600">
                                    {errors.gearId.message}
                                </p>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="professorId">Professor *</Label>
                                <SelectProfessor
                                    professors={ professors }
                                    selectedProfessor={ selectedProfessorName }
                                    onProfessorChange={ (professorName) => {
                                        const professor = professors?.find(p => p.name === professorName);
                                        if (professor) {
                                            setValue("professorId", professor.professorId);
                                            setSelectedProfessorName(professorName);
                                        }
                                    } }
                                />
                                {errors.professorId && (
                                    <p className="text-sm text-red-600">
                                        {errors.professorId.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="studentId">Aluno *</Label>
                                <SelectStudent
                                    students={ students }
                                    selectedStudent={ selectedStudentName }
                                    onStudentChange={ (studentName) => {
                                        const student = students?.find(s => s.name === studentName);
                                        if (student) {
                                            setValue("studentId", student.studentId);
                                            setSelectedStudentName(studentName);
                                        }
                                    } }
                                />
                                {errors.studentId && (
                                    <p className="text-sm text-red-600">
                                        {errors.studentId.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address-input">Endereço *</Label>
                                <SelectTrainingAddress
                                    studentId={ watchSelectedStudentId }
                                    addresses={ allCustomerAddresses }
                                    selectedAddress={ watchSelectedAddress }
                                    onAddressChange={ (addressId) => {
                                        // Atualizar o estado ou form
                                        setValue("addressId", addressId);
                                    } }
                                />
                                {errors.addressId && (
                                    <p className="text-sm text-red-600">
                                        {errors.addressId.message}
                                    </p>
                                )}
                            </div>
                        </div>
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
                                                    ? new Date(field.value).toLocaleDateString("en-CA") // yyyy-MM-dd
                                                    : ""
                                            }
                                            onChange={ (e) => {
                                                const dateValue = e.target.value;
                                                field.onChange(dateValue ? new Date(`${dateValue}T00:00:00`) : null);
                                            } }
                                        />
                                    ) }
                                />
                                {errors.dueDate && (
                                    <p className="text-sm text-red-600">
                                        {errors.dueDate.message}
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
                                {errors.hour && (
                                    <p className="text-sm text-red-600">
                                        {errors.hour.message}
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
                                {errors.minute && (
                                    <p className="text-sm text-red-600">
                                        {errors.minute.message}
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
                                    <PriceInput
                                        withLabel={ false }
                                        register={ createTrainingMethods.register("price") }
                                        value={ watchPrice }
                                        setValue={ setValue }
                                        name="price"
                                    />
                                ) }
                            />
                            {errors.price && (
                                <p className="text-sm text-red-600">
                                    {errors.price.message}
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
                        <Button disabled={ isSubmitting } className="cursor-pointer" type="submit">
                            {isSubmitting ? <Loader2 className="animate-spin" /> : "Criar Treinamento"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}