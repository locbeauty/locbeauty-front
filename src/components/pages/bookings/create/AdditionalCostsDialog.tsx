import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CarFront,
  BedDouble,
  Utensils,
  MessageCircleQuestion,
  MapPin,
  Fuel,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";
import { CreateCheckoutFormSchemaType } from "@/lib/zod/CreateBookingValidation";
import PriceInput from "@/components/shared/PriceInput";
import { parseStringToCents } from "@/utils/parseStringToCents";
import { centsToString } from "@/utils/centsToString";
import { toast } from "sonner";
import { AddressDistanceInput } from "./AddressDistanceInput";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

import { Checkout } from "@/utils/@types/checkouts";
import { UpdateCheckout } from "@/services/checkouts.service";
import { queryClient } from "@/app/(main)/layout";

interface AdditionalCostsDialogProps {
  setAdditionalCostsDialogOpen: Dispatch<SetStateAction<boolean>>;
  isAdditionalCostsDialogOpen: boolean;
  selectedCheckout?: Checkout;
  setSelectedCheckout?: Dispatch<SetStateAction<Checkout | null>>;
  showTrigger?: boolean;
  // Quando o agendamento está concluído, exige justificativa para a alteração.
  requireJustification?: boolean;
}

export function AdditionalCostsDialog({
  isAdditionalCostsDialogOpen,
  setAdditionalCostsDialogOpen,
  selectedCheckout,
  setSelectedCheckout,
  showTrigger = true,
  requireJustification = false,
}: AdditionalCostsDialogProps) {
  const formContext = useFormContext<CreateCheckoutFormSchemaType>();
  const watch = formContext?.watch;
  const setValue = formContext?.setValue;
  const getValues = formContext?.getValues;

  // Estados locais para edição dentro do modal
  const [ distanceInKM, setDistanceInKM ] = useState(0);
  const [ consumptionKmPerLiter, setConsumptionKmPerLiter ] = useState(10);
  const [ fuelCost, setFuelCost ] = useState("");
  const [ lodgingCost, setLodgingCost ] = useState("");
  const [ foodCost, setFoodCost ] = useState("");
  const [ additionalTransportCost, setAdditionalTransportCost ] = useState("");
  const [ isRoundTrip, setIsRoundTrip ] = useState(true);
  const [ justification, setJustification ] = useState("");

  const isUpdateMode = !!selectedCheckout;

  // Observa os equipamentos selecionados do formulário principal
  const selectedGears = watch ? watch("gears") : selectedCheckout?.Bookings;

  // Recalcula custo de equipamentos sempre que mudar
  const selectedGearsCost: number = useMemo(() => {
    if (isUpdateMode) {
      return (
        selectedCheckout?.Bookings?.filter((b) => b.status === "ACTIVE").reduce(
          (acc: number, item) =>
            acc + Number(item.individualPrice) + (item.extraMachineCosts || 0),
          0,
        ) || 0
      );
    }
    return (
      (selectedGears as { individualPrice: string }[])?.reduce(
        (acc: number, item: { individualPrice: string }) =>
          acc + parseStringToCents(item.individualPrice),
        0,
      ) || 0
    );
  }, [ selectedGears, isUpdateMode, selectedCheckout ]);

  // Cálculos derivados
  const pricePerLiterCents = parseStringToCents(fuelCost || "0");
  // Evita divisão por zero ou nulo
  const safeConsumption = Number(consumptionKmPerLiter) || 1;

  // Cálculo de combustível
  const roundTripMultiplier = isRoundTrip ? 2 : 1;
  let fuelTotalCents = 0;
  if (distanceInKM > 0 && pricePerLiterCents > 0) {
    const litersNeeded = Number(distanceInKM) / safeConsumption;
    fuelTotalCents = Math.round(
      pricePerLiterCents * litersNeeded * roundTripMultiplier,
    );
  }

  // PREPARANDO VALORES PARA O CÁLCULO (EM CENTAVOS)
  const lodgingTotal = parseStringToCents(lodgingCost || "0");
  const foodTotal = parseStringToCents(foodCost || "0");
  const transportTotal = parseStringToCents(additionalTransportCost || "0");

  /**
   * CÁLCULO DO TOTAL FINAL:
   * No modo edição, o selectedGearsCost já inclui (individualPrice + extraMachineCosts).
   * No modo criação, o selectedGearsCost inclui apenas o individualPrice.
   * Somamos a isso todos os custos de logística (combustível, hospedagem, alimentação e extras).
   */
  const logisticsTotal =
    fuelTotalCents + lodgingTotal + foodTotal + transportTotal;
  const finalCost = Number(selectedGearsCost) + logisticsTotal;

  // EFEITO DE SINCRONIZAÇÃO (CRÍTICO):
  // Quando o modal abre, preenche os estados locais com o que já está salvo no formulário.
  useEffect(() => {
    if (isAdditionalCostsDialogOpen) {
      setJustification("");
      if (isUpdateMode && selectedCheckout) {
        setFuelCost(centsToString(selectedCheckout.fuelCost) || "");
        setLodgingCost(centsToString(selectedCheckout.lodgingCost) || "");
        setFoodCost(centsToString(selectedCheckout.foodCost) || "");
        setAdditionalTransportCost(
          centsToString(selectedCheckout.additionalTransportCost) || "",
        );
        setDistanceInKM(Number(selectedCheckout.distanceInKm) || 0);
        // Consumption km per liter is not in Checkout model currently, using default 10
        setConsumptionKmPerLiter(10);
      } else if (getValues) {
        const currentValues = getValues();

        setFuelCost(currentValues.fuelCost || "");
        setLodgingCost(currentValues.lodgingCost || "");
        setFoodCost(currentValues.foodCost || "");
        setAdditionalTransportCost(currentValues.additionalTransportCost || "");
        setDistanceInKM(Number(currentValues.distanceInKm) || 0);
        setConsumptionKmPerLiter(Number(currentValues.consumption) || 10);
        setIsRoundTrip(currentValues.isRoundTrip ?? true);
      }
    }
  }, [ isAdditionalCostsDialogOpen, getValues, isUpdateMode, selectedCheckout ]);

  async function handleSaveVariables() {
    if (isUpdateMode && selectedCheckout && setSelectedCheckout) {
      const trimmedJustification = justification.trim();
      if (requireJustification && !trimmedJustification) {
        toast.warning(
          "Informe uma justificativa para alterar o valor de um agendamento concluído.",
          { style: { fontSize: "1rem" } },
        );
        return;
      }

      const fuelTotal = fuelTotalCents;
      const lodgingTotal = parseStringToCents(lodgingCost);
      const foodTotal = parseStringToCents(foodCost);
      const transportTotal = parseStringToCents(additionalTransportCost);
      const distance = Number(distanceInKM);

      const response = await UpdateCheckout({
        body: {
          distanceInKm: distance,
          fuelCost: fuelTotal,
          lodgingCost: lodgingTotal,
          additionalTransportCost: transportTotal,
          foodCost: foodTotal,
          ...(requireJustification
            ? { justification: trimmedJustification }
            : {}),
        },
        checkoutId: selectedCheckout.checkoutId,
      });

      if (response.statusCode !== 200) {
        toast.warning(response.message, { style: { fontSize: "1rem" } });
        return;
      }

      toast.success(response.message, { style: { fontSize: "1rem" } });
      queryClient.invalidateQueries({ queryKey: [ "get-all-checkouts" ] });
      queryClient.invalidateQueries({
        queryKey: [ "get-checkout-value-changes" ],
      });

      // Atualiza o estado local mesclando os novos valores para garantir atualização instantânea e preservar relações
      setSelectedCheckout((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          distanceInKm: distance,
          fuelCost: fuelTotal,
          lodgingCost: lodgingTotal,
          additionalTransportCost: transportTotal,
          foodCost: foodTotal,
          totalPrice: finalCost,
        };
      });

      setAdditionalCostsDialogOpen(false);
      return;
    }

    if (setValue) {
      setValue("fuelCost", fuelCost);
      setValue("lodgingCost", lodgingCost);
      setValue("foodCost", foodCost);
      setValue("additionalTransportCost", additionalTransportCost);
      setValue("distanceInKm", Number(distanceInKM));
      setValue("consumption", Number(consumptionKmPerLiter));
      setValue("isRoundTrip", isRoundTrip);

      // Atualiza o total final no formulário
      setValue("totalPrice", centsToString(finalCost));

      toast.success("Custos adicionais aplicados!");
    }
    setAdditionalCostsDialogOpen(false);
  }

  function handleCancel() {
    setAdditionalCostsDialogOpen(false);
  }

  function handleClear() {
    setFuelCost("");
    setLodgingCost("");
    setFoodCost("");
    setAdditionalTransportCost("");
    setDistanceInKM(0);
    setConsumptionKmPerLiter(10);
    setIsRoundTrip(true);
  }

  return (
    <Dialog
      open={ isAdditionalCostsDialogOpen }
      onOpenChange={ setAdditionalCostsDialogOpen }
    >
      {showTrigger && (
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            + Custos adicionais
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="md:w-[800px] w-[95%] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <CarFront className="h-6 w-6 text-primary" />
            Custos de Logística e Viagem
          </DialogTitle>
          <DialogDescription>
            Calcule e adicione custos variáveis relacionados à entrega e
            estadia.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Coluna da Esquerda: Logística */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-semibold text-primary/80 border-b pb-2">
              <Fuel className="h-4 w-4" /> Transporte
            </div>

            <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  Distância Total
                </Label>
                {isAdditionalCostsDialogOpen && (
                  <AddressDistanceInput
                    setDistanceInKM={ setDistanceInKM }
                    distanceInKM={ distanceInKM }
                    filialId={
                      isUpdateMode && selectedCheckout
                        ? selectedCheckout.SourceFilial.filialId
                        : watch
                          ? watch("filialId")
                          : ""
                    }
                    onTollCost={ (cents) =>
                      setAdditionalTransportCost(centsToString(cents))
                    }
                    isRoundTrip={ isRoundTrip }
                  />
                )}
                <div className="flex flex-col gap-3 mt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-16">
                      Manual:
                    </span>
                    <Input
                      type="number"
                      className="h-7 w-20 text-xs"
                      value={ distanceInKM || "" }
                      onChange={ (e) => setDistanceInKM(Number(e.target.value)) }
                      placeholder="0"
                    />
                    <span className="text-xs font-medium text-muted-foreground">
                      km
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 bg-primary/5 p-2 rounded-md border border-primary/10">
                    <Checkbox
                      id="round-trip"
                      checked={ isRoundTrip }
                      onCheckedChange={ (checked) =>
                        setIsRoundTrip(checked === true)
                      }
                    />
                    <Label
                      htmlFor="round-trip"
                      className="text-xs font-semibold cursor-pointer select-none text-primary"
                    >
                      Ida e volta (Multiplicar distância por 2)
                    </Label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Preço Combustível (Litro)</Label>
                  <PriceInput
                    withLabel={ false }
                    onChange={ setFuelCost }
                    value={ fuelCost }
                    placeholder="R$ 0,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Consumo (Km/L)</Label>
                  <Input
                    type="number"
                    min={ 1 }
                    onChange={ (e) =>
                      setConsumptionKmPerLiter(Number(e.target.value))
                    }
                    value={ consumptionKmPerLiter }
                    className="h-10"
                  />
                </div>
              </div>

              <div className="text-sm bg-primary/5 p-2 rounded text-primary flex justify-between items-center">
                <span>
                  Custo estimado de combustível:{" "}
                  {isRoundTrip ? (
                    <span>(Ida e Volta)</span>
                  ) : (
                    <span>(Ida)</span>
                  )}
                </span>
                <span className="font-bold">
                  {centsToString(fuelTotalCents)}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <Label className="flex items-center gap-1">
                  <MessageCircleQuestion className="h-3.5 w-3.5" /> Extras
                  (Pedágio, Balsa)
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <MessageCircleQuestion className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Custos de pedágios, balsas e outros transportes.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <PriceInput
                withLabel={ false }
                onChange={ setAdditionalTransportCost }
                value={ additionalTransportCost }
                placeholder="R$ 0,00"
              />
            </div>
          </div>

          {/* Coluna da Direita: Estadia e Resumo */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-semibold text-primary/80 border-b pb-2">
              <BedDouble className="h-4 w-4" /> Estadia e Alimentação
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <BedDouble className="h-3.5 w-3.5" /> Custo de Hospedagem
                </Label>
                <PriceInput
                  withLabel={ false }
                  onChange={ setLodgingCost }
                  value={ lodgingCost }
                  placeholder="R$ 0,00"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Utensils className="h-3.5 w-3.5" /> Custo de Alimentação
                </Label>
                <PriceInput
                  withLabel={ false }
                  onChange={ setFoodCost }
                  value={ foodCost }
                  placeholder="R$ 0,00"
                />
              </div>
            </div>

            <Separator className="my-4" />

            <div className="bg-muted/30 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wider">
                Resumo de Custos
              </h4>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Equipamentos:</span>
                <span>{centsToString(selectedGearsCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Combustível + Extras:
                </span>
                <span>{centsToString(fuelTotalCents + transportTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Estadia + Alimentação:
                </span>
                <span>{centsToString(lodgingTotal + foodTotal)}</span>
              </div>
              <Separator className="bg-primary/20" />
              <div className="flex justify-between items-center pt-2">
                <span className="font-semibold">Total Estimado:</span>
                <span className="font-bold text-xl text-primary">
                  {centsToString(finalCost)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {isUpdateMode && requireJustification && (
          <div className="space-y-2 border-t pt-4">
            <Label className="text-destructive">
              Justificativa da alteração *
            </Label>
            <Textarea
              className="max-h-[150px]"
              placeholder="Descreva o motivo da alteração dos valores neste agendamento concluído"
              value={ justification }
              onChange={ (e) => setJustification(e.target.value) }
            />
            <p className="text-xs text-muted-foreground">
              Esta alteração ficará registrada no histórico do agendamento.
            </p>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-2 border-t pt-4">
          <Button
            variant="ghost"
            onClick={ handleClear }
            type="button"
            className="sm:mr-auto"
          >
            Limpar Campos
          </Button>
          <Button variant="outline" onClick={ handleCancel } type="button">
            Cancelar
          </Button>
          <Button onClick={ handleSaveVariables } type="button" className="gap-2">
            <CarFront className="h-4 w-4" /> Aplicar Custos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
