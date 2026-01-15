import { Dispatch, SetStateAction, useEffect, useState, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  User,
  MapPin,
  Calendar,
  Clock,
  Phone,
  GraduationCap,
  DollarSign,
  Check,
  Trash2,
  Wallet,
  FileText,
  Pencil,
  Building,
} from "lucide-react";

import { BookingStatusBadge } from "../bookings/common/BookingStatusBadge";
import { BookingPaymentStatusBadge } from "../bookings/common/BookingPaymentStatusBadge";
import {
  TrainingPaymentMethodDialog,
  UpdateTrainingPayload,
} from "./TrainingPaymentMethodDialog";
import EditTrainingFinancialsDialog from "./EditTrainingFinancialsDialog";
import { centsToString } from "@/utils/centsToString";
import { Training } from "@/utils/@types/training";
import { TrainingPayment } from "@/utils/@types/payments";
import { CancelTrainingConfirmationDialog } from "./CancelTrainingConfirmationDialog";
import { UpdateTraining } from "@/services/trainings.service";
import { toast } from "sonner";
import { FinishTrainingConfirmationDialog } from "./FinishTrainingConfirmationDialog";
import { queryClient } from "@/app/(main)/layout";

interface TrainingDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTraining: Training;
  setSelectedTraining?: Dispatch<SetStateAction<Training | null>>;
}

export type PayerType = "TRAINEE" | "VOLUNTEER";

