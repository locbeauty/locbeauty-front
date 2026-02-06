"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Controller, useFormContext } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import CEPInput from "@/components/shared/CEPInput";
import { CreateCustomerFormSchemaType } from "@/lib/zod/CreateCustomerValidation";
import { MapPin } from "lucide-react";
import { AddressAutocompleteInput } from "@/components/shared/AddressAutocompleteInput";
import { BRAZILIAN_STATES } from "@/utils/constants";

export function CustomerAddressForm() {
  const {
    register,
    trigger,
    clearErrors,
    control,
    setError,
    setValue,
    formState: { errors },
  } = useFormContext<CreateCustomerFormSchemaType>();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <CardTitle>Endereço</CardTitle>
        </div>
        <CardDescription>
          Preencha os dados de endereço do cliente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <CEPInput
          clearErrors={ clearErrors }
          control={ control }
          setError={ setError }
          setValue={ setValue }
          trigger={ trigger }
          zipCodeError={ errors.address?.zipCode?.message }
        />

        <div className="grid gap-4 md:grid-cols-2">
          <AddressAutocompleteInput
            name="address.cityName"
            label="Cidade"
            placeholder="Cidade"
            suggestionType="city"
            id="cidade"
          />
          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Controller
              name="address.stateName"
              control={ control }
              render={ ({ field }) => (
                <Select onValueChange={ field.onChange } value={ field.value ?? "" }>
                  <SelectTrigger id="estado" className="w-full">
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRAZILIAN_STATES.map((state) => (
                      <SelectItem key={ state } value={ state }>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) }
            />
            <div className="min-h-[20px]">
              {errors.address?.stateName && (
                <p className="text-sm font-medium text-destructive">
                  {errors.address.stateName.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <AddressAutocompleteInput
          name="address.neighborhoodName"
          label="Bairro"
          placeholder="Bairro"
          suggestionType="neighborhood"
          id="bairro"
        />

        <div className="flex md:flex-row flex-col md:items-start gap-4">
          <AddressAutocompleteInput
            name="address.streetName"
            label="Rua"
            placeholder="Nome da rua"
            suggestionType="street"
            id="rua"
            className="flex-1"
          />
          <div className="space-y-2 w-full md:w-[120px]">
            <Label htmlFor="number">Número</Label>
            <Input
              { ...register("address.buildingNumber") }
              id="number"
              className="placeholder:text-muted-foreground/50"
              placeholder="Número"
            />
            <div className="min-h-[20px]">
              {errors.address?.buildingNumber && (
                <p className="text-sm font-medium text-destructive">
                  {errors.address.buildingNumber.message}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="addressComplement">Complemento</Label>
          <Textarea
            { ...register("address.addressComplement") }
            id="addressComplement"
            className="h-[100px] resize-none w-full placeholder:text-muted-foreground/50"
            placeholder="Digite detalhes adicionais, como número do apartamento, bloco ou ponto de referência"
          />
        </div>
      </CardContent>
    </Card>
  );
}
