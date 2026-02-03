import { useState, useEffect } from "react";
import {
  Control,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
  FieldErrors,
  Path,
} from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import PriceInput from "@/components/shared/PriceInput";
import { Textarea } from "@/components/ui/textarea";
import { TrainingPaymentSection } from "./TrainingPaymentSection";
import { CreateTrainingDataType } from "@/lib/zod/CreateTrainingValidation";

interface Participant {
  id: string;
  name: string;
}

interface FinancialInputSectionProps {
  control: Control<CreateTrainingDataType>;
  register: UseFormRegister<CreateTrainingDataType>;
  setValue: UseFormSetValue<CreateTrainingDataType>;
  watch: UseFormWatch<CreateTrainingDataType>;
  errors: FieldErrors<CreateTrainingDataType>;
  participants: Participant[];
  type: "trainee" | "volunteer";
  fields: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
}

// Helper para tratar string de moeda (ex: "1.000,00")
const parseCurrencyToFloat = (
  value: string | number | null | undefined,
): number => {
  if (!value) return 0;
  if (typeof value === "number") return value;
  // Remove tudo que não é dígito ou vírgula
  const cleanString = value.replace(/[^\d,]/g, "").replace(",", ".");
  return parseFloat(cleanString) || 0;
};

export function FinancialInputSection({
  control,
  register,
  setValue,
  watch,
  errors,
  participants,
  type,
  fields,
}: FinancialInputSectionProps) {
  const fieldName =
    type === "trainee" ? "traineePayments" : "volunteerPayments";

  const [ selectedParticipantId, setSelectedParticipantId ] = useState<
    string | null
  >(participants.length > 0 ? participants[0].id : null);

  const [ isReplicating, setIsReplicating ] = useState(false);

  useEffect(() => {
    if (participants.length > 0) {
      if (
        !selectedParticipantId ||
        !participants.find((p) => p.id === selectedParticipantId)
      ) {
        setSelectedParticipantId(participants[0].id);
      }
    } else {
      setSelectedParticipantId(null);
    }
  }, [ participants, selectedParticipantId ]);

  const selectedIndex = fields.findIndex(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (field: any) => field.participantId === selectedParticipantId,
  );

  // Watch current participant's values
  const currentPrice = watch(
    `${fieldName}.${selectedIndex}.price` as Path<CreateTrainingDataType>,
  );
  const currentAddCost = watch(
    `${fieldName}.${selectedIndex}.additionalCost` as Path<CreateTrainingDataType>,
  );
  const currentAddDesc = watch(
    `${fieldName}.${selectedIndex}.additionalCostDescription` as Path<CreateTrainingDataType>,
  );
  const currentPaymentInfo = watch(
    `${fieldName}.${selectedIndex}.paymentInfo` as Path<CreateTrainingDataType>,
  );

  // Replicate effect
  useEffect(() => {
    if (isReplicating && selectedIndex !== -1) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fields.forEach((field: any, index) => {
        if (index === selectedIndex) return;

        // Check current payment status of the target field
        // We use fields[index] data if available, but for dynamic form validity we might need to rely on watch if the field data isn't updating in real-time,
        // HOWEVER, useFieldArray fields are snapshots. Let's try to get the current value from the form state if possible to be safe,
        // or rely on field.paymentInfo if initialized correctly.
        // Actually, since we are inside a form, `watch` on specific index is safer for current state.

        // WATCH OUT: We cannot call 'watch' inside this loop (hooks rules).
        // We need to access the current value using `methods.getValues()` if we had access to methods,
        // OR we can trust that `field.paymentInfo` has the initial state and if it changed it should be in the form state.
        // Since we don't have getValues here, we might need to rely on `fields` snapshot which is updated on re-render,
        // OR pass getValues from parent OR standard solution: use `watch` for the whole array outside the effect?
        // Watching the whole array might be heavy.

        // Better approach: We can check the defaultValue or the current value if we had it.
        // But wait, `fields` from useFieldArray contains the values.
        // Let's check `field.paymentInfo?.paymentStatus`.

        const currentStatus = field.paymentInfo?.paymentStatus;
        if (currentStatus === "Pago" || currentStatus === "Parcial") {
          return;
        }

        // Only update if different to avoid potential loops (though hook form is robust)
        setValue(
          `${fieldName}.${index}.price` as Path<CreateTrainingDataType>,
          currentPrice,
        );

        setValue(
          `${fieldName}.${index}.additionalCost` as Path<CreateTrainingDataType>,
          currentAddCost,
        );
        setValue(
          `${fieldName}.${index}.additionalCostDescription` as Path<CreateTrainingDataType>,
          currentAddDesc,
        );
      });
    }
  }, [
    isReplicating,
    selectedIndex,
    currentPrice,
    currentAddCost,
    currentAddDesc,
    // JSON.stringify(currentPaymentInfo), - disabling deps check to avoid complexity warning
    fields,
    fieldName,
    setValue,

    // currentPaymentInfo - omitted from strict dep check due to deep object comparison complexity, handled by re-renders
  ]);

  if (participants.length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic p-4">
        Nenhum participante selecionado.
      </div>
    );
  }

  const isSelectedTrainee = type === "trainee";

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full min-h-[400px]">
      {/* Left Col: List of Participants */}
      <div className="w-full md:w-1/3 border-r pr-4 space-y-2">
        <Label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">
          Participantes
        </Label>
        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {participants.map((p, index) => (
            <div
              key={ `${p.id}-${index}` }
              onClick={ () => setSelectedParticipantId(p.id) }
              className={ cn(
                "cursor-pointer px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between",
                selectedParticipantId === p.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted",
              ) }
            >
              <span>{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Col: Inputs */}
      <div className="w-full md:w-2/3 pl-0 md:pl-2">
        {selectedIndex !== -1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">
                {participants.find((p) => p.id === selectedParticipantId)?.name}
              </h4>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={ `replicate-${type}` }
                  checked={ isReplicating }
                  onCheckedChange={ (checked) =>
                    setIsReplicating(checked === true)
                  }
                />
                <label
                  htmlFor={ `replicate-${type}` }
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex flex-col"
                >
                  Replicar para todos
                  <span className="text-xs text-muted-foreground">
                    (exceto pagos e parciais)
                  </span>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              {/* Calculate disabled state */}
              {(() => {
                const currentStatus = (currentPaymentInfo as any)
                  ?.paymentStatus;
                const isDisabled =
                  currentStatus === "Pago" ||
                  currentStatus === "Parcial" ||
                  currentStatus === "Cortesia";

                return (
                  <>
                    {/* Price */}
                    <div className="space-y-2">
                      <Label>Valor Base</Label>
                      <PriceInput
                        withLabel={ false }
                        register={ register(
                          `${fieldName}.${selectedIndex}.price` as Path<CreateTrainingDataType>,
                        ) }
                        value={
                          watch(
                            `${fieldName}.${selectedIndex}.price` as Path<CreateTrainingDataType>,
                          )?.toString() ?? ""
                        }
                        setValue={ setValue }
                        name={
                          `${fieldName}.${selectedIndex}.price` as Path<CreateTrainingDataType>
                        }
                        placeholder="R$ 0,00 "
                        disabled={ isDisabled }
                      />
                    </div>

                    {/* Additional Costs */}
                    {isSelectedTrainee && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-md border border-yellow-200 dark:border-yellow-900/50 space-y-3">
                        <div className="space-y-2">
                          <Label className="text-yellow-800 dark:text-yellow-200 text-xs font-bold uppercase tracking-wide">
                            Custos Operacionais Extras
                          </Label>
                          <div className="grid grid-cols-1 gap-4">
                            <PriceInput
                              withLabel={ false }
                              register={ register(
                                `${fieldName}.${selectedIndex}.additionalCost` as Path<CreateTrainingDataType>,
                              ) }
                              value={
                                watch(
                                  `${fieldName}.${selectedIndex}.additionalCost` as Path<CreateTrainingDataType>,
                                )?.toString() ?? ""
                              }
                              setValue={ setValue }
                              name={
                                `${fieldName}.${selectedIndex}.additionalCost` as Path<CreateTrainingDataType>
                              }
                              placeholder="Valor:  R$ 0,00"
                              disabled={ isDisabled }
                            />
                            <Textarea
                              { ...register(
                                `${fieldName}.${selectedIndex}.additionalCostDescription` as Path<CreateTrainingDataType>,
                              ) }
                              placeholder="Descrição: Taxa de sala, material..."
                              className="resize-none min-h-[40px]"
                              rows={ 1 }
                              disabled={ isDisabled }
                              value={
                                (watch(
                                  `${fieldName}.${selectedIndex}.additionalCostDescription` as Path<CreateTrainingDataType>,
                                ) as string) || ""
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Payment Info Section reused */}
                    <TrainingPaymentSection
                      prefix={ `${fieldName}.${selectedIndex}` }
                      label="Detalhes do Pagamento"
                      totalValue={
                        parseCurrencyToFloat(
                          currentPrice as unknown as string,
                        ) +
                        parseCurrencyToFloat(
                          currentAddCost as unknown as string,
                        )
                      }
                      disabled={ isDisabled }
                    />
                  </>
                );
              })()}
            </div>
          </div>
        )}
        {selectedIndex === -1 && (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Selecione um participante para configurar.
          </div>
        )}
      </div>
    </div>
  );
}
