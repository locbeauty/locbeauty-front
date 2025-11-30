// "use client";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select";
// import {
//     Dialog,
//     DialogContent,
//     DialogDescription,
//     DialogFooter,
//     DialogHeader,
//     DialogTitle,
//     DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//     CalendarIcon,
//     Clock,
//     DollarSign,
//     FileText,
//     Loader2,
//     Plus
// } from "lucide-react";
// import { Controller, FormProvider, useForm } from "react-hook-form";
// import { SelectTrainingGear } from "@/components/pages/trainings/SelectTrainingGear";
// import { CreateTrainingDataType, CreateTrainingSchema } from "@/lib/zod/CreateTrainingValidation";
// import { Professor } from "@/utils/@types/professor";
// import { Student } from "@/utils/@types/student";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useEffect, useMemo, useState } from "react";
// import { CreateTraining } from "@/services/trainings.service";
// import { toast } from "sonner";
// import { queryClient } from "@/app/(main)/layout";
// import PriceInput from "@/components/shared/PriceInput";
// import { SelectStudent } from "./SelectStudent";
// import { SelectProfessor } from "./SelectProfessor";
// import { Gear } from "@/utils/@types/gears";
// import { SelectTrainingAddress } from "./SelectTrainingAddress";
// import { useQuery } from "@tanstack/react-query";
// import { ApiResponse } from "@/lib/api";
// import { Address } from "@/utils/@types/address";
// import { GetAllCustomerAddresses, GetAllStudentAddresses } from "@/services/addresses.service";
// import { Textarea } from "@/components/ui/textarea";
// import { Separator } from "@/components/ui/separator";
// import { cn } from "@/lib/utils";
// import { parseStringToCents } from "@/utils/parseStringToCents";

// interface CreateTrainingDialogProps {
//     dialogNovoTreinamento: boolean,
//     setDialogNovoTreinamento: (openStatus: boolean) => void
//     professors: Professor[] | undefined,
//     students: Student[] | undefined
//     gears: Gear[] | undefined
// }

// export function CreateTrainingDialog({ dialogNovoTreinamento, setDialogNovoTreinamento, professors, students, gears }: CreateTrainingDialogProps) {

//     const createTrainingMethods = useForm<CreateTrainingDataType>({
//         resolver: zodResolver(CreateTrainingSchema),
//         defaultValues: {
//             professorId: "",
//             studentId: "",
//             hour: undefined,
//             minute: undefined,
//             dueDate: undefined,
//             addressId: "",
//             price: "",
//             gearId: "",
//             paymentInfo: {
//                 paymentStatus: "Pendente",
//                 firstPaymentDate: null,
//                 secondPaymentDate: null,
//                 firstPaymentAmount: "0,00",
//                 firstPaymentStatus: "Pendente",
//                 secondPaymentAmount: "0,00",
//                 secondPaymentStatus: "Pendente"
//             },
//         }
//     });

//     const { handleSubmit, formState: { errors, isSubmitting }, watch, setValue, control, reset } = createTrainingMethods;

//     const watchPrice = watch("price");

//     const [ selectedStudent, setSelectedStudent ] = useState<Student | undefined>(undefined);
//     const [ selectedProfessorName, setSelectedProfessorName ] = useState<string | undefined>(undefined);
//     const [ selectedStudentName, setSelectedStudentName ] = useState<string | undefined>(undefined);
//     const [ selectedGearId, setSelectedGearId ] = useState<string | undefined>(undefined);

//     const watchSelectedStudentId = watch("studentId");
//     const watchSelectedProfessorId = watch("professorId");
//     const watchSelectedAddress = watch("addressId");

//     const addressesData = useQuery<ApiResponse<Address[]>, Error>({
//         queryKey: [ "get-all-student-addresses", watchSelectedStudentId ],
//         queryFn: () => GetAllStudentAddresses({ studentId: watchSelectedStudentId }),
//         enabled: !!watchSelectedStudentId,
//         staleTime: 1000 * 60,
//     });
//     const allCustomerAddresses = addressesData.data?.data;

