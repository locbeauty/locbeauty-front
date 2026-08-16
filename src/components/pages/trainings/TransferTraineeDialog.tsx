"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowRightLeft,
  Building,
  CalendarIcon,
  CheckCircle2,
  Clock,
  Loader2,
  Package,
  Users,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { GetAllTrainings, UpdateTraining } from "@/services/trainings.service";
import { queryClient } from "@/app/(main)/layout";
import { Training } from "@/utils/@types/training";
import { ApiResponse } from "@/lib/api";

interface TransferTraineeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceTraining: Training;
  customerId: string | null;
  customerName?: string;
  onSuccess?: (updatedSourceTraining: Training) => void;
}

const formatHour = (hourInMinutes: number) =>
  `${String(Math.floor(hourInMinutes / 60)).padStart(2, "0")}:${String(
    hourInMinutes % 60,
  ).padStart(2, "0")}`;

export function TransferTraineeDialog({
  open,
  onOpenChange,
  sourceTraining,
  customerId,
  customerName,
  onSuccess,
}: TransferTraineeDialogProps) {
  const [ targetTrainingId, setTargetTrainingId ] = useState<string | null>(null);
  const [ isTransferring, setIsTransferring ] = useState(false);

  const { data, isLoading } = useQuery<ApiResponse<Training[]>, Error>({
    queryKey: [ "transfer-target-trainings" ],
    queryFn: () => GetAllTrainings("true"),
    enabled: open,
    staleTime: 0,
  });

  const candidateTrainings = useMemo(() => {
    const trainings = Array.isArray(data?.data) ? data.data : [];
    return trainings
      .filter(
        (t) =>
          t.trainingId !== sourceTraining.trainingId &&
          t.trainingStatus === "Pendente",
      )
      .sort(
        (a, b) =>
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
      );
  }, [ data, sourceTraining.trainingId ]);

  const handleTransfer = async () => {
    if (!customerId || !targetTrainingId) return;

    setIsTransferring(true);
    try {
      const response = await UpdateTraining({
        trainingId: sourceTraining.trainingId,
        body: {
          transferredParticipants: [ { customerId, targetTrainingId } ],
        },
      });

      if (response && response.statusCode === 200) {
        toast.success("Aluno remanejado com sucesso!", {
          style: { fontSize: "1rem" },
        });
        queryClient.invalidateQueries({ queryKey: [ "get-all-trainings" ] });
        queryClient.invalidateQueries({ queryKey: [ "get-all-goals" ] });
        if (onSuccess && response.data) {
          onSuccess(response.data);
        }
        onOpenChange(false);
      } else {
        toast.error(response?.message || "Erro ao remanejar aluno.", {
          style: { fontSize: "1rem" },
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao remanejar aluno.", { style: { fontSize: "1rem" } });
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <Dialog
      open={ open }
      onOpenChange={ (value) => {
        if (!value) setTargetTrainingId(null);
        onOpenChange(value);
      } }
    >
      <DialogContent className="max-h-[90vh] w-[90vw] md:w-[650px] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" /> Remanejar Aluno
          </DialogTitle>
          <DialogDescription>
            Selecione o treinamento de destino
            {customerName ? ` para ${customerName}` : ""}. A inscrição e os
            pagamentos (com as cobranças) serão movidos para a nova turma.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {isLoading && (
            <p className="text-sm text-muted-foreground italic">
              Carregando treinamentos...
            </p>
          )}

          {!isLoading && candidateTrainings.length === 0 && (
            <div className="p-8 text-center border dashed rounded-lg text-muted-foreground text-sm">
              Nenhum treinamento pendente disponível para remanejamento.
            </div>
          )}

          {candidateTrainings.map((training) => {
            const enrolledCount = training.Enrollments?.length || 0;
            const capacity = training.capacity ?? 15;
            const isFull = enrolledCount >= capacity;
            const alreadyEnrolled = Boolean(
              customerId &&
                training.Enrollments?.some(
                  (e) => e.customerId === customerId,
                ),
            );
            const isSelected = targetTrainingId === training.trainingId;
            const disabled = isFull || alreadyEnrolled;

            return (
              <button
                type="button"
                key={ training.trainingId }
                disabled={ disabled }
                onClick={ () => setTargetTrainingId(training.trainingId) }
                className={ `w-full text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/40 bg-primary/5"
                    : "bg-card hover:bg-muted/40"
                } ${disabled ? "opacity-50 cursor-not-allowed" : ""}` }
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1 overflow-hidden">
                    <p className="font-medium text-sm flex items-center gap-2 truncate">
                      <Package className="h-3 w-3 min-w-[0.75rem]" />
                      {training.Gear?.gearName || "Equipamento"}
                      <Badge variant="outline" className="text-[10px]">
                        {training.trainingType === "MPT" ? "MPT" : "Comum"}
                      </Badge>
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {new Date(training.dueDate).toLocaleDateString("pt-BR")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatHour(training.hourInMinutes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {training.SourceFilial?.filialName || "—"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {enrolledCount}/{capacity}
                        {isFull && " (lotado)"}
                        {alreadyEnrolled && " (já inscrito)"}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={ () => onOpenChange(false) }
            disabled={ isTransferring }
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={ handleTransfer }
            disabled={ isTransferring || !targetTrainingId || !customerId }
          >
            {isTransferring ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowRightLeft className="mr-2 h-4 w-4" />
            )}
            Remanejar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
