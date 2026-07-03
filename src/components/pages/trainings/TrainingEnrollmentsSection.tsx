"use client";

import { useState } from "react";
import { Plus, Save, Trash2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PriceInput from "@/components/shared/PriceInput";

import { UpdateTraining } from "@/services/trainings.service";
import { queryClient } from "@/app/(main)/layout";
import { parseStringToCents } from "@/utils/parseStringToCents";
import { centsToString } from "@/utils/centsToString";
import { toast } from "sonner";

import { Training, TrainingEnrollment } from "@/utils/@types/training";
import {
  TrainingCharge,
  TrainingChargeKind,
} from "@/utils/@types/payments";

interface Props {
  training: Training;
  disabled?: boolean;
}

interface ChargeRow {
  kind: TrainingChargeKind;
  description: string;
  value: string; // reais (mascarado)
  isRequired: boolean;
}

const KIND_LABEL: Record<TrainingChargeKind, string> = {
  BASE: "Valor base",
  GARANTIA_VAGA: "Garantia de vaga",
  DISPAROS: "Disparos",
  EXTRA: "Cobrança adicional",
};

export function TrainingEnrollmentsSection({ training, disabled }: Props) {
  const enrollments = training.Enrollments || [];

  if (enrollments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
        <Users className="h-3 w-3" /> Inscrições ({enrollments.length}/
        {training.capacity ?? 15})
      </h4>
      <div className="space-y-3">
        {enrollments.map((enrollment) => (
          <EnrollmentCard
            key={ enrollment.enrollmentId }
            training={ training }
            enrollment={ enrollment }
            disabled={ disabled }
          />
        ))}
      </div>
    </div>
  );
}

function EnrollmentCard({
  training,
  enrollment,
  disabled,
}: {
  training: Training;
  enrollment: TrainingEnrollment;
  disabled?: boolean;
}) {
  const payment =
    training.TrainingPayment?.find(
      (p) => p.enrollmentId === enrollment.enrollmentId,
    ) ||
    training.TrainingPayment?.find(
      (p) => p.customerId === enrollment.customerId,
    );

  const initialCharges: ChargeRow[] = (payment?.TrainingCharge || []).map(
    (c: TrainingCharge) => ({
      kind: c.kind,
      description: c.description,
      value: centsToString(c.amountCents || 0),
      isRequired: c.isRequired ?? c.kind !== "EXTRA",
    }),
  );

  const [ observations, setObservations ] = useState(
    enrollment.observations ?? "",
  );
  const [ charges, setCharges ] = useState<ChargeRow[]>(initialCharges);
  const [ savingObs, setSavingObs ] = useState(false);
  const [ savingCharges, setSavingCharges ] = useState(false);

  const total = charges.reduce(
    (acc, c) => acc + parseStringToCents(c.value || "0"),
    0,
  );

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: [ "get-all-trainings" ] });

  const saveObservations = async () => {
    setSavingObs(true);
    try {
      const response = await UpdateTraining({
        trainingId: training.trainingId,
        body: { customerId: enrollment.customerId, observations },
      });
      if (response.statusCode === 200) {
        toast.success("Observação salva.");
        refresh();
      } else {
        toast.warning(response.message || "Erro ao salvar observação.");
      }
    } catch {
      toast.error("Erro ao salvar observação.");
    } finally {
      setSavingObs(false);
    }
  };

  const saveCharges = async () => {
    setSavingCharges(true);
    try {
      const response = await UpdateTraining({
        trainingId: training.trainingId,
        body: {
          customerId: enrollment.customerId,
          charges: charges.map((c) => ({
            kind: c.kind,
            description: c.description || KIND_LABEL[c.kind],
            amountCents: parseStringToCents(c.value || "0"),
            isRequired: c.isRequired,
          })),
        },
      });
      if (response.statusCode === 200) {
        toast.success("Cobranças atualizadas.");
        refresh();
      } else {
        toast.warning(response.message || "Erro ao salvar cobranças.");
      }
    } catch {
      toast.error("Erro ao salvar cobranças.");
    } finally {
      setSavingCharges(false);
    }
  };

  const addExtraCharge = () =>
    setCharges((prev) => [
      ...prev,
      { kind: "EXTRA", description: "", value: "", isRequired: false },
    ]);

  const removeCharge = (index: number) =>
    setCharges((prev) => prev.filter((_, i) => i !== index));

  const updateCharge = (index: number, patch: Partial<ChargeRow>) =>
    setCharges((prev) =>
      prev.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    );

  return (
    <div className="border rounded-lg p-4 bg-muted/10 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm">
          {enrollment.Customer?.fullname || "Participante"}
        </span>
        <div className="flex gap-1">
          {enrollment.isTrainee && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Aluno
            </Badge>
          )}
          {enrollment.isModel && (
            <Badge variant="outline" className="bg-green-50 text-green-700">
              Paciente modelo
            </Badge>
          )}
        </div>
      </div>

      {/* Observação */}
      <div className="space-y-1">
        <Label className="text-xs uppercase text-muted-foreground">
          Observação
        </Label>
        <Textarea
          value={ observations }
          onChange={ (e) => setObservations(e.target.value) }
          disabled={ disabled }
          placeholder="Anotação livre desta inscrição..."
          className="resize-none min-h-[40px]"
          rows={ 1 }
        />
        {!disabled && (
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={ saveObservations }
              disabled={ savingObs }
            >
              <Save className="h-3 w-3 mr-1" /> Salvar observação
            </Button>
          </div>
        )}
      </div>

      {/* Cobranças */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase text-muted-foreground">
            Itens de cobrança
          </Label>
          <span className="text-sm font-medium">
            Total: R$ {centsToString(total)}
          </span>
        </div>

        {charges.map((c, index) => (
          <div key={ index } className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">
                {c.isRequired ? KIND_LABEL[c.kind] : "Descrição"}
              </Label>
              {c.isRequired ? (
                <div className="h-9 flex items-center text-sm text-muted-foreground">
                  {c.description || KIND_LABEL[c.kind]}
                </div>
              ) : (
                <Input
                  value={ c.description }
                  disabled={ disabled }
                  onChange={ (e) =>
                    updateCharge(index, { description: e.target.value })
                  }
                  placeholder="Ex.: Disparos adicionais"
                />
              )}
            </div>
            <div className="w-36 space-y-1">
              <Label className="text-xs">Valor</Label>
              <PriceInput
                withLabel={ false }
                disabled={ disabled }
                value={ c.value }
                onChange={ (v) => updateCharge(index, { value: v }) }
              />
            </div>
            {!disabled && !c.isRequired && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={ () => removeCharge(index) }
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
        ))}

        {!disabled && (
          <div className="flex items-center justify-between pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={ addExtraCharge }
            >
              <Plus className="h-3 w-3 mr-1" /> Adicionar cobrança
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={ saveCharges }
              disabled={ savingCharges }
            >
              <Save className="h-3 w-3 mr-1" /> Salvar cobranças
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