export function TrainingDetailsDialog({
  open,
  onOpenChange,
  selectedTraining,
  setSelectedTraining,
}: TrainingDetailsDialogProps) {
  const [
    isTrainingPaymentMethodDialogOpen,
    setIsTrainingPaymentMethodDialogOpen,
  ] = useState(false);
  const [
    isCancelTrainingConfirmationDialogOpen,
    setCancelTrainingConfirmationDialogOpen,
  ] = useState(false);
  const [
    isFinishTrainingConfirmationDialogOpen,
    setFinishTrainingConfirmationDialogOpen,
  ] = useState(false);
  const [ selectedPayerType, setSelectedPayerType ] = useState<PayerType | null>(
    null
  );
  const [ currentTrainingStatus, setCurrentTrainingStatus ] = useState(
    selectedTraining?.trainingStatus
  );

  useEffect(() => {
    setCurrentTrainingStatus(selectedTraining.trainingStatus);
  }, [ selectedTraining ]);

  const [ isFinancialEditDialogOpen, setIsFinancialEditDialogOpen ] =
    useState(false);
  const [ financialEditPayerType, setFinancialEditPayerType ] =
    useState<PayerType>("TRAINEE");

  const handleOpenFinancialEdit = (type: PayerType) => {
    setFinancialEditPayerType(type);
    setIsFinancialEditDialogOpen(true);
  };

  const handleSuccessFinancialEdit = (updated: Training) => {
    if (setSelectedTraining) {
      setSelectedTraining(updated);
    }
  };

  // --- Extrair os pagamentos do Array ---
  const { traineePayment, volunteerPayment } = useMemo(() => {
    const payments = Array.isArray(selectedTraining.TrainingPayment)
      ? selectedTraining.TrainingPayment
      : [];

    return {
      traineePayment: payments.find(
        (p: TrainingPayment) => p.payerType === "TRAINEE"
      ),
      volunteerPayment: payments.find(
        (p: TrainingPayment) => p.payerType === "VOLUNTEER"
      ),
    };
  }, [ selectedTraining ]);

  const handleOpenPaymentDialog = (type: PayerType) => {
    setSelectedPayerType(type);
    setIsTrainingPaymentMethodDialogOpen(true);
  };

  const handleUpdateTrainingStatus = async (
    trainingId: string,
    trainingStatus: "Concluido" | "Cancelado",
    wasRefunded?: boolean,
    cancellationFee?: number | null,
    canceledBy?: "TRAINEE" | "VOLUNTEER",
    cancellationDate?: Date | null,
    cancellationFeePaymentDate?: Date | null,
    cancellationFeePaymentMethod?:
      | "PIX"
      | "Transferencia"
      | "Debito"
      | "Credito"
      | "Dinheiro"
      | null
  ) => {
    try {
      const targetPayerType = canceledBy || "TRAINEE";
      const targetPayment =
        targetPayerType === "VOLUNTEER" ? volunteerPayment : traineePayment;

      const paymentData = targetPayment
        ? {
          totalPrice: targetPayment.totalPrice,
          basePrice: targetPayment.basePrice,
          paymentStatus: targetPayment.paymentStatus || "Pendente",
          paymentMode: targetPayment.paymentMode,
          firstPaymentAmount: targetPayment.firstPaymentAmount || 0,
          firstPaymentDate: targetPayment.firstPaymentDate
            ? new Date(targetPayment.firstPaymentDate)
            : null,
          firstPaymentMethod: targetPayment.firstPaymentMethod,
          firstPaymentStatus: targetPayment.firstPaymentStatus,
          secondPaymentAmount: targetPayment.secondPaymentAmount || 0,
          secondPaymentDate: targetPayment.secondPaymentDate
            ? new Date(targetPayment.secondPaymentDate)
            : null,
          secondPaymentMethod: targetPayment.secondPaymentMethod,
          secondPaymentStatus: targetPayment.secondPaymentStatus,
          additionalCost: targetPayment.additionalCost || 0,
          additionalCostDescription:
              targetPayment.additionalCostDescription || "",
        }
        : {
          paymentStatus: "Pendente" as const,
          paymentMode: "AVista" as const,
          totalPrice: 0,
          basePrice: 0,
          firstPaymentAmount: 0,
          firstPaymentDate: null,
          firstPaymentMethod: null,
          firstPaymentStatus: "Pendente" as const,
          secondPaymentAmount: 0,
          secondPaymentDate: null,
          secondPaymentMethod: null,
          secondPaymentStatus: "Pendente" as const,
          additionalCost: 0,
          additionalCostDescription: "",
        };

      const payload: UpdateTrainingPayload = {
        trainingStatus,
        payerType: canceledBy || "TRAINEE",
        TrainingPayment: paymentData,
        isCourtesy: traineePayment?.isCourtesy ?? false,
        wasRefunded: wasRefunded || false,
        cancellationFee: cancellationFee || undefined,
        canceledBy: canceledBy,
        cancellationDate: cancellationDate,
        cancellationFeePaymentDate: cancellationFeePaymentDate,
        cancellationFeePaymentMethod: cancellationFeePaymentMethod,
      };

      const response = await UpdateTraining({ trainingId, body: payload });

      if (response && response.statusCode === 200) {
        toast.success(
          `Treinamento ${
            trainingStatus === "Cancelado" ? "cancelado" : "concluído"
          } com sucesso!`
        );
        if (setSelectedTraining) {
          setSelectedTraining((prev) =>
            prev
              ? {
                ...prev,
                trainingStatus,
                wasRefunded: wasRefunded || false,
                TrainingPayment: prev.TrainingPayment.map((p) => {
                  if (p.payerType === (canceledBy || "TRAINEE")) {
                    return {
                      ...p,
                      // We strictly update the fields that changed
                      cancellationFee: cancellationFee || null,
                      cancellationDate:
                          cancellationDate?.toISOString() || null,
                      cancellationFeePaymentDate:
                          cancellationFeePaymentDate?.toISOString() || null,
                      cancellationFeePaymentMethod:
                          cancellationFeePaymentMethod || null,
                    };
                  }
                  return p;
                }),
              }
              : null
          );
        }
        queryClient.invalidateQueries({ queryKey: [ "get-all-trainings" ] });
        queryClient.invalidateQueries({ queryKey: [ "get-all-goals" ] });
        onOpenChange(false);
      } else {
        toast.warning(response.message || "Erro ao atualizar status.");
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status do treinamento.");
    }
  };

  // Estados para os valores financeiros
  const [ traineeBasePrice, setTraineeBasePrice ] = useState(0);
  const [ traineeAdditionalCost, setTraineeAdditionalCost ] = useState(0);
  const [
    traineeAdditionalCostDescription,
    setTraineeAdditionalCostDescription,
  ] = useState("");
  const [ traineeTotalPrice, setTraineeTotalPrice ] = useState(0);
  const [ volunteerTotalPrice, setVolunteerTotalPrice ] = useState(0);

  // Atualiza os estados quando o selectedTraining mudar
  useEffect(() => {
    if (traineePayment) {
      setTraineeBasePrice(traineePayment.basePrice || 0);
      setTraineeAdditionalCost(traineePayment.additionalCost || 0);
      setTraineeAdditionalCostDescription(
        traineePayment.additionalCostDescription || ""
      );
      setTraineeTotalPrice(traineePayment.totalPrice || 0);
    } else {
      setTraineeBasePrice(0);
      setTraineeAdditionalCost(0);
      setTraineeAdditionalCostDescription("");
      setTraineeTotalPrice(0);
    }

    if (volunteerPayment) {
      setVolunteerTotalPrice(volunteerPayment.totalPrice || 0);
    } else {
      setVolunteerTotalPrice(0);
    }
  }, [ traineePayment, volunteerPayment ]);

  // Helper para formatar moeda
  const formatCurrency = (val: number) => `R$ ${centsToString(val)}`;

  // Callback para atualizar o estado financeiro imediatamente
  const handleFinancialUpdate = (values: {
    basePrice: number;
    additionalCost: number;
    additionalCostDescription: string;
    totalPrice: number;
  }) => {
    if (financialEditPayerType === "TRAINEE") {
      setTraineeBasePrice(values.basePrice);
      setTraineeAdditionalCost(values.additionalCost);
      setTraineeAdditionalCostDescription(values.additionalCostDescription);
      setTraineeTotalPrice(values.totalPrice);
    } else if (financialEditPayerType === "VOLUNTEER") {
      // Volunteers might only use total price in this logic, but if needed we can map others
      // For now, based on the dialog logic, it sends all 4 fields.
      // If volunteer logic differs, adapt here. Assuming similar structure:
      setVolunteerTotalPrice(values.totalPrice);
    }
  };

  return (
    <Dialog open={ open } onOpenChange={ onOpenChange }>
      <DialogContent className="max-h-[90vh] w-[90vw] md:w-[900px] overflow-hidden flex flex-col dark:bg-gray-900">
        <DialogHeader className="px-1">
          <DialogTitle className="text-xl">Detalhes do Treinamento</DialogTitle>
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
                <h3 className="text-lg font-bold">
                  {selectedTraining.Gear.gearName}
                </h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {String(
                      Math.floor(selectedTraining.hourInMinutes / 60)
                    ).padStart(2, "0")}
                    :
                    {String(selectedTraining.hourInMinutes % 60).padStart(
                      2,
                      "0"
                    )}
                  </span>
                  <span>•</span>
                  <span>
                    {new Date(selectedTraining.dueDate).toLocaleDateString(
                      "pt-BR",
                      { dateStyle: "long" }
                    )}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 ml-auto items-center">
                <BookingStatusBadge status={ currentTrainingStatus } />
              </div>
            </div>

            <Separator />

            {/* 4. RESUMO DO CANCELAMENTO */}
            {selectedTraining.trainingStatus === "Cancelado" && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-medium text-xs text-red-600 uppercase tracking-wider flex items-center gap-2">
                    <Trash2 className="h-3 w-3" /> Detalhes do Cancelamento
                  </h4>
                  <div className="p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 text-sm space-y-2">
                    {/* Data do Cancelamento */}
                    {selectedTraining.TrainingPayment.find(
                      (p) => p.cancellationDate
                    )?.cancellationDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Data do Cancelamento:
                        </span>
                        <span className="font-medium">
                          {new Date(
                            selectedTraining.TrainingPayment.find(
                              (p) => p.cancellationDate
                            )!.cancellationDate!
                          ).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    )}

                    {/* Taxa de Cancelamento */}
                    {selectedTraining.TrainingPayment.some(
                      (p) => (p.cancellationFee || 0) > 0
                    ) ? (
                        selectedTraining.TrainingPayment.filter(
                          (p) => (p.cancellationFee || 0) > 0
                        ).map((p, index) => (
                          <div key={ index } className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                              Taxa (
                                {p.payerType === "TRAINEE" ? "Aluno" : "Modelo"}):
                              </span>
                              <span className="font-bold text-red-600">
                                {formatCurrency(p.cancellationFee || 0)}
                              </span>
                            </div>

                            {p.cancellationFeePaymentDate && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                Data Pagamento Taxa:
                                </span>
                                <span className="font-medium">
                                  {new Date(
                                    p.cancellationFeePaymentDate
                                  ).toLocaleDateString("pt-BR")}
                                </span>
                              </div>
                            )}

                            {p.cancellationFeePaymentMethod && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                Método Pagamento Taxa:
                                </span>
                                <span className="font-medium">
                                  {p.cancellationFeePaymentMethod}
                                </span>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                          Taxa de Cancelamento:
                          </span>
                          <span className="font-medium text-green-600">
                          Isento / Não aplicada
                          </span>
                        </div>
                      )}

                    {/* Reembolso */}
                    {selectedTraining.wasRefunded && (
                      <div className="flex justify-between items-center pt-2 border-t border-red-200 dark:border-red-900/30">
                        <span className="text-muted-foreground font-medium">
                          Reembolso Efetuado
                        </span>
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

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
                    <span className="font-bold text-xs text-orange-600">
                      {selectedTraining.Trainee.name.charAt(0)}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">
                      {selectedTraining.Trainee.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FileText className="h-3 w-3" />{" "}
                      {selectedTraining.Trainee.documentNumber || "N/A"}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />{" "}
                      {selectedTraining.Trainee.cellphone || "N/A"}
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
                    <span className="font-bold text-xs text-primary">
                      {selectedTraining.Volunteer.name.charAt(0)}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">
                      {selectedTraining.Volunteer.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FileText className="h-3 w-3" />{" "}
                      {selectedTraining.Volunteer.documentNumber || "N/A"}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />{" "}
                      {selectedTraining.Volunteer.cellphone || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* 2.5 FILIAL */}
            <div className="space-y-3">
              <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Building className="h-3 w-3" /> Unidade / Filial
              </h4>
              <div className="p-4 rounded-lg border bg-muted/20 text-sm">
                <p className="font-medium">
                  {selectedTraining.SourceFilial.filialName}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <FileText className="h-3 w-3" />
                  CNPJ: {selectedTraining.SourceFilial.CNPJ}
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
                  {selectedTraining.Address.Street.streetName},{" "}
                  {selectedTraining.Address.buildingNumber}
                </p>
                <p className="text-muted-foreground mt-1">
                  {selectedTraining.Address.Neighborhood.neighborhoodName} -{" "}
                  {selectedTraining.Address.City.cityName}/
                  {selectedTraining.Address.State.UF}
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
                  <h4 className="font-semibold text-sm flex items-center justify-between gap-2 mb-3 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4" /> Financeiro - Aluno
                      <BookingPaymentStatusBadge
                        status={ traineePayment?.paymentStatus || "Pendente" }
                        isCourtesy={ traineePayment?.isCourtesy }
                        wasRefunded={ traineePayment?.wasRefunded }
                      />
                    </div>
                    {traineePayment?.paymentStatus === "Pendente" &&
                      currentTrainingStatus !== "Cancelado" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={ () => handleOpenFinancialEdit("TRAINEE") }
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    )}
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
                          <span>{traineeAdditionalCostDescription}</span>
                        </div>
                      </>
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between items-center font-bold">
                      <span>Total (Aluno)</span>
                      <span className="text-primary">
                        {formatCurrency(traineeTotalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Financeiro - Modelo */}
              {(volunteerTotalPrice > 0 || selectedTraining.Volunteer) && (
                <div className="flex flex-col gap-3 p-4 rounded-lg border bg-muted/10">
                  <div>
                    <h4 className="font-semibold text-sm flex items-center justify-between gap-2 mb-3 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4" /> Financeiro - Modelo
                        <BookingPaymentStatusBadge
                          status={ volunteerPayment?.paymentStatus || "Pendente" }
                          isCourtesy={ volunteerPayment?.isCourtesy }
                          wasRefunded={ volunteerPayment?.wasRefunded }
                        />
                      </div>
                      {volunteerPayment?.paymentStatus === "Pendente" &&
                        currentTrainingStatus !== "Cancelado" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={ () => handleOpenFinancialEdit("VOLUNTEER") }
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      )}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center font-bold">
                        <span>Total (Modelo)</span>
                        <span className="text-primary">
                          {formatCurrency(volunteerTotalPrice)}
                        </span>
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
                disabled={ currentTrainingStatus === "Cancelado" }
                onClick={ () => handleOpenPaymentDialog("TRAINEE") }
              >
                <DollarSign className="w-4 h-4 text-orange-600" />
                <span>Gerenciar pgto. do Aluno</span>
              </Button>

              {/* BOTÃO 2: MODELO */}
              <Button
                className="flex items-center justify-start gap-2 h-10 w-full"
                variant="outline"
                disabled={ currentTrainingStatus === "Cancelado" }
                onClick={ () => handleOpenPaymentDialog("VOLUNTEER") }
              >
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span>Gerenciar pgto. do Modelo</span>
              </Button>

              <div className="h-px bg-border my-1" />

              {/* AÇÕES FINAIS */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  disabled={ currentTrainingStatus !== "Pendente" }
                  variant="destructive"
                  className="flex items-center justify-center gap-2 w-full"
                  onClick={ () => setCancelTrainingConfirmationDialogOpen(true) }
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="sr-only md:not-sr-only">Cancelar</span>
                </Button>

                <Button
                  variant="default"
                  className="flex items-center justify-center gap-2 w-full"
                  disabled={
                    selectedTraining.trainingStatus === "Concluido" ||
                    selectedTraining.trainingStatus === "Cancelado"
                  }
                  onClick={ () => setFinishTrainingConfirmationDialogOpen(true) }
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
          key={ selectedPayerType }
          payerType={ selectedPayerType }
          isTrainingPaymentMethodDialogOpen={ isTrainingPaymentMethodDialogOpen }
          selectedTraining={ selectedTraining }
          setSelectedTraining={ setSelectedTraining }
          setIsTrainingPaymentMethodDialogOpen={
            setIsTrainingPaymentMethodDialogOpen
          }
          traineeTotalPrice={ traineeTotalPrice }
          volunteerTotalPrice={ volunteerTotalPrice }
        />
      )}

      <CancelTrainingConfirmationDialog
        isCancelTrainingConfirmationDialogOpen={
          isCancelTrainingConfirmationDialogOpen
        }
        setCancelTrainingConfirmationDialogOpen={
          setCancelTrainingConfirmationDialogOpen
        }
        setCurrentTrainingStatus={ setCurrentTrainingStatus }
        selectedTraining={ selectedTraining }
        setSelectedTraining={ setSelectedTraining }
        handleUpdateTrainingStatus={ handleUpdateTrainingStatus }
      />

      <FinishTrainingConfirmationDialog
        isFinishTrainingConfirmationDialogOpen={
          isFinishTrainingConfirmationDialogOpen
        }
        setFinishTrainingConfirmationDialogOpen={
          setFinishTrainingConfirmationDialogOpen
        }
        setCurrentTrainingStatus={ setCurrentTrainingStatus }
        selectedTraining={ selectedTraining }
        handleUpdateTrainingStatus={ handleUpdateTrainingStatus }
      />

      <EditTrainingFinancialsDialog
        open={ isFinancialEditDialogOpen }
        onOpenChange={ setIsFinancialEditDialogOpen }
        training={ selectedTraining }
        payerType={ financialEditPayerType }
        onSuccess={ handleSuccessFinancialEdit }
        onFinancialUpdate={ handleFinancialUpdate }
        currentValues={
          financialEditPayerType === "TRAINEE"
            ? {
              basePrice: traineeBasePrice,
              additionalCost: traineeAdditionalCost,
              additionalCostDescription: traineeAdditionalCostDescription,
              totalPrice: traineeTotalPrice,
            }
            : {
              basePrice: 0, // Volunteers might not check basePrice but we pass 0
              additionalCost: 0,
              additionalCostDescription: "",
              totalPrice: volunteerTotalPrice,
            }
        }
      />
    </Dialog>
  );
}