//     useEffect(() => {
//         const student = students?.find((student) => student.studentId === watchSelectedStudentId);
//         setSelectedStudent(student);
//         setSelectedStudentName(student?.name);
//     }, [ watchSelectedStudentId, students ]);

//     useEffect(() => {
//         const professor = professors?.find((professor) => professor.professorId === watchSelectedProfessorId);
//         setSelectedProfessorName(professor?.name);
//     }, [ watchSelectedProfessorId, professors ]);

//     const onSubmitTraining = async (data: CreateTrainingDataType) => {
//         const parsed = {
//             ...data,

//             price: data.price,
//             additionalCost: data.additionalCost,

//             paymentInfo: {
//                 paymentStatus: data.paymentInfo.paymentStatus,
//                 firstPaymentDate: data.paymentInfo.firstPaymentDate ?? null,
//                 firstPaymentAmount: data.paymentInfo.firstPaymentAmount
//                     ? parseStringToCents(data.paymentInfo.firstPaymentAmount)
//                     : null,
//                 firstPaymentMethod: data.paymentInfo.firstPaymentMethod ?? undefined,
//                 firstPaymentStatus: data.paymentInfo.firstPaymentStatus,

//                 secondPaymentDate: data.paymentInfo.secondPaymentDate ?? null,
//                 secondPaymentAmount: data.paymentInfo.secondPaymentAmount
//                     ? parseStringToCents(data.paymentInfo.secondPaymentAmount)
//                     : null,
//                 secondPaymentMethod: data.paymentInfo.secondPaymentMethod ?? undefined,
//                 secondPaymentStatus: data.paymentInfo.secondPaymentStatus ?? undefined,
//             },
//         };
//         const response = await CreateTraining(parsed);

//         console.log("DATA: ", data);
//         console.log("parsed: ", parsed);

//         if (response.statusCode !== 201) {
//             toast.warning(response.message, { style: { fontSize: "1rem" } });
//             window.scroll({ top: 0 });
//         } else {
//             queryClient.invalidateQueries({ queryKey: [ "get-all-trainings" ] });

//             toast.success(response.message, { style: { fontSize: "1rem" } });
//             window.scroll({ top: 0 });
//             reset();
//             setSelectedProfessorName(undefined);
//             setSelectedStudentName(undefined);
//             setDialogNovoTreinamento(false);
//         }
//     };
//     const watchHour = watch("hour");
//     const watchMinute = watch("minute");

//     // Gera os slots de tempo (08:00 até 17:00, passo de 30min)
//     const timeSlots = useMemo(() => {
//         const slots = [];
//         for (let h = 8; h <= 17; h++) {
//             slots.push({ h, m: 0, label: `${h.toString().padStart(2, "0")}:00` });
//             // Se quiser ir até 17:30, remova o if. Se o limite for terminar as 17h, mantenha o if.
//             if (h !== 18) {
//                 slots.push({ h, m: 30, label: `${h.toString().padStart(2, "0")}:30` });
//             }
//         }
//         return slots;
//     }, []);

//     return (
//         <Dialog
//             open={ dialogNovoTreinamento }
//             onOpenChange={ setDialogNovoTreinamento }
//         >
//             <DialogTrigger asChild>
//                 <Button>
//                     <Plus className="mr-2 h-4 w-4" />
//                     Novo Treinamento
//                 </Button>
//             </DialogTrigger>
//             <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//                 <form onSubmit={ handleSubmit(onSubmitTraining) }>
//                     <DialogHeader>
//                         <DialogTitle>Criar Nova Sessão</DialogTitle>
//                         <DialogDescription>
//                             Configure os detalhes do agendamento e valores.
//                         </DialogDescription>
//                     </DialogHeader>

