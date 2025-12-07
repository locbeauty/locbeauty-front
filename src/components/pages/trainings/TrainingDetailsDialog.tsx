import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    User,
    MapPin,
    Calendar,
    Clock,
    Phone, GraduationCap,
    DollarSign,
    Check,
    Trash2
} from "lucide-react";

import { BookingStatusBadge } from "../bookings/common/BookingStatusBadge";
import { BookingPaymentStatusBadge } from "../bookings/common/BookingPaymentStatusBadge";
import { Training } from "@/utils/@types/training";
import { TrainingPaymentMethodDialog } from "./TrainingPaymentMethodDialog";
import { centsToString } from "@/utils/centsToString";
import { toast } from "sonner";
import { parseStringToCents } from "@/utils/parseStringToCents";

interface TrainingDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTraining: Training;
  setSelectedTraining: Training
}

export function TrainingDetailsDialog({ open, onOpenChange, selectedTraining, setSelectedTraining }: TrainingDetailsDialogProps) {
    const [ isTrainingPaymentMethodDialogOpen, setIsTrainingPaymentMethodDialogOpen ] = useState(false);

    // Estados para edição de preço
    const [ isEditingPrice, setIsEditingPrice ] = useState(false);
    const [ priceInputValue, setPriceInputValue ] = useState("0,00");
    const [ isSavingPrice, setIsSavingPrice ] = useState(false);

    useEffect(() => {
        // Log para debug (opcional)
        // console.log("selectedTraining: ", selectedTraining);
    }, [ selectedTraining ]);

    const defaultPaymentValues = {
        price: selectedTraining.price || 0,
        additionalCost: selectedTraining.additionalCost || 0,
        TrainingPayment: {
            paymentStatus: selectedTraining.TrainingPayment.paymentStatus || "Pendente",
            firstPaymentAmount: selectedTraining.TrainingPayment.firstPaymentAmount || null,
            firstPaymentDate: selectedTraining.TrainingPayment.firstPaymentDate ? new Date(selectedTraining.TrainingPayment.firstPaymentDate) : null,
            firstPaymentMethod: selectedTraining.TrainingPayment.firstPaymentMethod || "",
        }
    };

    const form = useForm({
        defaultValues: defaultPaymentValues,
        mode: "onChange"
    });

    // Função para iniciar a edição
    const handleStartEditingPrice = () => {
        setPriceInputValue(centsToString(selectedTraining.price));
        setIsEditingPrice(true);
    };

    // Função para cancelar a edição
    const handleCancelEditingPrice = () => {
        setIsEditingPrice(false);
        setPriceInputValue("0,00");
    };

    // Função para salvar o novo preço
    const handleSavePrice = async () => {
        if (!selectedTraining) return;

        setIsSavingPrice(true);
        const newPriceInCents = parseStringToCents(priceInputValue);

        try {
            // Chamada ao backend
            // const response = await UpdateTraining({
            //     trainingId: selectedTraining.trainingId,
            //     body: {
            //         price: newPriceInCents,
            //         // É necessário enviar o status atual ou o backend lida com partial updates?
            //         // Assumindo partial ou enviando o status atual para garantir integridade:
            //         trainingStatus: selectedTraining.trainingStatus
            //     } as any // Cast se o tipo do payload exigir campos obrigatórios que não estamos mudando
            // });

            // if (response.statusCode === 200) {
            //     toast.success("Valor do treino atualizado!");

            //     // Atualiza o estado local para refletir na UI imediatamente
            //     setSelectedTraining((prev) => prev ? ({
            //         ...prev,
            //         price: newPriceInCents
            //     }) : null);

            //     // Invalida queries para garantir sincronia
            //     queryClient.invalidateQueries({ queryKey: [ "get-all-trainings" ] });

            //     setIsEditingPrice(false);
            // } else {
            //     toast.error("Erro ao atualizar valor.");
            // }
        } catch (error) {
            console.error(error);
            toast.error("Erro inesperado ao salvar.");
        } finally {
            setIsSavingPrice(false);
        }
    };

    const payment = selectedTraining.TrainingPayment;
    const hasSecondPayment = payment.paymentMode === "Parcelado" || payment.secondPaymentAmount > 0;

    return (
        <Dialog open={ open } onOpenChange={ onOpenChange }>
            <DialogContent className="max-h-[90vh] w-[90vw] md:w-[700px] overflow-hidden flex flex-col dark:bg-gray-900">
                <DialogHeader className="px-1">
                    <DialogTitle className="text-xl">Detalhes do Agendamento</DialogTitle>
                    <DialogDescription>
                        Informações do treinamento e gestão financeira.
                    </DialogDescription>
                </DialogHeader>

                {/* Wrapper do FormProvider */}
                <FormProvider { ...form }>
                    <div className="flex-1 overflow-y-auto pr-2 -mr-2 py-4">
                        <div className="space-y-6">

                            {/* 1. CABEÇALHO DO TREINAMENTO (Resumo) */}
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                                    <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">{selectedTraining.Gear.gearName}</h3>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {String(Math.floor(selectedTraining.hourInMinutes / 60)).padStart(2, "0")}:{String(selectedTraining.hourInMinutes % 60).padStart(2, "0")}
                                        </span>
                                        <span>•</span>
                                        <span>{new Date(selectedTraining.dueDate).toLocaleDateString("pt-BR", { dateStyle: "long" })}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-auto">
                                    <BookingStatusBadge
                                        status={ selectedTraining.trainingStatus }
                                    />
                                    <BookingPaymentStatusBadge
                                        status={ selectedTraining.TrainingPayment.paymentStatus }
                                    />
                                </div>
                            </div>

                            <Separator />

                            {/* 2. PARTICIPANTES */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Paciente Modelo */}
                                <div className="space-y-2">
                                    <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <GraduationCap className="h-3 w-3" /> Aluno
                                    </h4>
                                    <div className="p-3 rounded-lg border bg-card flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                                            <span className="font-bold text-xs text-orange-600">{selectedTraining.Trainee.name.charAt(0)}</span>
                                        </div>
                                        <div className="text-sm">
                                            <p className="font-medium">{selectedTraining.Trainee.name}</p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Phone className="h-3 w-3" /> {selectedTraining.Trainee.cellphone || "N/A"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Aluno */}
                                <div className="space-y-2">
                                    <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <User className="h-3 w-3" /> Paciente Modelo
                                    </h4>
                                    <div className="p-3 rounded-lg border bg-card flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="font-bold text-xs text-primary">{selectedTraining.Volunteer.name.charAt(0)}</span>
                                        </div>
                                        <div className="text-sm">
                                            <p className="font-medium">{selectedTraining.Volunteer.name}</p>
                                            <p className="text-xs text-muted-foreground">{selectedTraining.Volunteer.documentNumber}</p>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            <Separator />

                            {/* 3. LOCALIZAÇÃO */}
                            <div className="space-y-3">
                                <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <MapPin className="h-3 w-3" /> Localização
                                </h4>
                                <div className="p-4 rounded-lg border bg-muted/20 text-sm">
                                    <p className="font-medium">
                                        {selectedTraining.Address.Street.streetName}, {selectedTraining.Address.buildingNumber}
                                    </p>
                                    {selectedTraining.Address.addressComplement && (
                                        <p className="text-muted-foreground text-xs mt-1">Comp: {selectedTraining.Address.addressComplement}</p>
                                    )}
                                    <p className="text-muted-foreground mt-1">
                                        {selectedTraining.Address.Neighborhood.neighborhoodName} - {selectedTraining.Address.City.cityName}/{selectedTraining.Address.State.UF}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </FormProvider>

                <DialogFooter className="flex flex-row gap-3 justify-center sm:justify-center items-center w-full">
                    <Button
                        className="flex items-center justify-center cursor-pointer gap-2"
                        variant={ "outline" }
                        onClick={ () => setIsTrainingPaymentMethodDialogOpen(true) }
                    >
                        <DollarSign className="w-4 h-4" />
                        <span className="md:block hidden">Gerenciar pagamento</span>
                    </Button>
                    <Button
                        variant="default"
                        className="flex items-center justify-center cursor-pointer"
                        // onClick={ () => handleChangeCheckoutStatus(selectedCheckout.checkoutId, "Concluido") }
                        disabled={
                            selectedTraining.trainingStatus === "Concluido" ||
                                    selectedTraining.trainingStatus === "Cancelado" ||
                                    selectedTraining.TrainingPayment.paymentStatus !== "Pago"
                        }
                    >
                        <Check className="" />
                        <span className="md:block hidden">Marcar como concluído</span>
                    </Button>
                    <Button
                        disabled={ selectedTraining.trainingStatus !== "Pendente" }
                        variant="destructive"
                        // onClick={ () => setCancelBookingConfirmationDialogOpen(true) }
                        className="flex items-center justify-center cursor-pointer"
                    >
                        <Trash2 className="" />
                        <span className="md:block hidden">Cancelar treinamento</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
            <TrainingPaymentMethodDialog
                isTrainingPaymentMethodDialogOpen={ isTrainingPaymentMethodDialogOpen }
                selectedTraining={ selectedTraining }
                setIsTrainingPaymentMethodDialogOpen={ setIsTrainingPaymentMethodDialogOpen }
            />
        </Dialog>
    );
}