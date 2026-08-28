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
  FileText,
  Building,
  Plus,
  X,
  Pencil,
  Copy,
  RefreshCcw,
  ArrowRightLeft,
  Ban,
  History,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { BookingStatusBadge } from "../bookings/common/BookingStatusBadge";
import { BookingPaymentStatusBadge } from "../bookings/common/BookingPaymentStatusBadge";

import {
  TrainingPaymentMethodDialog,
  UpdateTrainingPayload,
} from "./TrainingPaymentMethodDialog";

import { centsToString } from "@/utils/centsToString";
import { Training } from "@/utils/@types/training";
import { TrainingPayment } from "@/utils/@types/payments";
import { CancelTrainingConfirmationDialog } from "./CancelTrainingConfirmationDialog";
import {
  UpdateTraining,
  GetTrainingValueChanges,
} from "@/services/trainings.service";
import {
  canRoleEditConcludedTraining,
  formatEditDeadline,
  getConcludedTrainingEditDeadline,
  hasUnlimitedConcludedTrainingEdit,
  isWithinConcludedTrainingEditWindow,
} from "@/utils/concludedTrainingEdit";
import { toast } from "sonner";
import { FinishTrainingConfirmationDialog } from "./FinishTrainingConfirmationDialog";
import { queryClient } from "@/app/(main)/layout";
import { AddParticipantDialog } from "./AddParticipantDialog";
// import { UpdateParticipantValuesDialog } from "./UpdateParticipantValuesDialog";
import EditTrainingFinancialsDialog from "./EditTrainingFinancialsDialog";
import { EditTrainingDialog } from "./EditTrainingDialog";
import {
  TransferParticipantDialog,
  TransferParticipant,
} from "./TransferParticipantDialog";
import { TrainingEnrollmentsSection } from "./TrainingEnrollmentsSection";
import { useAuth } from "@/contexts/auth-provider";
import { USER_ROLES } from "@/utils/constants";
import { buildRequiredCharges } from "@/utils/trainingCharges";

interface TrainingDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTraining: Training;
  setSelectedTraining?: Dispatch<SetStateAction<Training | null>>;
}

export type PayerType = "TRAINEE" | "VOLUNTEER";