//                     <div className="grid gap-6 py-4">

//                         {/* SEÇÃO 1: DADOS GERAIS */}
//                         <div className="grid gap-4">
//                             <div className="space-y-2">
//                                 <Label htmlFor="gearId">Equipamento *</Label>
//                                 <SelectTrainingGear
//                                     selectedGear={ selectedGearId }
//                                     onGearChange={ (gearId) => {
//                                         setValue("gearId", gearId);
//                                         setSelectedGearId(gearId);
//                                     } }
//                                 />
//                                 {errors.gearId && <p className="text-sm text-red-600">{errors.gearId.message}</p>}
//                             </div>

//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                 <div className="space-y-2">
//                                     <Label>Aluno *</Label>
//                                     <SelectStudent
//                                         students={ students }
//                                         selectedStudent={ selectedStudentName }
//                                         onStudentChange={ (studentName) => {
//                                             const student = students?.find(s => s.name === studentName);
//                                             if (student) {
//                                                 setValue("studentId", student.studentId);
//                                                 setSelectedStudentName(studentName);
//                                             }
//                                         } }
//                                     />
//                                     {errors.studentId && <p className="text-sm text-red-600">{errors.studentId.message}</p>}
//                                 </div>
//                                 <div className="space-y-2">
//                                     <Label>Paciente modelo *</Label>
//                                     <SelectProfessor
//                                         professors={ professors }
//                                         selectedProfessor={ selectedProfessorName }
//                                         onProfessorChange={ (professorName) => {
//                                             const professor = professors?.find(p => p.name === professorName);
//                                             if (professor) {
//                                                 setValue("professorId", professor.professorId);
//                                                 setSelectedProfessorName(professorName);
//                                             }
//                                         } }
//                                     />
//                                     {errors.professorId && <p className="text-sm text-red-600">{errors.professorId.message}</p>}
//                                 </div>
//                             </div>

//                             <div className="space-y-2">
//                                 <Label>Endereço de Realização *</Label>
//                                 <SelectTrainingAddress
//                                     studentId={ watchSelectedStudentId }
//                                     addresses={ allCustomerAddresses }
//                                     selectedAddress={ watchSelectedAddress }
//                                     onAddressChange={ (addressId) => setValue("addressId", addressId) }
//                                 />
//                                 {errors.addressId && <p className="text-sm text-red-600">{errors.addressId.message}</p>}
//                             </div>
//                         </div>

//                         <Separator />

//                         {/* SEÇÃO 2: DATA E HORA (USABILIDADE MELHORADA) */}
//                         <div className="space-y-4">
//                             <h4 className="flex items-center gap-2 font-medium text-muted-foreground">
//                                 <CalendarIcon className="h-4 w-4" /> Data e Horário
//                             </h4>

//                             <div className="space-y-2">
//                                 <Label>Data do Treinamento *</Label>
//                                 <Controller
//                                     control={ control }
//                                     name="dueDate"
//                                     render={ ({ field }) => (
//                                         <Input
//                                             type="date"
//                                             className="w-full md:w-1/2"
//                                             value={ field.value ? new Date(field.value).toISOString().split("T")[0] : "" }
//                                             onChange={ (e) => {
//                                                 const dateValue = e.target.value;
//                                                 field.onChange(dateValue ? new Date(dateValue) : null);
//                                             } }
//                                         />
//                                     ) }
//                                 />
//                                 {errors.dueDate && <p className="text-sm text-red-600">{errors.dueDate.message}</p>}
//                             </div>

