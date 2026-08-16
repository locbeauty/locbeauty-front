"use client";

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CalendarIcon,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Package,
  Tag,
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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/ui/DatePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { SelectTrainingGear } from "./SelectTrainingGear";
import { EmbeddedTrainingAddressForm } from "./EmbeddedTrainingAddressForm";

import { UpdateTraining } from "@/services/trainings.service";
import { CreateGenericAddress } from "@/services/addresses.service";
import {
  getDayCheckouts,
  GetDayCheckoutsResponse,
} from "@/services/checkouts.service";
import { queryClient } from "@/app/(main)/layout";
import { addressSchema, AddressTypeSchema } from "@/lib/zod/address";
import { Training } from "@/utils/@types/training";
import { ApiResponse } from "@/lib/api";

interface EditTrainingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTraining: Training;
  setSelectedTraining?: Dispatch<SetStateAction<Training | null>>;
}

export function EditTrainingDialog({
  open,
  onOpenChange,
  selectedTraining,
  setSelectedTraining,
}: EditTrainingDialogProps) {
  const [ gearId, setGearId ] = useState(selectedTraining.gearId);
  const [ trainingType, setTrainingType ] = useState<"COMUM" | "MPT">(
    selectedTraining.trainingType || "COMUM",
  );
  const [ dueDate, setDueDate ] = useState<Date | null>(
    new Date(selectedTraining.dueDate),
  );
  const [ hourInMinutes, setHourInMinutes ] = useState<number | null>(
    selectedTraining.hourInMinutes,
  );
  const [ changeAddress, setChangeAddress ] = useState(false);
  const [ isSaving, setIsSaving ] = useState(false);

  const addressMethods = useForm<AddressTypeSchema>({
    resolver: zodResolver(addressSchema),
  });

  // Reinicializa o formulário sempre que abrir / trocar de treinamento
  useEffect(() => {
    if (open) {
      setGearId(selectedTraining.gearId);
      setTrainingType(selectedTraining.trainingType || "COMUM");
      setDueDate(new Date(selectedTraining.dueDate));
      setHourInMinutes(selectedTraining.hourInMinutes);
      setChangeAddress(false);
      addressMethods.reset({
        zipCode: selectedTraining.Address.zipCode ?? "",
        stateName: selectedTraining.Address.state ?? "",
        cityName: selectedTraining.Address.city ?? "",
        neighborhoodName: selectedTraining.Address.neighborhood ?? "",
        streetName: selectedTraining.Address.street ?? "",
        buildingNumber: selectedTraining.Address.buildingNumber ?? "",
        addressComplement: selectedTraining.Address.addressComplement ?? "",
      });
    }
  }, [ open, selectedTraining, addressMethods ]);

  // --- Disponibilidade de horários (exclui o próprio treinamento) ---
  const availabilityBody = {
    filialId: selectedTraining.sourceFilialId,
    gears: [
      {
        gearId: gearId || "",
        gearName: "", // backend usa apenas gearId
        individualPrice: "0,00",
      },
    ],
    date: dueDate || undefined,
    excludeTrainingId: selectedTraining.trainingId,
  };

  const { data: availabilityData, isLoading: isLoadingHours } = useQuery<
    ApiResponse<GetDayCheckoutsResponse[]>,
    Error
  >({
    queryKey: [ "get-day-checkouts-edit-training", availabilityBody ],
    queryFn: () => getDayCheckouts({ body: availabilityBody }),
    enabled: open && !!gearId && !!dueDate,
    staleTime: 0,
  });

  const checkoutSchedule = availabilityData?.data;

  const formattedCurrentAddress = useMemo(() => {
    const a = selectedTraining.Address;
    return `${a.street}, ${a.buildingNumber} - ${a.neighborhood}, ${a.city}/${a.state}`;
  }, [ selectedTraining ]);

  const handleGearChange = (newGearId: string) => {
    setGearId(newGearId);
    setHourInMinutes(null); // disponibilidade muda com o equipamento
  };

  const handleDateChange = (date: Date | undefined) => {
    setDueDate(date ?? null);
    setHourInMinutes(null); // disponibilidade muda com a data
  };

  const handleSave = async () => {
    if (!gearId || !dueDate || hourInMinutes === null) {
      toast.warning("Selecione equipamento, data e horário.", {
        style: { fontSize: "1rem" },
      });
      return;
    }

    setIsSaving(true);
    try {
      let finalAddressId = selectedTraining.addressId;

      if (changeAddress) {
        const isValid = await addressMethods.trigger();
        if (!isValid) {
          toast.warning("Verifique os dados do endereço.", {
            style: { fontSize: "1rem" },
          });
          setIsSaving(false);
          return;
        }

        const values = addressMethods.getValues();
        const addressResponse = await CreateGenericAddress({
          body: {
            zipCode: values.zipCode,
            stateName: values.stateName,
            cityName: values.cityName,
            neighborhoodName: values.neighborhoodName,
            streetName: values.streetName,
            buildingNumber: values.buildingNumber,
            addressComplement: values.addressComplement,
          },
        });

        if (addressResponse?.data?.addressId) {
          finalAddressId = addressResponse.data.addressId;
        } else {
          toast.error("Erro ao criar endereço. Verifique os campos.", {
            style: { fontSize: "1rem" },
          });
          setIsSaving(false);
          return;
        }
      }

      const response = await UpdateTraining({
        trainingId: selectedTraining.trainingId,
        body: {
          gearId,
          trainingType,
          dueDate,
          hourInMinutes,
          addressId: finalAddressId,
        },
      });

      if (response && response.statusCode === 200) {
        toast.success("Treinamento atualizado com sucesso!", {
          style: { fontSize: "1rem" },
        });
        queryClient.invalidateQueries({ queryKey: [ "get-all-trainings" ] });
        if (setSelectedTraining && response.data) {
          setSelectedTraining(response.data);
        }
        onOpenChange(false);
      } else {
        toast.error(response?.message || "Erro ao atualizar treinamento.", {
          style: { fontSize: "1rem" },
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar treinamento.", {
        style: { fontSize: "1rem" },
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={ open } onOpenChange={ onOpenChange }>
      <DialogContent className="max-h-[90vh] w-[90vw] md:w-[700px] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle>Editar Treinamento</DialogTitle>
          <DialogDescription>
            Altere o tipo, o equipamento, a data, o horário e o local do
            treinamento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* TIPO DO TREINAMENTO */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="h-4 w-4" /> Tipo de Treinamento
            </Label>
            <Select
              value={ trainingType }
              onValueChange={ (value) =>
                setTrainingType(value as "COMUM" | "MPT")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COMUM">Comum</SelectItem>
                <SelectItem value="MPT">
                  MPT (garantia de vaga + disparos)
                </SelectItem>
              </SelectContent>
            </Select>
            {trainingType !== (selectedTraining.trainingType || "COMUM") && (
              <p className="text-xs text-muted-foreground">
                A alteração do tipo não muda automaticamente as cobranças já
                lançadas dos participantes — ajuste-as se necessário.
              </p>
            )}
          </div>

          <Separator />

          {/* EQUIPAMENTO */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Package className="h-4 w-4" /> Equipamento
            </Label>
            <SelectTrainingGear
              filialId={ selectedTraining.sourceFilialId }
              selectedGear={ gearId }
              onGearChange={ handleGearChange }
            />
          </div>

          <Separator />

          {/* DATA E HORÁRIO */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" /> Data do Treinamento
              </Label>
              <DatePicker
                modal={ true }
                value={ dueDate }
                onChange={ handleDateChange }
                placeholder="Selecione a data"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> Horário de Início
              </Label>

              {(!gearId || !dueDate) && (
                <p className="text-sm text-muted-foreground italic">
                  Selecione o equipamento e a data para visualizar os horários.
                </p>
              )}

              {gearId && dueDate && isLoadingHours && (
                <p className="text-sm text-muted-foreground italic">
                  Carregando horários...
                </p>
              )}

              {gearId && dueDate && !isLoadingHours && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
                  {checkoutSchedule?.map((hour) => {
                    const hasSomeAvailableGapTime = hour.availability.some(
                      (item) => item.available,
                    );
                    const isSelected = hourInMinutes === hour.hourInMinutes;
                    return (
                      <Button
                        type="button"
                        key={ hour.hourInMinutes }
                        variant={ isSelected ? "default" : "outline" }
                        size="sm"
                        disabled={ !hasSomeAvailableGapTime }
                        onClick={ () => setHourInMinutes(hour.hourInMinutes) }
                        className={ `relative text-xs h-9 transition-all ${
                          isSelected
                            ? "ring-2 ring-primary ring-offset-2"
                            : ""
                        } ${
                          !hasSomeAvailableGapTime
                            ? "opacity-50"
                            : "hover:scale-105"
                        }` }
                      >
                        {hour.formattedTime}
                        {isSelected && (
                          <CheckCircle2 className="h-3 w-3 absolute -top-1 -right-1 text-primary bg-background rounded-full" />
                        )}
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* LOCALIZAÇÃO */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Local do Treinamento
            </Label>

            <div className="p-3 rounded-md border bg-muted/20 text-sm">
              {formattedCurrentAddress}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="changeAddress"
                checked={ changeAddress }
                onCheckedChange={ (checked) =>
                  setChangeAddress(checked === true)
                }
              />
              <Label htmlFor="changeAddress" className="cursor-pointer">
                Alterar endereço
              </Label>
            </div>

            {changeAddress && (
              <FormProvider { ...addressMethods }>
                <EmbeddedTrainingAddressForm />
              </FormProvider>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={ () => onOpenChange(false) }
            disabled={ isSaving }
          >
            Cancelar
          </Button>
          <Button type="button" onClick={ handleSave } disabled={ isSaving }>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Salvar alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
