import { Dispatch, SetStateAction, useEffect, useState, useMemo } from "react";
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
    Trash2,
    Wallet
} from "lucide-react";

import { BookingStatusBadge } from "../bookings/common/BookingStatusBadge";
import { BookingPaymentStatusBadge } from "../bookings/common/BookingPaymentStatusBadge";
import { TrainingPaymentMethodDialog } from "./TrainingPaymentMethodDialog";
import { centsToString } from "@/utils/centsToString";
import { Training } from "@/utils/@types/training";
import { TrainingPayment } from "@/utils/@types/payments";

interface TrainingDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTraining: Training;
}

export type PayerType = "TRAINEE" | "VOLUNTEER";

export function TrainingDetailsDialog({ open, onOpenChange, selectedTraining }: TrainingDetailsDialogProps) {
    const [ isTrainingPaymentMethodDialogOpen, setIsTrainingPaymentMethodDialogOpen ] = useState(false);
    const [ selectedPayerType, setSelectedPayerType ] = useState<PayerType | null>(null);

    // --- Extrair os pagamentos do Array ---
    const { traineePayment, volunteerPayment } = useMemo(() => {
        const payments = Array.isArray(selectedTraining.TrainingPayment)
            ? selectedTraining.TrainingPayment
            : [];

        return {
            traineePayment: payments.find((p: TrainingPayment) => p.payerType === "TRAINEE"),
            volunteerPayment: payments.find((p: TrainingPayment) => p.payerType === "VOLUNTEER")
        };
    }, [ selectedTraining ]);

    const handleOpenPaymentDialog = (type: PayerType) => {
        setSelectedPayerType(type);
        setIsTrainingPaymentMethodDialogOpen(true);
    };

    // Helper para formatar moeda
    const formatCurrency = (val: number) => `R$ ${centsToString(val)}`;

    // Valores para exibição
    const traineeBasePrice = traineePayment?.basePrice || 0;
    const traineeAdditionalCost = traineePayment?.additionalCost || 0;
    const traineeAdditionalCostDescription = traineePayment?.additionalCostDescription || "";
    const traineeTotalPrice = traineePayment?.totalPrice || 0;

    const volunteerTotalPrice = volunteerPayment?.totalPrice || 0;

    return (
        <Dialog open={ open } onOpenChange={ onOpenChange }>
            <DialogContent className="max-h-[90vh] w-[90vw] md:w-[900px] overflow-hidden flex flex-col dark:bg-gray-900">
                <DialogHeader className="px-1">
                    <DialogTitle className="text-xl">Detalhes do Agendamento</DialogTitle>
                    <DialogDescription>
                        Informações do treinamento e gestão financeira.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2 -mr-2 py-4 custom-scrollbar">
                    <div className="space-y-6">

                        {/* 1. CABEÇALHO (Mantido) */}
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
                                <BookingStatusBadge status={ selectedTraining.trainingStatus } />
                            </div>
                        </div>

                        <Separator />

                        {/* 2. PARTICIPANTES (Mantido) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Aluno */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <GraduationCap className="h-3 w-3" /> Aluno
                                    </h4>
                                </div>
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

                            {/* Paciente Modelo */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <User className="h-3 w-3" /> Paciente Modelo
                                    </h4>
                                </div>
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

                        {/* 3. LOCALIZAÇÃO (Mantido) */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <MapPin className="h-3 w-3" /> Localização
                            </h4>
                            <div className="p-4 rounded-lg border bg-muted/20 text-sm">
                                <p className="font-medium">
                                    {selectedTraining.Address.Street.streetName}, {selectedTraining.Address.buildingNumber}
                                </p>
                                <p className="text-muted-foreground mt-1">
                                    {selectedTraining.Address.Neighborhood.neighborhoodName} - {selectedTraining.Address.City.cityName}/{selectedTraining.Address.State.UF}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- FOOTER ATUALIZADO --- */}
                <DialogFooter className="sm:justify-between w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">

                        {/* COLUNA 1: RESUMO FINANCEIRO (DUAS CARTAS) */}
                        <div className="flex flex-col gap-4 h-full">

                            {/* Card 1: Financeiro - Aluno */}
                            <div className="flex flex-col gap-3 p-4 rounded-lg border bg-muted/10">
                                <div>
                                    <h4 className="font-semibold text-sm flex items-center gap-2 mb-3 text-muted-foreground">
                                        <Wallet className="w-4 h-4" /> Financeiro - Aluno
                                        <BookingPaymentStatusBadge status={ traineePayment?.paymentStatus || "Pendente" } />

                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between items-center text-muted-foreground">
                                            <span>Valor Base</span>
                                            <span>{formatCurrency(traineeBasePrice)}</span>
                                        </div>
                                        {traineeAdditionalCost > 0 && (
                                            <>
                                                <div className="flex justify-between items-center text-muted-foreground">
                                                    <span>Custos Adicionais</span>
                                                    <span>+ {formatCurrency(traineeAdditionalCost)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-muted-foreground">
                                                    <span>Descrição</span>
                                                    <span>{traineeAdditionalCostDescription     }</span>
                                                </div>
                                            </>
                                        )}
                                        <Separator className="my-2" />
                                        <div className="flex justify-between items-center font-bold">
                                            <span>Total (Aluno)</span>
                                            <span className="text-primary">{formatCurrency(traineeTotalPrice)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Financeiro - Modelo */}
                            {(volunteerTotalPrice > 0 || selectedTraining.Volunteer) && (
                                <div className="flex flex-col gap-3 p-4 rounded-lg border bg-muted/10">
                                    <div>
                                        <h4 className="font-semibold text-sm flex items-center gap-2 mb-3 text-muted-foreground">
                                            <Wallet className="w-4 h-4" /> Financeiro - Modelo
                                            <BookingPaymentStatusBadge status={ volunteerPayment?.paymentStatus || "Pendente" } />

                                        </h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between items-center font-bold">
                                                <span>Total (Modelo)</span>
                                                <span className="text-primary">{formatCurrency(volunteerTotalPrice)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* COLUNA 2: BOTÕES DE AÇÃO (VERTICAL) */}
                        <div className="flex flex-col gap-2 justify-center">
                            {/* BOTÃO 1: ALUNO */}
                            <Button
                                className="flex items-center justify-start gap-2 h-10 w-full"
                                variant="outline"
                                onClick={ () => handleOpenPaymentDialog("TRAINEE") }
                            >
                                <DollarSign className="w-4 h-4 text-orange-600" />
                                <span>Gerenciar pgto. do Aluno</span>
                            </Button>

                            {/* BOTÃO 2: MODELO */}
                            <Button
                                className="flex items-center justify-start gap-2 h-10 w-full"
                                variant="outline"
                                onClick={ () => handleOpenPaymentDialog("VOLUNTEER") }
                            >
                                <DollarSign className="w-4 h-4 text-blue-600" />
                                <span>Gerenciar pgto. do Modelo</span>
                            </Button>

                            <div className="h-px bg-border my-1" />

                            {/* AÇÕES FINAIS */}
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    disabled={ selectedTraining.trainingStatus !== "Pendente" }
                                    variant="destructive"
                                    className="flex items-center justify-center gap-2 w-full"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="sr-only md:not-sr-only">Cancelar</span>
                                </Button>

                                <Button
                                    variant="default"
                                    className="flex items-center justify-center gap-2 w-full"
                                    disabled={
                                        selectedTraining.trainingStatus === "Concluido" ||
                                        selectedTraining.trainingStatus === "Cancelado" ||
                                        traineePayment?.paymentStatus !== "Pago"
                                    }
                                >
                                    <Check className="w-4 h-4" />
                                    <span className="sr-only md:not-sr-only">Concluir</span>
                                </Button>
                            </div>
                        </div>

                    </div>
                </DialogFooter>
            </DialogContent>

            {selectedPayerType && (
                <TrainingPaymentMethodDialog
                    payerType={ selectedPayerType }
                    isTrainingPaymentMethodDialogOpen={ isTrainingPaymentMethodDialogOpen }
                    selectedTraining={ selectedTraining }
                    setIsTrainingPaymentMethodDialogOpen={ setIsTrainingPaymentMethodDialogOpen }
                />
            )}
        </Dialog>
    );
}