/** Documento sem máscara — é o que liga Volunteer legado e Customer inscrito. */
const onlyDigits = (value?: string | null) => (value ?? "").replace(/\D/g, "");

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
  const [ isUpdateValuesDialogOpen, setIsUpdateValuesDialogOpen ] =
    useState(false);
  const [
    isCancelTrainingConfirmationDialogOpen,
    setCancelTrainingConfirmationDialogOpen,
  ] = useState(false);
  const [
    isFinishTrainingConfirmationDialogOpen,
    setFinishTrainingConfirmationDialogOpen,
  ] = useState(false);
  const [ selectedPayerType, setSelectedPayerType ] = useState<PayerType | null>(
    null,
  );
  const [ currentTrainingStatus, setCurrentTrainingStatus ] = useState(
    selectedTraining?.trainingStatus,
  );

  const [ isAddParticipantDialogOpen, setIsAddParticipantDialogOpen ] =
    useState(false);
  const [ participantTypeToAdd, setParticipantTypeToAdd ] =
    useState<PayerType>("TRAINEE");

  const [ isEditFinancialsDialogOpen, setIsEditFinancialsDialogOpen ] =
    useState(false);
  const [ financialPayerTypeToEdit, setFinancialPayerTypeToEdit ] =
    useState<PayerType>("TRAINEE");

  const [ isEditTrainingDialogOpen, setIsEditTrainingDialogOpen ] =
    useState(false);

  const [ isTransferDialogOpen, setIsTransferDialogOpen ] = useState(false);
  const [ participantToTransfer, setParticipantToTransfer ] =
    useState<TransferParticipant | null>(null);

  const { user } = useAuth();
  const [ isRestoring, setIsRestoring ] = useState(false);

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      const response = await UpdateTraining({
        trainingId: selectedTraining.trainingId,
        body: {
          trainingStatus: selectedTraining.trainingStatus,
          payerType: "TRAINEE",
          isVisible: true,
        },
      });

      if (response && response.data?.isVisible) {
        toast.success("Treinamento restaurado com sucesso.");
        queryClient.invalidateQueries({ queryKey: [ "get-all-trainings" ] });
        if (onOpenChange) onOpenChange(false);
      } else {
        toast.error("Erro ao restaurar treinamento.");
      }
    } catch (error) {
      toast.error("Erro ao restaurar treinamento.");
      console.error(error);
    } finally {
      setIsRestoring(false);
    }
  };

  useEffect(() => {
    setCurrentTrainingStatus(selectedTraining.trainingStatus);
  }, [ selectedTraining ]);

  // --- Extrair os pagamentos do Array (APENAS PARA USO GERAL/LEGADO) ---
  const { traineePayment, volunteerPayment } = useMemo(() => {
    const payments = Array.isArray(selectedTraining.TrainingPayment)
      ? selectedTraining.TrainingPayment
      : [];

    return {
      traineePayment: payments.find(
        (p: TrainingPayment) => p.payerType === "TRAINEE",
      ),
      volunteerPayment: payments.find(
        (p: TrainingPayment) => p.payerType === "VOLUNTEER",
      ),
    };
  }, [ selectedTraining ]);

  // O backfill criou uma inscrição para cada Volunteer sem apagar o vínculo
  // legado, então a mesma pessoa chega pelas duas vias. O documento é o que
  // liga as duas representações — mesma regra usada na contagem de vagas da
  // listagem de treinamentos. Serve para deduplicar a lista de modelos e para
  // não oferecer, na busca, quem já está inscrito.
  const enrolledDocuments = useMemo(
    () =>
      new Set(
        (selectedTraining.Enrollments || [])
          .flatMap((enrollment) => [
            enrollment.Customer?.cpf,
            enrollment.Customer?.cnpj,
          ])
          .map(onlyDigits)
          .filter(Boolean),
      ),
    [ selectedTraining ],
  );

  // Pacientes modelo das duas gerações do modelo de dados: a inscrição
  // unificada (Customer com isModel, usada desde a reformulação) e o registro
  // legado Volunteer, ainda vinculado às turmas antigas. Unificar aqui garante
  // que pagamento, remanejamento e cancelamento existam para os dois casos.
  const modelParticipants = useMemo(() => {
    const payments = Array.isArray(selectedTraining.TrainingPayment)
      ? selectedTraining.TrainingPayment
      : [];

    const fromEnrollments = (selectedTraining.Enrollments || [])
      .filter((enrollment) => enrollment.isModel)
      .map((enrollment) => {
        const payment =
          payments.find((p) => p.enrollmentId === enrollment.enrollmentId) ||
          payments.find((p) => p.customerId === enrollment.customerId);

        return {
          kind: "CUSTOMER" as const,
          id: enrollment.customerId,
          name: enrollment.Customer?.fullname || "Participante",
          // Acumula os dois papéis: aparece também na lista de alunos, e a
          // inscrição (com o pagamento) é uma só.
          isAlsoTrainee: enrollment.isTrainee,
          document:
            enrollment.Customer?.cpf || enrollment.Customer?.cnpj || "N/A",
          cellphone: enrollment.Customer?.cellphone || "N/A",
          payment,
          // Quem também é aluno tem um único pagamento, do tipo TRAINEE: o
          // diálogo financeiro precisa do tipo real para achar o registro.
          payerType: (payment?.payerType ?? "VOLUNTEER") as PayerType,
          // O diálogo financeiro localiza o pagamento pelo id do pagador, que
          // muda conforme a origem do dado: modelo do backfill guarda o
          // volunteerId legado; os demais, o customerId.
          paymentParticipantId:
            payment?.volunteerId ?? payment?.customerId ?? enrollment.customerId,
        };
      });

    const fromVolunteers = (selectedTraining.Volunteers || [])
      .filter((volunteer) => {
        const document = onlyDigits(volunteer.documentNumber);
        return !document || !enrolledDocuments.has(document);
      })
      .map((volunteer) => ({
        kind: "VOLUNTEER" as const,
        id: volunteer.volunteerId,
        name: volunteer.name || "N/A",
        isAlsoTrainee: false,
        document: volunteer.documentNumber || "N/A",
        cellphone: volunteer.cellphone || "N/A",
        payment: payments.find(
          (p) =>
            p.payerType === "VOLUNTEER" &&
            p.volunteerId === volunteer.volunteerId,
        ),
        payerType: "VOLUNTEER" as PayerType,
        paymentParticipantId: volunteer.volunteerId,
      }));

    return [ ...fromEnrollments, ...fromVolunteers ];
  }, [ selectedTraining, enrolledDocuments ]);

  const [ selectedParticipantId, setSelectedParticipantId ] = useState<
    string | null
  >(null);

  const handleOpenPaymentDialog = (type: PayerType, participantId?: string) => {
    setSelectedPayerType(type);
    setSelectedParticipantId(participantId || null);
    setIsTrainingPaymentMethodDialogOpen(true);
  };

  const handleOpenUpdateValuesDialog = (
    type: PayerType,
    participantId?: string,
  ) => {
    setSelectedPayerType(type);
    setSelectedParticipantId(participantId || null);
    setIsUpdateValuesDialogOpen(true);
  };

  const handleOpenEditFinancials = (type: PayerType) => {
    setFinancialPayerTypeToEdit(type);
    setIsEditFinancialsDialogOpen(true);
  };

  const getSafePaymentData = (
    type: PayerType,
    participantId?: string | null,
  ) => {
    const payments = Array.isArray(selectedTraining.TrainingPayment)
      ? selectedTraining.TrainingPayment
      : [];

    // Find specific payment if ID provided
    const payment = participantId
      ? payments.find(
        (p) =>
          p.payerType === type &&
            (type === "TRAINEE"
              ? p.traineeId === participantId || p.customerId === participantId
              : p.volunteerId === participantId),
      )
      : null; // Do NOT default to "first found"

    if (payment) {
      return {
        totalPrice: payment.totalPrice,
        basePrice: payment.basePrice,
        paymentStatus: payment.paymentStatus || "Pendente",
        paymentMode: payment.paymentMode,
        firstPaymentAmount: payment.firstPaymentAmount || 0,
        firstPaymentDate: payment.firstPaymentDate
          ? new Date(payment.firstPaymentDate)
          : null,
        firstPaymentMethod: payment.firstPaymentMethod,
        firstPaymentStatus: payment.firstPaymentStatus,
        secondPaymentAmount: payment.secondPaymentAmount || 0,
        secondPaymentDate: payment.secondPaymentDate
          ? new Date(payment.secondPaymentDate)
          : null,
        secondPaymentMethod: payment.secondPaymentMethod,
        secondPaymentStatus: payment.secondPaymentStatus,
        additionalCost: payment.additionalCost || 0,
        additionalCostDescription: payment.additionalCostDescription || "",
      };
    }

    return {
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
  };

  const handleAddParticipantClick = (type: PayerType) => {
    setParticipantTypeToAdd(type);
    setIsAddParticipantDialogOpen(true);
  };

  const onAddParticipant = async (id: string, justification?: string) => {
    const type = participantTypeToAdd;
    const isTrainee = type === "TRAINEE";
    try {
      // `addedParticipants` é o caminho da inscrição unificada: cria a
      // TrainingEnrollment, o pagamento já vinculado a ela e as cobranças —
      // por isso o participante passa a aparecer na lista de Inscrições e
      // aceita cobrança. O bloco TrainingPayment NÃO vai junto: ele dispararia
      // o upsert legado, criando um pagamento órfão sem inscrição.
      //
      // As cobranças nascem zeradas, na estrutura do tipo de treinamento; o
      // valor é preenchido depois, na própria lista de Inscrições.
      const payload: UpdateTrainingPayload = {
        trainingStatus: selectedTraining.trainingStatus,
        addedParticipants: [
          {
            // Modelo ainda vem da lista legada de Volunteer; o backend resolve
            // o Customer correspondente.
            ...(isTrainee ? { customerId: id } : { volunteerId: id }),
            isTrainee,
            isModel: !isTrainee,
            charges: buildRequiredCharges(
              selectedTraining.trainingType,
              !isTrainee,
            ),
            paymentStatus: "Pendente",
          },
        ],
        // Adicionar participante conta como alteração de valor: num treinamento
        // concluído o backend exige justificativa, que o diálogo coleta.
        ...(justification ? { justification } : {}),
      };

      const response = await UpdateTraining({
        trainingId: selectedTraining.trainingId,
        body: payload,
      });

      if (response && response.statusCode === 200) {
        toast.success("Participante adicionado com  sucesso!");
        queryClient.invalidateQueries({ queryKey: [ "get-all-trainings" ] });
        if (setSelectedTraining && response.data) {
          setSelectedTraining(response.data);
        }
      } else {
        toast.error(response?.message || "Erro ao adicionar participante.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro ao adicionar participante.");
    }
  };

  const onRemoveParticipant = async (
    type: "TRAINEE" | "VOLUNTEER",
    id: string,
  ) => {
    // Buscar status do pagamento
    const payments = Array.isArray(selectedTraining.TrainingPayment)
      ? selectedTraining.TrainingPayment
      : [];
    const participantPayment = payments.find(
      (p) =>
        p.payerType === type &&
        (type === "TRAINEE"
          ? p.traineeId === id || p.customerId === id
          : p.volunteerId === id),
    );

    // Permitir se não tiver pagamento (recém adicionado) ou se status for Pendente
    const paymentStatus = participantPayment?.paymentStatus || "Pendente";

    if (paymentStatus !== "Pendente") {
      toast.error(
        "Não é possível remover participantes com pagamentos processados (diferente de Pendente).",
      );
      return;
    }

    if (!window.confirm("Tem certeza que deseja remover este participante?"))
      return;

    const payload: UpdateTrainingPayload = {
      trainingStatus: selectedTraining.trainingStatus,
      payerType: type,
      traineeId: type === "TRAINEE" ? id : undefined,
      customerId: type === "TRAINEE" ? id : undefined,
      volunteerId: type === "VOLUNTEER" ? id : undefined,
      TrainingPayment: getSafePaymentData(type, id),
      removedTrainees: type === "TRAINEE" ? [ id ] : undefined,
      removedVolunteers: type === "VOLUNTEER" ? [ id ] : undefined,
    };

    try {
      const response = await UpdateTraining({
        trainingId: selectedTraining.trainingId,
        body: payload,
      });
      if (response && response.statusCode === 200) {
        toast.success("Participante removido com sucesso!");
        queryClient.invalidateQueries({ queryKey: [ "get-all-trainings" ] });
        if (setSelectedTraining && response.data) {
          setSelectedTraining(response.data);
        }
      } else {
        toast.error(response?.message || "Erro ao remover participante.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro ao remover participante.");
    }
  };

  // Remoção de uma inscrição unificada (usada pelos pacientes modelo, que podem
  // não ter pagamento do tipo TRAINEE): o payload não leva dados de pagamento,
  // senão o upsert do backend criaria um registro financeiro zerado para quem
  // está justamente saindo da turma.
  const onRemoveEnrollmentParticipant = async (
    customerId: string,
    name: string,
  ) => {
    if (
      !window.confirm(`Tem certeza que deseja remover ${name} do treinamento?`)
    )
      return;

    try {
      const response = await UpdateTraining({
        trainingId: selectedTraining.trainingId,
        body: { removedTrainees: [ customerId ] },
      });
      if (response && response.statusCode === 200) {
        toast.success("Participante removido com sucesso!");
        queryClient.invalidateQueries({ queryKey: [ "get-all-trainings" ] });
        queryClient.invalidateQueries({ queryKey: [ "get-all-goals" ] });
        if (setSelectedTraining && response.data) {
          setSelectedTraining(response.data);
        }
      } else {
        toast.error(response?.message || "Erro ao remover participante.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro ao remover participante.");
    }
  };

  // Cancela apenas a inscrição do participante (aluno ou paciente modelo): ele
  // sai da turma (libera a vaga) e o registro financeiro é mantido com status
  // "Cancelado".
  const onCancelParticipant = async (participant: TransferParticipant) => {
    const { kind, id, name, roleLabel } = participant;

    if (
      !window.confirm(
        `Cancelar a inscrição de ${name ?? "este participante"} neste treinamento? A vaga será liberada e o registro financeiro ficará como "Cancelado".`,
      )
    )
      return;

    try {
      const response = await UpdateTraining({
        trainingId: selectedTraining.trainingId,
        body:
          kind === "CUSTOMER"
            ? { canceledParticipants: [ id ] }
            : { canceledVolunteers: [ id ] },
      });
      if (response && response.statusCode === 200) {
        toast.success(`Inscrição de ${roleLabel.toLowerCase()} cancelada.`);
        queryClient.invalidateQueries({ queryKey: [ "get-all-trainings" ] });
        queryClient.invalidateQueries({ queryKey: [ "get-all-goals" ] });
        if (setSelectedTraining && response.data) {
          setSelectedTraining(response.data);
        }
      } else {
        toast.error(response?.message || "Erro ao cancelar inscrição.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro ao cancelar inscrição.");
    }
  };

  const handleOpenTransferDialog = (participant: TransferParticipant) => {
    setParticipantToTransfer(participant);
    setIsTransferDialogOpen(true);
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
      | null,
  ) => {
    try {
      const targetPayerType = canceledBy || "TRAINEE";
      const targetPayment =
        targetPayerType === "VOLUNTEER" ? volunteerPayment : traineePayment;

      const paymentData = targetPayment
        ? {
          totalPrice: targetPayment.totalPrice,
          basePrice: targetPayment.basePrice,
          paymentStatus:
              trainingStatus === "Cancelado"
                ? "Cancelado"
                : targetPayment.paymentStatus === "Cortesia"
                  ? "Pago"
                  : targetPayment.paymentStatus || "Pendente",
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

      const targetId =
        targetPayerType === "VOLUNTEER"
          ? targetPayment?.volunteerId ||
            selectedTraining.Volunteers?.[0]?.volunteerId
          : targetPayment?.traineeId ||
            targetPayment?.customerId ||
            selectedTraining.Trainees?.[0]?.customerId;

      const payload: UpdateTrainingPayload = {
        trainingStatus,
        payerType: targetPayerType,
        traineeId: targetPayerType === "TRAINEE" ? targetId : undefined,
        customerId: targetPayerType === "TRAINEE" ? targetId : undefined,
        volunteerId: targetPayerType === "VOLUNTEER" ? targetId : undefined,
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
          } com sucesso!`,
        );
        if (setSelectedTraining && response.data) {
          setSelectedTraining(response.data);
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

  // Esta dos para os valores financeiros
  const [ traineeBasePrice, setTraineeBasePrice ] = useState(0);
  const [ traineeAdditionalCost, setTraineeAdditionalCost ] = useState(0);
  const [
    traineeAdditionalCostDescription,
    setTraineeAdditionalCostDescription,
  ] = useState("");
  const [ traineeTotalPrice, setTraineeTotalPrice ] = useState(0);
  const [ volunteerTotalPrice, setVolunteerTotalPrice ] = useState(0);

  // Helper para formatar moeda
  const formatCurrency = (val: number) => `R$ ${centsToString(val)}`;

  // ----- Alteração de treinamento concluído -----
  // Master, Gerente e Comercial podem alterar por até 48h após a conclusão
  // (Master sem prazo). Alterar valores exige justificativa registrada.
  const isConcluded = currentTrainingStatus === "Concluido";
  const concludedEditDeadline = getConcludedTrainingEditDeadline(
    selectedTraining.concludedAt,
  );
  const hasConcludedEditRole = canRoleEditConcludedTraining(user?.role);
  const canEditConcludedTraining =
    isConcluded &&
    hasConcludedEditRole &&
    (hasUnlimitedConcludedTrainingEdit(user?.role) ||
      isWithinConcludedTrainingEditWindow(selectedTraining.concludedAt));

  const canEditParticipants =
    (currentTrainingStatus !== "Concluido" &&
      currentTrainingStatus !== "Cancelado") ||
    canEditConcludedTraining;

  // Alterações de valor num treinamento concluído exigem justificativa.
  const requireValueJustification = canEditConcludedTraining;

  const { data: valueChangesResponse } = useQuery({
    queryKey: [ "get-training-value-changes", selectedTraining.trainingId ],
    queryFn: () => GetTrainingValueChanges(selectedTraining.trainingId),
    enabled: open && !!selectedTraining.trainingId,
    staleTime: 1000 * 30,
  });
  const valueChanges = valueChangesResponse?.data ?? [];

  const handleCopySummary = () => {
    // Calculate start time
    const start = new Date(selectedTraining.dueDate);
    start.setHours(Math.floor(selectedTraining.hourInMinutes / 60));
    start.setMinutes(selectedTraining.hourInMinutes % 60);

    // Format times
    const formatTime = (date: Date) =>
      `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

    const lines = [
      "*Resumo do Treinamento*",
      `Equipamento: ${selectedTraining.Gear.gearName}`,
      `Data: ${new Date(selectedTraining.dueDate).toLocaleDateString("pt-BR")}`,
      `Horário: ${formatTime(start)}`,
      `Endereço: ${selectedTraining.Address.street}, ${selectedTraining.Address.buildingNumber} - ${selectedTraining.Address.neighborhood}, ${selectedTraining.Address.city}/${selectedTraining.Address.state}`,
    ];

    const summary = lines.join("\n");
    navigator.clipboard.writeText(summary);
    toast.success("Resumo copiado para a área de transferência!");
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
                      Math.floor(selectedTraining.hourInMinutes / 60),
                    ).padStart(2, "0")}
                    :
                    {String(selectedTraining.hourInMinutes % 60).padStart(
                      2,
                      "0",
                    )}
                  </span>
                  <span>•</span>
                  <span>
                    {new Date(selectedTraining.dueDate).toLocaleDateString(
                      "pt-BR",
                      { dateStyle: "long" },
                    )}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 ml-auto items-center">
                {canEditParticipants && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 h-8"
                    onClick={ () => setIsEditTrainingDialogOpen(true) }
                  >
                    <Pencil className="h-3 w-3" />
                    <span className="hidden sm:inline">Editar</span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 h-8"
                  onClick={ handleCopySummary }
                >
                  <Copy className="h-3 w-3" />
                  <span className="hidden sm:inline">Copiar Resumo</span>
                </Button>
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
                      (p) => p.cancellationDate,
                    )?.cancellationDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Data do Cancelamento:
                        </span>
                        <span className="font-medium">
                          {new Date(
                            selectedTraining.TrainingPayment.find(
                              (p) => p.cancellationDate,
                            )!.cancellationDate!,
                          ).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    )}

                    {/* Taxa de Cancelamento */}
                    {selectedTraining.TrainingPayment.some(
                      (p) => (p.cancellationFee || 0) > 0,
                    ) ? (
                        selectedTraining.TrainingPayment.filter(
                          (p) => (p.cancellationFee || 0) > 0,
                        ).map((p) => (
                          <div
                            key={ `$ {p.payerType}-${p.traineeId || p.volunteerId}` }
                            className="space-y-2"
                          >
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
                                    p.cancellationFeePaymentDate,
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

            {/* FILIAL E LOCALIZAÇÃO */}
            <div className="space-y-3">
              <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Building className="h-3 w-3" /> Filial e Localização
              </h4>
              <div className="p-4 rounded-lg border bg-muted/20 text-sm space-y-4">
                {/* Filial Info */}
                <div className="flex gap-3 items-center">
                  <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <div className="flex-1">
                    <p className="font-semibold text-base">
                      {selectedTraining.SourceFilial.filialName}
                    </p>
                  </div>
                </div>

                <Separator className="my-3" />

                {/* Address Info */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-green-100 dark:bg-green-900/20">
                    <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {selectedTraining.Address.street},{" "}
                      {selectedTraining.Address.buildingNumber}
                    </p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {selectedTraining.Address.neighborhood} •{" "}
                      {selectedTraining.Address.city}/
                      {selectedTraining.Address.state}
                    </p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      CEP: {selectedTraining.Address.zipCode}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Aviso do prazo de edição de treinamento concluído */}
            {isConcluded && hasConcludedEditRole && (
              <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
                {hasUnlimitedConcludedTrainingEdit(user?.role) ? (
                  "Este treinamento está concluído e pode ser alterado a qualquer momento. Alterações de valor exigem justificativa."
                ) : canEditConcludedTraining && concludedEditDeadline ? (
                  <>
                    Treinamento concluído: pode ser alterado até{ " " }
                    <span className="font-medium text-foreground">
                      {formatEditDeadline(concludedEditDeadline)}
                    </span>
                    . Alterações de valor exigem justificativa.
                  </>
                ) : concludedEditDeadline ? (
                  <>
                    O prazo de 48h para alterar este treinamento concluído
                    expirou em{ " " }
                    <span className="font-medium text-foreground">
                      {formatEditDeadline(concludedEditDeadline)}
                    </span>
                    .
                  </>
                ) : (
                  "O prazo para alterar este treinamento concluído não está disponível."
                )}
              </div>
            )}

            {/* INSCRIÇÕES (papéis + observação + itens de cobrança) */}
            <TrainingEnrollmentsSection
              training={ selectedTraining }
              disabled={ !canEditParticipants }
              requireJustification={ requireValueJustification }
            />

            <Separator />

            {/* 2.5 PARTICIPANTES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Aluno */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <GraduationCap className="h-3 w-3" /> Alunos (
                    {selectedTraining.Trainees?.length || 0})
                  </h4>
                  {canEditParticipants && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs flex gap-1"
                        onClick={ () => handleOpenEditFinancials("TRAINEE") }
                      >
                        <DollarSign className="h-3 w-3 mr-1" />
                        Valores
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs flex gap-1"
                        onClick={ () => handleAddParticipantClick("TRAINEE") }
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {selectedTraining.Trainees?.length ? (
                    selectedTraining.Trainees.map((trainee) => {
                      const payment = selectedTraining.TrainingPayment?.find(
                        (p) =>
                          p.payerType === "TRAINEE" &&
                          (p.traineeId === trainee.customerId ||
                            p.customerId === trainee.customerId),
                      );
                      const isPartialFullyPaid =
                        payment?.paymentStatus === "Parcial" &&
                        payment?.firstPaymentStatus === "Pago" &&
                        payment?.secondPaymentStatus === "Pago";
                      const status = isPartialFullyPaid
                        ? "Pago"
                        : payment?.paymentStatus || "Pendente";
                      const canRemove =
                        canEditParticipants && status === "Pendente";
                      const canCancel =
                        canEditParticipants &&
                        (status === "Pendente" || status === "Parcial");

                      return (
                        <div
                          key={ trainee.customerId }
                          className="p-3 rounded-lg border bg-card flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="h-8 w-8 min-w-[2rem] rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                              <span className="font-bold text-xs text-orange-600">
                                {trainee.fullname?.charAt(0) || "?"}
                              </span>
                            </div>
                            <div className="text-sm overflow-hidden">
                              <p className="font-medium truncate">
                                {trainee.fullname}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <FileText className="h-3 w-3 min-w-[0.75rem]" />{" "}
                                <span className="truncate">
                                  {trainee.cpf || trainee.cnpj}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3 min-w-[0.75rem]" />{" "}
                                <span className="truncate">
                                  {trainee.cellphone}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="ml-auto px-2">
                            <BookingPaymentStatusBadge
                              status={ status }
                              isCourtesy={ payment?.isCourtesy }
                              wasRefunded={ payment?.wasRefunded }
                              small
                            />
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0"
                              onClick={ () =>
                                handleOpenPaymentDialog(
                                  "TRAINEE",
                                  trainee.customerId,
                                )
                              }
                            >
                              <DollarSign className="h-4 w-4 text-orange-600" />
                              <span className="sr-only">
                                Gerenciar Pagamento
                              </span>
                            </Button>
                            {canEditParticipants && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                title="Remanejar para outro treinamento"
                                onClick={ () =>
                                  handleOpenTransferDialog({
                                    kind: "CUSTOMER",
                                    id: trainee.customerId,
                                    name: trainee.fullname,
                                    roleLabel: "Aluno",
                                  })
                                }
                              >
                                <ArrowRightLeft className="h-4 w-4" />
                                <span className="sr-only">Remanejar</span>
                              </Button>
                            )}
                            {canCancel && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 text-amber-600 hover:text-amber-800 hover:bg-amber-50"
                                title="Cancelar inscrição do aluno"
                                onClick={ () =>
                                  onCancelParticipant({
                                    kind: "CUSTOMER",
                                    id: trainee.customerId,
                                    name: trainee.fullname,
                                    roleLabel: "Aluno",
                                  })
                                }
                              >
                                <Ban className="h-4 w-4" />
                                <span className="sr-only">
                                  Cancelar inscrição
                                </span>
                              </Button>
                            )}
                            {canRemove && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={ () =>
                                  onRemoveParticipant(
                                    "TRAINEE",
                                    trainee.customerId,
                                  )
                                }
                              >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Remover</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-muted-foreground italic pl-3">
                      Nenhum aluno vinculado.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <User className="h-3 w-3" /> Pacientes Modelo (
                    {modelParticipants.length})
                  </h4>
                  {canEditParticipants && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={ () => handleOpenEditFinancials("VOLUNTEER") }
                      >
                        <DollarSign className="h-3 w-3 mr-1" /> Valores
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={ () => handleAddParticipantClick("VOLUNTEER") }
                      >
                        <Plus className="h-3 w-3 mr-1" /> Adicionar
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {modelParticipants.length ? (
                    modelParticipants.map((model) => {
                      const payment = model.payment;
                      const isPartialFullyPaid =
                        payment?.paymentStatus === "Parcial" &&
                        payment?.firstPaymentStatus === "Pago" &&
                        payment?.secondPaymentStatus === "Pago";
                      const status = isPartialFullyPaid
                        ? "Pago"
                        : payment?.paymentStatus || "Pendente";
                      const canRemove =
                        canEditParticipants && status === "Pendente";
                      const canCancel =
                        canEditParticipants &&
                        (status === "Pendente" || status === "Parcial");
                      const transferTarget: TransferParticipant = {
                        kind: model.kind,
                        id: model.id,
                        name: model.name,
                        roleLabel: "Paciente Modelo",
                      };

                      return (
                        <div
                          key={ `${model.kind}-${model.id}` }
                          className="p-3 rounded-lg border bg-card flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="h-8 w-8 min-w-[2rem] rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="font-bold text-xs text-primary">
                                {model.name?.charAt(0) || "?"}
                              </span>
                            </div>
                            <div className="text-sm overflow-hidden">
                              <p className="font-medium truncate flex items-center gap-2">
                                {model.name}
                                {model.isAlsoTrainee && (
                                  <span className="text-[10px] font-normal px-1.5 py-0.5 rounded border text-muted-foreground shrink-0">
                                    também aluno
                                  </span>
                                )}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <FileText className="h-3 w-3 min-w-[0.75rem]" />{" "}
                                <span className="truncate">
                                  {model.document}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3 min-w-[0.75rem]" />{" "}
                                <span className="truncate">
                                  {model.cellphone}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="ml-auto px-2">
                            <BookingPaymentStatusBadge
                              status={ status }
                              isCourtesy={ payment?.isCourtesy }
                              wasRefunded={ payment?.wasRefunded }
                              small
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0"
                              onClick={ () =>
                                handleOpenPaymentDialog(
                                  model.payerType,
                                  model.paymentParticipantId,
                                )
                              }
                            >
                              <DollarSign className="h-4 w-4 text-blue-600" />
                              <span className="sr-only">
                                Gerenciar Pagamento
                              </span>
                            </Button>
                            {canEditParticipants && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                title="Remanejar para outro treinamento"
                                onClick={ () =>
                                  handleOpenTransferDialog(transferTarget)
                                }
                              >
                                <ArrowRightLeft className="h-4 w-4" />
                                <span className="sr-only">Remanejar</span>
                              </Button>
                            )}
                            {canCancel && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 text-amber-600 hover:text-amber-800 hover:bg-amber-50"
                                title="Cancelar inscrição do paciente modelo"
                                onClick={ () =>
                                  onCancelParticipant(transferTarget)
                                }
                              >
                                <Ban className="h-4 w-4" />
                                <span className="sr-only">
                                  Cancelar inscrição
                                </span>
                              </Button>
                            )}
                            {canRemove && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={ () =>
                                  model.kind === "VOLUNTEER"
                                    ? onRemoveParticipant("VOLUNTEER", model.id)
                                    : onRemoveEnrollmentParticipant(
                                      model.id,
                                      model.name,
                                    )
                                }
                              >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Remover</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-muted-foreground italic pl-3">
                      Nenhum modelo vinculado.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {valueChanges.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <History className="h-3 w-3" /> Histórico de alterações de
                    valor
                  </h4>
                  <div className="space-y-3">
                    {valueChanges.map((change) => (
                      <div
                        key={ change.id }
                        className="rounded-md border bg-muted/20 p-3 text-sm space-y-1"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-medium">
                            {change.changedByName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(change.createdAt).toLocaleDateString(
                              "pt-BR",
                            )}{" "}
                            às{" "}
                            {new Date(change.createdAt).toLocaleTimeString(
                              "pt-BR",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground line-through">
                            {formatCurrency(change.previousTotalPrice)}
                          </span>
                          <span>→</span>
                          <span className="font-semibold text-primary">
                            {formatCurrency(change.newTotalPrice)}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap break-words text-muted-foreground">
                          {change.justification}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />
          </div>
        </div>

        <DialogFooter className="sm:justify-end gap-2 w-full">
          <div className="flex items-center gap-2">
            <Button
              disabled={ currentTrainingStatus !== "Pendente" }
              variant="destructive"
              className="flex items-center justify-center gap-2"
              onClick={ () => setCancelTrainingConfirmationDialogOpen(true) }
            >
              <Trash2 className="w-4 h-4" />
              <span className="sr-only md:not-sr-only">Cancelar</span>
            </Button>

            <Button
              variant="default"
              className="flex items-center justify-center gap-2"
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
          participantId={ selectedParticipantId }
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

      <AddParticipantDialog
        open={ isAddParticipantDialogOpen }
        onOpenChange={ setIsAddParticipantDialogOpen }
        type={ participantTypeToAdd }
        onAdd={ onAddParticipant }
        filialId={ selectedTraining.sourceFilialId }
        requireJustification={ requireValueJustification }
        // Quem já está inscrito não deve ser oferecido de novo. Aluno casa por
        // customerId; modelo vem da lista legada de Volunteer, cujo id não
        // compara com o da inscrição — aí o documento é o elo.
        excludeIds={ [
          ...(selectedTraining.Enrollments?.map((e) => e.customerId) || []),
          ...(selectedTraining.Trainees?.map((t) => t.customerId) || []),
          ...(selectedTraining.Volunteers?.map((v) => v.volunteerId) || []),
        ] }
        excludeDocuments={ [ ...enrolledDocuments ] }
      />

      <EditTrainingFinancialsDialog
        open={ isEditFinancialsDialogOpen }
        onOpenChange={ setIsEditFinancialsDialogOpen }
        training={ selectedTraining }
        payerType={ financialPayerTypeToEdit }
        requireJustification={ requireValueJustification }
        onSuccess={ (updated) => {
          if (setSelectedTraining) {
            setSelectedTraining(updated);
          }
        } }
      />

      <EditTrainingDialog
        open={ isEditTrainingDialogOpen }
        onOpenChange={ setIsEditTrainingDialogOpen }
        selectedTraining={ selectedTraining }
        setSelectedTraining={ setSelectedTraining }
      />

      <TransferParticipantDialog
        open={ isTransferDialogOpen }
        onOpenChange={ (value) => {
          setIsTransferDialogOpen(value);
          if (!value) setParticipantToTransfer(null);
        } }
        sourceTraining={ selectedTraining }
        participant={ participantToTransfer }
        onSuccess={ (updated) => {
          if (setSelectedTraining) {
            setSelectedTraining(updated);
          }
        } }
      />
    </Dialog>
  );
}
