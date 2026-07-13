"use client";

import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Controller,
  FieldErrors,
  FormProvider,
  SubmitHandler,
  useForm,
  useFormContext,
} from "react-hook-form";
// ... imports ...

import { zodResolver } from "@hookform/resolvers/zod";
import { SelectGear } from "./SelectGear";
import {
  AlertCircle,
  User,
  MessageSquare,
  Check,
  Settings,
  Pin,
  Truck,
  X,
  Copy,
  Calendar,
  Clock,
  Loader2,
} from "lucide-react";
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import PriceInput from "@/components/shared/PriceInput";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-provider";
import { DRIVER_ROLES, USER_ROLES } from "@/utils/constants";
import { SelectFilial } from "@/components/shared/SelectFilial";
import CheckoutTimeSelector from "./CheckoutTimeSelector";
import CheckoutEndTimeSelector from "./CheckoutEndTimeSelector";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/DatePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { minutesToHHMM } from "@/utils/minutesToHHMM";
import { SelectAddress } from "./SelectAddress";
import { CheckoutPaymentMethod } from "./CheckoutPaymentMethod";
import { SelectEmployee } from "@/components/shared/SelectEmployee";
import { Gear } from "@/utils/@types/gears";
import { ApiResponse } from "@/lib/api";
import {
  createCheckoutFormSchema,
  CreateCheckoutFormSchemaType,
  CreateCheckoutValidationWithMoneyInCents,
} from "@/lib/zod/CreateBookingValidation";
import {
  CreateCheckout,
  getDayCheckouts,
  GetDayCheckoutsResponse,
} from "@/services/checkouts.service";
import { parseStringToCents } from "@/utils/parseStringToCents";
import { useQuery } from "@tanstack/react-query";
import { AdditionalCostsDialog } from "./AdditionalCostsDialog";
import { centsToString } from "@/utils/centsToString";
import { queryClient } from "@/app/(main)/layout";
import { SelectCustomer } from "./SelectCustomer";
import { useAccess } from "@/contexts/access-provider";
import { SYSTEM_MODULES } from "@/utils/@types/access";

// Converte o paymentInfo do formulário para o payload da API (centavos).
// No status "Parcial" as parcelas do editor são a fonte da verdade e os
// campos first/second viram apenas o espelho legado (parcelas 1 e 2).
function buildPaymentInfoPayload(
  data: CreateCheckoutFormSchemaType,
): CreateCheckoutValidationWithMoneyInCents["paymentInfo"] {
  const info = data.paymentInfo;
  type PaymentMethodType = CreateCheckoutValidationWithMoneyInCents["paymentInfo"]["firstPaymentMethod"];

  if (data.paymentStatus === "Parcial" && info.installments?.length) {
    const installments = info.installments;
    const first = installments[0];
    const second = installments[1];
    const totalCents = parseStringToCents(data.totalPrice || "0");

    return {
      paymentStatus: "Parcial",
      installmentsCount: installments.length,
      installments,

      firstPaymentDate: first?.dueDate ? new Date(first.dueDate) : null,
      firstPaymentAmount: first?.amount ?? null,
      firstPaymentMethod: (first?.paymentMethod ??
        undefined) as PaymentMethodType,
      firstPaymentStatus: first?.paymentStatus,

      secondPaymentDate: second?.dueDate ? new Date(second.dueDate) : null,
      secondPaymentAmount: Math.max(0, totalCents - (first?.amount ?? 0)),
      secondPaymentMethod: (second?.paymentMethod ??
        undefined) as PaymentMethodType,
      secondPaymentStatus: second?.paymentStatus ?? "Pendente",
    };
  }

  return {
    paymentStatus: info.paymentStatus,
    firstPaymentDate: info.firstPaymentDate ?? null,
    firstPaymentAmount: info.firstPaymentAmount
      ? parseStringToCents(info.firstPaymentAmount)
      : null,
    firstPaymentMethod: info.firstPaymentMethod ?? undefined,
    firstPaymentStatus: info.firstPaymentStatus,

    secondPaymentDate: info.secondPaymentDate ?? null,
    secondPaymentAmount: info.secondPaymentAmount
      ? parseStringToCents(info.secondPaymentAmount)
      : null,
    secondPaymentMethod: info.secondPaymentMethod ?? undefined,
    secondPaymentStatus: info.secondPaymentStatus ?? undefined,
  };
}