//                             <div className="space-y-2">
//                                 <Label className="flex items-center gap-2">
//                                     <Clock className="h-4 w-4" /> Selecione o Horário de Início *
//                                 </Label>
//                                 <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-2">
//                                     {timeSlots.map((slot) => {
//                                         const isSelected = watchHour === slot.h && watchMinute === slot.m;
//                                         return (
//                                             <Button
//                                                 key={ slot.label }
//                                                 type="button"
//                                                 variant={ isSelected ? "default" : "outline" }
//                                                 className={ cn(
//                                                     "h-9 text-xs sm:text-sm",
//                                                     isSelected && "ring-2 ring-offset-1 ring-primary"
//                                                 ) }
//                                                 onClick={ () => {
//                                                     setValue("hour", slot.h);
//                                                     setValue("minute", slot.m);
//                                                 } }
//                                             >
//                                                 {slot.label}
//                                             </Button>
//                                         );
//                                     })}
//                                 </div>
//                                 {(errors.hour || errors.minute) && (
//                                     <p className="text-sm text-red-600">Selecione um horário válido.</p>
//                                 )}
//                             </div>
//                         </div>

//                         <Separator />

//                         {/* SEÇÃO 3: FINANCEIRO */}
//                         <div className="space-y-4">
//                             <h4 className="flex items-center gap-2 font-medium text-muted-foreground">
//                                 <DollarSign className="h-4 w-4" /> Financeiro
//                             </h4>

//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                 <div className="space-y-2">
//                                     <Label>Preço Base (Opcional)</Label>
//                                     <Controller
//                                         control={ control }
//                                         name="price"
//                                         render={ ({ field }) => (
//                                             <PriceInput
//                                                 withLabel={ false }
//                                                 register={ createTrainingMethods.register("price") }
//                                                 value={ field.value }
//                                                 setValue={ setValue }
//                                                 name="price"
//                                                 placeholder="R$ 0,00"
//                                             />
//                                         ) }
//                                     />
//                                     {errors.price && <p className="text-sm text-red-600">{errors.price.message}</p>}
//                                 </div>

//                                 <div className="space-y-2">
//                                     <Label>Custo Adicional (Opcional)</Label>
//                                     <Controller
//                                         control={ control }
//                                         name="additionalCost"
//                                         render={ ({ field }) => (
//                                             <PriceInput
//                                                 withLabel={ false }
//                                                 register={ createTrainingMethods.register("additionalCost") }
//                                                 value={ field.value }
//                                                 setValue={ setValue }
//                                                 name="additionalCost"
//                                                 placeholder="R$ 0,00"
//                                             />
//                                         ) }
//                                     />
//                                 </div>
//                             </div>

//                             <div className="space-y-2">
//                                 <Label className="flex items-center gap-2">
//                                     <FileText className="h-4 w-4" /> Descrição do Custo Adicional
//                                 </Label>
//                                 <Textarea
//                                     { ...createTrainingMethods.register("additionalCostDescription") }
//                                     placeholder="Ex: Taxa de deslocamento, material extra..."
//                                     className="resize-none"
//                                     rows={ 2 }
//                                 />
//                             </div>
//                         </div>
//                     </div>

//                     <DialogFooter className="mt-4">
//                         <Button
//                             variant="outline"
//                             type="button"
//                             onClick={ () => setDialogNovoTreinamento(false) }
//                         >
//                             Cancelar
//                         </Button>
//                         <Button disabled={ isSubmitting } type="submit">
//                             {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
//                             Criar Treinamento
//                         </Button>
//                     </DialogFooter>
//                 </form>
//             </DialogContent>
//         </Dialog>
//     );
// }

"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    CalendarIcon,
    Clock,
    DollarSign,
    FileText,
    Loader2,
    Plus
} from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Components
import PriceInput from "@/components/shared/PriceInput";
import { SelectTrainingGear } from "@/components/pages/trainings/SelectTrainingGear";
import { SelectStudent } from "./SelectStudent";
import { SelectProfessor } from "./SelectProfessor";
import { SelectTrainingAddress } from "./SelectTrainingAddress";

// Services & Utils
import { CreateTraining } from "@/services/trainings.service";
import { GetAllStudentAddresses } from "@/services/addresses.service";
import { queryClient } from "@/app/(main)/layout";
import { parseStringToCents } from "@/utils/parseStringToCents"; // Certifique-se que esta função converte "R$ 10,00" para 1000