export function GearsSection() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateCheckoutFormSchemaType>();

  const watchedGears = watch("gears");
  const filialId = watch("filialId");
  const watchSelectedGears = useMemo(() => watchedGears || [], [ watchedGears ]);

  useEffect(() => {
    const selectedGearsCost = watchSelectedGears.reduce(
      (acc, item) => acc + parseStringToCents(item.individualPrice),
      0,
    );
    setValue("basePrice", centsToString(selectedGearsCost));
  }, [ watchSelectedGears, setValue ]);

  function handleAddGear(gear: Gear) {
    setValue("gears", [
      ...watchSelectedGears,
      {
        gearId: gear.gearId,
        gearName: gear.gearName,
        individualPrice: "0,00",
      },
    ]);
  }
  useEffect(() => {
    console.log("Errors: ", errors);
  }, [ errors ]);
  function handleRemoveGear(gearId: string) {
    setValue(
      "gears",
      watchSelectedGears.filter((g) => g.gearId !== gearId),
    );
  }

  function handlePriceChange(index: number, value: string) {
    const updatedGears = [ ...watchSelectedGears ];
    updatedGears[index].individualPrice = value;
    setValue("gears", updatedGears);
  }

  return (
    <div className="space-y-2" id="gears">
      <Label className="text-sm font-medium flex items-center gap-1">
        <Settings className="w-4 h-4" />
        Equipamentos
      </Label>
      <div className="flex flex-col gap-2">
        {watchSelectedGears.map((gear, index) => (
          <div key={ gear.gearId } className="flex gap-2 items-center">
            <Button
              variant="outline"
              className="justify-start text-black font-black min-w-[200px]"
              disabled
            >
              {gear.gearName}
            </Button>
            <div className="flex flex-col w-[150px]">
              <PriceInput
                withLabel={ false }
                name={ `gears.${index}.individualPrice` }
                value={ gear.individualPrice }
                onChange={ (val: string) => handlePriceChange(index, val) }
              />
              {errors.gears?.[index]?.individualPrice && (
                <p className="text-xs text-destructive mt-1">
                  {errors.gears[index].individualPrice.message}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-9 w-9"
              onClick={ () => handleRemoveGear(gear.gearId) }
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {watchSelectedGears.length < 3 && (
          <div className="w-[200px]">
            <SelectGear onSelect={ handleAddGear } filialId={ filialId } />
          </div>
        )}
      </div>
      {typeof errors.gears?.message === "string" && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {errors.gears.message}
        </p>
      )}
    </div>
  );
}

export function CreateBookingForm() {
  const { user } = useAuth();
  const { getAccessibleFilialsForCreate } = useAccess();

  // Get accessible filials for create
  const accessibleFilialsObjects =
    user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MASTER
      ? []
      : getAccessibleFilialsForCreate(SYSTEM_MODULES.BOOKINGS);

  const accessibleFilialsIds =
    accessibleFilialsObjects.length > 0
      ? accessibleFilialsObjects.map((f) => f.filialId)
      : user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MASTER
        ? undefined
        : [];

  const defaultFilialId =
    user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MASTER
      ? user?.sourceFilialId
      : accessibleFilialsIds?.includes(user?.sourceFilialId || "")
        ? user?.sourceFilialId
        : accessibleFilialsIds?.[0];

  const createBookingFormMethods = useForm<CreateCheckoutFormSchemaType>({
    resolver: zodResolver(createCheckoutFormSchema),
    defaultValues: {
      checkoutStatus: "Pendente",
      paymentStatus: "Pendente",
      paymentInfo: {
        paymentStatus: "Pendente",
        firstPaymentDate: null,
        secondPaymentDate: null,
        firstPaymentAmount: "0,00",
        firstPaymentStatus: "Pendente",
        secondPaymentAmount: "0,00",
        secondPaymentStatus: "Pendente",
      },
      basePrice: "0,00",
      totalPrice: "0,00",
      extraMachineCosts: "0,00",
      lodgingCost: "0,00",
      foodCost: "0,00",
      fuelCost: "0,00",
      additionalTransportCost: "0,00",
      consumption: 10,
      addressId: "",
      filialId: defaultFilialId || "",
      accountableEmployeeId: user?.employeeId || user?.sub,
      crossDays: false,
      endDate: undefined,
      endHourInMinutes: undefined,
      isRoundTrip: true,
    },
  });

  const [ isAdditionalCostsDialogOpen, setAdditionalCostsDialogOpen ] =
    useState(false);
  const [ addressString, setAddressString ] = useState("");
  const [ drivingDistance, setDrivingDistance ] = useState(0);
  const [ driverString, setDriverString ] = useState("");

  const {
    handleSubmit,
    register,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting, isLoading },
    control,
  } = createBookingFormMethods;

  const startHour = watch("startHourInMinutes");
  const watchTotalDurationInMinutes = watch("totalDurationInMinutes");
  const selectedDate = watch("date");
  const watchFilialId = watch("filialId");
  const prevFilialId = useRef(watchFilialId);
  const watchSelectedGears = watch("gears");
  const watchCustomer = watch("customer");
  const watchTotalPrice = watch("totalPrice");
  const watchBasePrice = watch("basePrice");

  const watchExtraMachineCosts = watch("extraMachineCosts");
  const watchLodgingCost = watch("lodgingCost");
  const watchFoodCost = watch("foodCost");
  const watchFuelCost = watch("fuelCost");
  const watchDistanceInKm = watch("distanceInKm");
  const watchAdditionalTransportCost = watch("additionalTransportCost");
  const watchConsumption = watch("consumption");

  const watchCrossDays = watch("crossDays");
  const watchEndDate = watch("endDate");
  const watchEndHourInMinutes = watch("endHourInMinutes");
  const watchIsRoundTrip = watch("isRoundTrip");

  // const isDateInPast = selectedDate && selectedDate < new Date();
  const isDateInPast = false;

  // Generate 24h time options
  const timeOptions = useMemo(() => {
    const opts = [];
    for (let i = 0; i < 24 * 60; i += 15) {
      opts.push({
        value: i,
        label: minutesToHHMM(i),
      });
    }
    return opts;
  }, []);

  // Update total duration when cross-days fields change
  useEffect(() => {
    if (
      watchCrossDays &&
      selectedDate &&
      startHour !== undefined &&
      watchEndDate &&
      watchEndHourInMinutes !== undefined
    ) {
      const start = new Date(selectedDate);
      start.setHours(0, 0, 0, 0); // Reset time part
      // Create a new date object to avoid mutating selectedDate if it's reused elsewhere (though Date is ref type)
      // Actually simpler:
      const startTimeMs = start.getTime() + startHour * 60 * 1000;

      const end = new Date(watchEndDate);
      end.setHours(0, 0, 0, 0);
      const endTimeMs = end.getTime() + watchEndHourInMinutes * 60 * 1000;

      if (endTimeMs > startTimeMs) {
        const diffMs = endTimeMs - startTimeMs;
        const diffMins = Math.floor(diffMs / 60000);
        setValue("totalDurationInMinutes", diffMins);
      }
    }
  }, [
    watchCrossDays,
    selectedDate,
    startHour,
    watchEndDate,
    watchEndHourInMinutes,
    setValue,
  ]);

  useEffect(() => {
    const base = parseStringToCents(watchBasePrice || "0");
    const extraMachine = parseStringToCents(watchExtraMachineCosts || "0");
    const lodging = parseStringToCents(watchLodgingCost || "0");
    const food = parseStringToCents(watchFoodCost || "0");
    const addTransport = parseStringToCents(
      watchAdditionalTransportCost || "0",
    );

    const fuelCents = parseStringToCents(watchFuelCost || "0"); // custo por litro
    const distance = watchDistanceInKm || 0;
    const consumption = watchConsumption || 1;
    const roundTripMultiplier = watchIsRoundTrip ? 2 : 1;

    let totalFuel = 0;
    if (distance > 0 && fuelCents > 0) {
      const litersNeeded = distance / consumption;
      totalFuel = Math.round(litersNeeded * fuelCents * roundTripMultiplier);
    }

    const total =
      base + extraMachine + lodging + food + totalFuel + addTransport;

    setValue("totalPrice", centsToString(total));
  }, [
    watchBasePrice,
    watchExtraMachineCosts,
    watchLodgingCost,
    watchFoodCost,
    watchFuelCost,
    watchDistanceInKm,
    watchAdditionalTransportCost,
    watchConsumption,
    watchIsRoundTrip,
    setValue,
  ]);

  const params = {
    filialId: watchFilialId,
    gears: watchSelectedGears,
    date: selectedDate,
  };
  const { data } = useQuery<ApiResponse<GetDayCheckoutsResponse[]>, Error>({
    queryKey: [ "get-day-checkouts", params ],
    queryFn: () => getDayCheckouts({ body: params }),
    enabled: !!watchFilialId && !!selectedDate && watchSelectedGears.length > 0,
    staleTime: 1000 * 60,
  });
  const checkoutSchedule = data?.data;

  const handleResetValues = useCallback(
    (newFilialId?: string) => {
      reset({
        checkoutStatus: "Pendente",
        paymentStatus: "Pendente",
        paymentInfo: {
          paymentStatus: "Pendente",
          firstPaymentDate: null,
          secondPaymentDate: null,
          firstPaymentAmount: "0,00",
          firstPaymentStatus: "Pendente",
          secondPaymentAmount: "0,00",
          secondPaymentStatus: "Pendente",
        },
        basePrice: "0,00",
        totalPrice: "0,00",
        extraMachineCosts: "0,00",
        lodgingCost: "0,00",
        foodCost: "0,00",
        fuelCost: "0,00",
        additionalTransportCost: "0,00",
        consumption: 10,
        addressId: "",
        filialId:
          newFilialId !== undefined ? newFilialId : defaultFilialId || "",
        accountableEmployeeId: user?.employeeId || user?.sub,
        crossDays: false,
        endDate: undefined,
        endHourInMinutes: undefined,
        isRoundTrip: true,
        observations: "",
        customer: undefined,
        gears: [],
        date: undefined,
        startHourInMinutes: 0,
        totalDurationInMinutes: 0,
        driverId: "",
        distanceInKm: 0,
      });
      setAddressString("");
      setDrivingDistance(0);
      setDriverString("");
    },
    [ defaultFilialId, reset, user?.employeeId, user?.sub ],
  );

  useEffect(() => {
    if (
      watchFilialId &&
      prevFilialId.current &&
      watchFilialId !== prevFilialId.current
    ) {
      handleResetValues(watchFilialId);
    }
    prevFilialId.current = watchFilialId;
  }, [ watchFilialId, handleResetValues ]);

  const handleCreateNewCheckout: SubmitHandler<
    CreateCheckoutFormSchemaType
  > = async (newCheckoutData) => {
    // O campo fuelCost do formulário é o preço por LITRO. Em todo o resto do
    // sistema (backend, edição e exibição) fuelCost representa o custo TOTAL de
    // combustível, então convertemos aqui usando a mesma fórmula do totalPrice.
    // Mesma fórmula (e mesmo fallback de consumo) do cálculo do totalPrice
    // acima, para que fuelCost e totalPrice fiquem sempre consistentes.
    const fuelPerLiterCents = parseStringToCents(newCheckoutData.fuelCost || "0");
    const distanceKm = newCheckoutData.distanceInKm || 0;
    const consumptionKmL = newCheckoutData.consumption || 1;
    const roundTripMultiplier = newCheckoutData.isRoundTrip ? 2 : 1;
    const totalFuelCents =
      distanceKm > 0 && fuelPerLiterCents > 0
        ? Math.round(
          (distanceKm / consumptionKmL) *
              fuelPerLiterCents *
              roundTripMultiplier,
        )
        : 0;

    const parsed = {
      ...newCheckoutData,
      consumption: newCheckoutData.consumption || 10,
      accountableEmployeeId: user?.employeeId || user?.sub || "",

      basePrice: parseStringToCents(newCheckoutData.basePrice || "0"),
      extraMachineCosts: parseStringToCents(
        newCheckoutData.extraMachineCosts || "0",
      ),
      lodgingCost: parseStringToCents(newCheckoutData.lodgingCost || "0"),
      foodCost: parseStringToCents(newCheckoutData.foodCost || "0"),
      fuelCost: totalFuelCents,
      additionalTransportCost: parseStringToCents(
        newCheckoutData.additionalTransportCost || "0",
      ),
      totalPrice: parseStringToCents(newCheckoutData.totalPrice || "0"),

      paymentInfo: buildPaymentInfoPayload(newCheckoutData),

      gears: newCheckoutData.gears.map((item) => ({
        ...item,
        individualPrice: parseStringToCents(item.individualPrice || "0"),
      })),
    };

    const response = await CreateCheckout(parsed);

    if (response.statusCode === 201) {
      toast.success(response.message);
      handleResetValues();
      queryClient.invalidateQueries({ queryKey: [ "get-all-checkouts" ] });
      queryClient.invalidateQueries({ queryKey: [ "get-day-checkouts" ] });
      queryClient.invalidateQueries({ queryKey: [ "get-all-goals" ] });
      window.scrollTo({ top: 0 });
    } else {
      toast.warning(response.message);
    }
  };

  const onInvalid = (errors: FieldErrors<CreateCheckoutFormSchemaType>) => {
    // Function to recursively find the first error key
    const getFirstErrorKey = (
      errorObj: unknown,
      prefix = "",
    ): string | null => {
      if (!errorObj || typeof errorObj !== "object") return null;

      const keys = Object.keys(errorObj as object);
      if (keys.length === 0) return null;

      const firstKey = keys[0];
      const value = (errorObj as Record<string, unknown>)[firstKey];

      // If it has a message, it's a leaf error
      if (value && typeof value === "object" && "message" in value) {
        return prefix ? `${prefix}.${firstKey}` : firstKey;
      }

      // If it's an object (nested error), recurse
      if (typeof value === "object" && value !== null) {
        return getFirstErrorKey(
          value,
          prefix ? `${prefix}.${firstKey}` : firstKey,
        );
      }

      return null;
    };

    const firstErrorKey = getFirstErrorKey(errors);

    if (firstErrorKey) {
      // Tenta encontrar pelo name (com tratamento para nested paths)
      // Ex: customer.customerId pode não ter um input exato, mas podemos tentar focar num container ou input próximo
      let element = document.querySelector(`[name="${firstErrorKey}"]`);

      // Fallback: se for customer.customerId, tenta focar em algo com id ou name que contenha 'customer'
      if (!element) {
        element = document.getElementById(firstErrorKey);
      }

      // Fallback para SelectCustomer e similares que podem usar ids simplificados
      if (!element && firstErrorKey.includes(".")) {
        const parts = firstErrorKey.split(".");
        // Tenta encontrar pelo último pedaço (ex: customerId)
        element =
          document.querySelector(`[name="${parts[parts.length - 1]}"]`) ||
          document.getElementById(parts[parts.length - 1]);
        // Tenta encontrar pelo primeiro pedaço (ex: customer) -> container
        if (!element) {
          element =
            document.querySelector(`[name="${parts[0]}"]`) ||
            document.getElementById(parts[0]);
        }
      }

      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        (element as HTMLElement).focus();
      }
    }
    toast.warning("Verifique os campos obrigatórios.");
  };

  return (
    <div>
      <div className="space-y-2 mb-8 flex flex-col md:flex-row md:items-center">
        <div className="ml-auto mr-auto w-[50%]">
          <SelectFilial<CreateCheckoutFormSchemaType>
            control={ control }
            name="filialId"
            accessibleFilials={ accessibleFilialsIds }
            defaultFilial={ defaultFilialId }
          />
        </div>
      </div>

      <form
        id="new-booking-form"
        onSubmit={ handleSubmit(handleCreateNewCheckout, onInvalid) }
      >
        <FormProvider { ...createBookingFormMethods }>
          <div className="flex flex-col gap-10">
            {/* Card de Informações Básicas */}
            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-primary" /> Informações básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 w-full">
                <div className="space-y-2 w-full" id="customer">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <User className="w-4 h-4" /> Cliente
                  </Label>
                  <SelectCustomer />
                </div>

                <div className="space-y-2 w-full" id="addressId">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <Pin className="w-4 h-4" /> Endereço
                  </Label>
                  <SelectAddress setAddressString={ setAddressString } />
                  {errors.addressId && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.addressId.message}
                    </p>
                  )}
                </div>

                <GearsSection />

                <AdditionalCostsDialog
                  setAdditionalCostsDialogOpen={ setAdditionalCostsDialogOpen }
                  isAdditionalCostsDialogOpen={ isAdditionalCostsDialogOpen }
                />

                <div className="space-y-2" id="driverId">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <Truck className="h-5 w-5 text-primary" /> Motorista
                  </Label>
                  <SelectEmployee<CreateCheckoutFormSchemaType>
                    control={ control }
                    name="driverId"
                    setDriverString={ setDriverString }
                    employeeRole={ DRIVER_ROLES }
                    filialId={ watchFilialId }

                    // filialId={
                    //   user?.role === USER_ROLES.GERENTE
                    //     ? undefined
                    //     : user?.sourceFilialId
                    // }
                  />
                  {errors.driverId && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.driverId.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Seletor de Data e Hora */}
            <CheckoutTimeSelector<CreateCheckoutFormSchemaType>
              name="date"
              control={ control }
              checkoutSchedule={ checkoutSchedule }
            />

            {watchCrossDays && (
              <CheckoutEndTimeSelector<CreateCheckoutFormSchemaType>
                control={ control }
                name="endDate"
              />
            )}

            {/* Observações */}
            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="h-5 w-5 text-primary" /> Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  { ...register("observations") }
                  className="min-h-[120px] resize-none"
                  placeholder="Digite informações adicionais..."
                />
              </CardContent>
            </Card>

            {/* Novo Componente de Pagamento */}
            <CheckoutPaymentMethod />

            {/* Resumo Final */}
            {!!selectedDate &&
              startHour !== undefined &&
              !!watchTotalDurationInMinutes &&
              !!watchTotalPrice &&
              !isDateInPast &&
              !!watchCustomer?.fullname && (
              <Card className="bg-primary/5 border-primary/20 w-[80%] ml-auto mr-auto">
                <CardHeader>
                  <CardTitle className="text-lg text-primary flex justify-between">
                      Resumo da Reserva
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={ () => {
                        const textToCopy = `
Equipamento${watchSelectedGears.length > 1 ? "s" : ""}: ${watchSelectedGears
                .map((item) => item.gearName)
                .join(", ")}
Data: ${selectedDate.toLocaleDateString("pt-BR")}
Horário: ${minutesToHHMM(startHour)} - ${minutesToHHMM(
                startHour + watchTotalDurationInMinutes,
              )}
Duração: ${watchTotalDurationInMinutes / 60}h
Preço: R$ ${watchTotalPrice}
Cliente: ${watchCustomer.fullname} - ${watchCustomer.cpf || watchCustomer.cnpj}
Contato: ${watchCustomer.cellphone}
Endereço: ${addressString}
Motorista: ${driverString || "A definir"}
    `
                          .replace(/[ \t]+\n/g, "\n")
                          .trim();

                        navigator.clipboard.writeText(textToCopy);
                        toast.success(
                          "Resumo copiado para a área de transferência.",
                        );
                      } }
                    >
                      <Copy className="w-4 h-4 text-primary" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                        Equipamento{watchSelectedGears.length > 1 ? "s" : ""}:
                    </span>
                    <span className="font-medium">
                      {watchSelectedGears
                        .map((item) => item.gearName)
                        .join(", ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data:</span>
                    <span className="font-medium">
                      {selectedDate.toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Horário:</span>
                    <span className="font-medium">
                      {minutesToHHMM(startHour)} -{" "}
                      {minutesToHHMM(startHour + watchTotalDurationInMinutes)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duração:</span>
                    <span className="font-medium">
                      {watchTotalDurationInMinutes / 60}h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Preço:</span>
                    <span className="font-medium">R$ {watchTotalPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cliente:</span>
                    <span className="font-medium">
                      {watchCustomer.fullname} -{" "}
                      {watchCustomer.cpf || watchCustomer.cnpj}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contato:</span>
                    <span className="font-medium">
                      {watchCustomer.cellphone}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Endereço:</span>
                    <span className="font-medium text-right">
                      {addressString}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Motorista:</span>
                    <span className="font-medium text-right">
                      {driverString || "A definir"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Botão de Envio */}
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full md:w-auto md:min-w-[300px] md:ml-auto flex"
                size="lg"
                disabled={ isSubmitting || isLoading }
              >
                {isSubmitting || isLoading ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Check className="h-5 w-5 mr-2" />
                )}
                Finalizar Reserva
              </Button>
            </div>
          </div>
        </FormProvider>
      </form>
    </div>
  );
}