// Types & Schemas
import { CreateTrainingBackendPayload, CreateTrainingDataType, CreateTrainingSchema } from "@/lib/zod/CreateTrainingValidation";
import { Professor } from "@/utils/@types/professor";
import { Student } from "@/utils/@types/student";
import { Gear } from "@/utils/@types/gears";
import { ApiResponse } from "@/lib/api";
import { Address } from "@/utils/@types/address";

interface CreateTrainingDialogProps {
    dialogNovoTreinamento: boolean,
    setDialogNovoTreinamento: (openStatus: boolean) => void
    professors: Professor[] | undefined,
    students: Student[] | undefined
    gears: Gear[] | undefined
}

export function CreateTrainingDialog({
    dialogNovoTreinamento,
    setDialogNovoTreinamento,
    professors,
    students
}: CreateTrainingDialogProps) {

    const createTrainingMethods = useForm<CreateTrainingDataType>({
        resolver: zodResolver(CreateTrainingSchema), // Use o Schema importado, não o Tipo
        defaultValues: {
            professorId: "",
            studentId: "",
            gearId: "",
            addressId: "",
            price: "", // Agora isso é válido porque CreateTrainingDataType aceita string | number
            additionalCost: "",
            additionalCostDescription: "",
            paymentInfo: {
                paymentStatus: "Pendente",
                firstPaymentDate: null,
                secondPaymentDate: null,
                firstPaymentAmount: "0",
                firstPaymentStatus: "Pendente",
                secondPaymentAmount: "0",
                secondPaymentStatus: "Pendente"
            },
        }
    });

    const {
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
        setValue,
        control,
        reset
    } = createTrainingMethods;

    // --- States Auxiliares para UI ---
    const [ selectedStudentName, setSelectedStudentName ] = useState<string | undefined>(undefined);
    const [ selectedProfessorName, setSelectedProfessorName ] = useState<string | undefined>(undefined);
    const [ selectedGearId, setSelectedGearId ] = useState<string | undefined>(undefined);

    // --- Watchers ---
    const watchSelectedStudentId = watch("studentId");
    const watchSelectedProfessorId = watch("professorId");
    const watchSelectedAddress = watch("addressId");
    const watchHour = watch("hour");
    const watchMinute = watch("minute");

    // --- Query de Endereços ---
    const addressesData = useQuery<ApiResponse<Address[]>, Error>({
        queryKey: [ "get-all-student-addresses", watchSelectedStudentId ],
        queryFn: () => GetAllStudentAddresses({ studentId: watchSelectedStudentId }),
        enabled: !!watchSelectedStudentId,
        staleTime: 1000 * 60,
    });
    const allCustomerAddresses = addressesData.data?.data;

    // --- Effects para Sincronizar UI ---
    useEffect(() => {
        const student = students?.find((student) => student.studentId === watchSelectedStudentId);
        setSelectedStudentName(student?.name);
    }, [ watchSelectedStudentId, students ]);

    useEffect(() => {
        const professor = professors?.find((professor) => professor.professorId === watchSelectedProfessorId);
        setSelectedProfessorName(professor?.name);
    }, [ watchSelectedProfessorId, professors ]);

    // --- Submit Handler ---
    const onSubmitTraining = async (data: CreateTrainingDataType) => {
        try {
            // Função auxiliar para garantir número (input string -> centavos)
            const toCents = (val: string | number | null | undefined) => {
                if (!val) return 0;
                if (typeof val === "number") return Math.round(val * 100); // se já for número (ex: 100.00)
                return parseStringToCents(val); // se for string (ex: "R$ 100,00")
            };

            // 1. Preparar Payload Estritamente Tipado
            const payload: CreateTrainingBackendPayload = {
                ...data,

                // Conversão explícita para o Backend
                price: toCents(data.price),
                additionalCost: toCents(data.additionalCost),

                paymentInfo: {
                    paymentStatus: data.paymentInfo.paymentStatus,
                    firstPaymentDate: data.paymentInfo.firstPaymentDate ?? null,

                    // Converte amount do pagamento
                    firstPaymentAmount: data.paymentInfo.firstPaymentAmount
                        ? toCents(data.paymentInfo.firstPaymentAmount)
                        : null,

                    firstPaymentMethod: data.paymentInfo.firstPaymentMethod,
                    firstPaymentStatus: data.paymentInfo.firstPaymentStatus,

                    secondPaymentDate: data.paymentInfo.secondPaymentDate ?? null,

                    // Converte amount do pagamento
                    secondPaymentAmount: data.paymentInfo.secondPaymentAmount
                        ? toCents(data.paymentInfo.secondPaymentAmount)
                        : null,

                    secondPaymentMethod: data.paymentInfo.secondPaymentMethod,
                    secondPaymentStatus: data.paymentInfo.secondPaymentStatus,
                },
            };

            // A lógica de cálculo automático do Pendente (se necessário)
            if (payload.paymentInfo.paymentStatus === "Pendente" && !payload.paymentInfo.firstPaymentAmount) {
                payload.paymentInfo.firstPaymentAmount = payload.price + payload.additionalCost;
                payload.paymentInfo.firstPaymentDate = data.dueDate;
            }

            console.log("Payload enviado:", payload);

            // Agora o payload bate com o tipo esperado pelo service
            const response = await CreateTraining(payload);

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

        } catch (error) {
            console.error(error);
            toast.error("Erro ao processar dados");
        }
    };

    // --- Slots de Tempo ---
    const timeSlots = useMemo(() => {
        const slots = [];
        for (let h = 8; h <= 17; h++) {
            slots.push({ h, m: 0, label: `${h.toString().padStart(2, "0")}:00` });
            if (h !== 17) { // Termina 17:00
                slots.push({ h, m: 30, label: `${h.toString().padStart(2, "0")}:30` });
            }
        }
        return slots;
    }, []);

    const handleOpenChange = (open: boolean) => {
        setDialogNovoTreinamento(open);
        if (!open) {
            // Opcional: Resetar form ao fechar se desejar que os dados sumam
            // reset();
        }
    };

    return (
        <Dialog open={ dialogNovoTreinamento } onOpenChange={ handleOpenChange }>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Treinamento
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={ handleSubmit(onSubmitTraining) }>
                    <DialogHeader>
                        <DialogTitle>Criar Nova Sessão</DialogTitle>
                        <DialogDescription>
                            Configure os detalhes do agendamento e valores.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">

                        {/* --- DADOS GERAIS --- */}
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="gearId">Equipamento *</Label>
                                <SelectTrainingGear
                                    selectedGear={ selectedGearId }
                                    onGearChange={ (gearId) => {
                                        setValue("gearId", gearId);
                                        setSelectedGearId(gearId);
                                    } }
                                />
                                {errors.gearId && <p className="text-sm text-red-600">{errors.gearId.message}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Aluno *</Label>
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
                                    {errors.studentId && <p className="text-sm text-red-600">{errors.studentId.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Paciente modelo *</Label>
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
                                    {errors.professorId && <p className="text-sm text-red-600">{errors.professorId.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Endereço de Realização *</Label>
                                <SelectTrainingAddress
                                    studentId={ watchSelectedStudentId }
                                    addresses={ allCustomerAddresses }
                                    selectedAddress={ watchSelectedAddress }
                                    onAddressChange={ (addressId) => setValue("addressId", addressId) }
                                />
                                {errors.addressId && <p className="text-sm text-red-600">{errors.addressId.message}</p>}
                            </div>
                        </div>

                        <Separator />

                        {/* --- DATA E HORA --- */}
                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 font-medium text-muted-foreground">
                                <CalendarIcon className="h-4 w-4" /> Data e Horário
                            </h4>

                            <div className="space-y-2">
                                <Label>Data do Treinamento *</Label>
                                <Controller
                                    control={ control }
                                    name="dueDate"
                                    render={ ({ field }) => (
                                        <Input
                                            type="date"
                                            className="w-full md:w-1/2"
                                            // Converte Date object para string YYYY-MM-DD para o input
                                            value={ field.value ? new Date(field.value).toISOString().split("T")[0] : "" }
                                            onChange={ (e) => {
                                                const dateValue = e.target.value;
                                                // Salva Date object no form state para o Zod validar corretamente
                                                field.onChange(dateValue ? new Date(dateValue) : null);
                                            } }
                                        />
                                    ) }
                                />
                                {errors.dueDate && <p className="text-sm text-red-600">{errors.dueDate.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" /> Selecione o Horário de Início *
                                </Label>
                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-2">
                                    {timeSlots.map((slot) => {
                                        const isSelected = watchHour === slot.h && watchMinute === slot.m;
                                        return (
                                            <Button
                                                key={ slot.label }
                                                type="button"
                                                variant={ isSelected ? "default" : "outline" }
                                                className={ cn(
                                                    "h-9 text-xs sm:text-sm",
                                                    isSelected && "ring-2 ring-offset-1 ring-primary"
                                                ) }
                                                onClick={ () => {
                                                    setValue("hour", slot.h, { shouldValidate: true });
                                                    setValue("minute", slot.m, { shouldValidate: true });
                                                } }
                                            >
                                                {slot.label}
                                            </Button>
                                        );
                                    })}
                                </div>
                                {(errors.hour || errors.minute) && (
                                    <p className="text-sm text-red-600">Selecione um horário válido.</p>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* --- FINANCEIRO --- */}
                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 font-medium text-muted-foreground">
                                <DollarSign className="h-4 w-4" /> Financeiro
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Preço Base (Opcional)</Label>
                                    <Controller
                                        control={ control }
                                        name="price"
                                        render={ ({ field }) => (
                                            <PriceInput
                                                withLabel={ false }
                                                register={ createTrainingMethods.register("price") }

                                                // --- CORREÇÃO AQUI ---
                                                // 1. ?.toString() converte number para string (ex: 100 -> "100")
                                                // 2. ?? "" converte null/undefined para string vazia
                                                value={ field.value?.toString() ?? "" }
                                                // ---------------------

                                                setValue={ setValue }
                                                name="price"
                                                placeholder="R$ 0,00"
                                            />
                                        ) }
                                    />
                                    {errors.price && <p className="text-sm text-red-600">{errors.price.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Custo Adicional (Opcional)</Label>
                                    <Controller
                                        control={ control }
                                        name="additionalCost"
                                        render={ ({ field }) => (
                                            <PriceInput
                                                withLabel={ false }
                                                register={ createTrainingMethods.register("additionalCost") }

                                                // --- CORREÇÃO AQUI ---
                                                // 1. ?.toString() converte number para string (ex: 100 -> "100")
                                                // 2. ?? "" converte null/undefined para string vazia
                                                value={ field.value?.toString() ?? "" }
                                                // ---------------------

                                                setValue={ setValue }
                                                name="additionalCost"
                                                placeholder="R$ 0,00"
                                            />
                                        ) }
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" /> Descrição do Custo Adicional
                                </Label>
                                <Textarea
                                    { ...createTrainingMethods.register("additionalCostDescription") }
                                    placeholder="Ex: Taxa de deslocamento, material extra..."
                                    className="resize-none"
                                    rows={ 2 }
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-4">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={ () => setDialogNovoTreinamento(false) }
                        >
                            Cancelar
                        </Button>
                        <Button disabled={ isSubmitting } type="submit">
                            {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                            Criar Treinamento
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}