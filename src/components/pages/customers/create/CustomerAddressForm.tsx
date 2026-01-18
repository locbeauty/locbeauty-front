"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormContext } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import CEPInput from "@/components/shared/CEPInput";
import { CreateCustomerFormSchemaType } from "@/lib/zod/CreateCustomerValidation";
import { MapPin } from "lucide-react";

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
          <div className="space-y-2">
            <Label htmlFor="cidade">Cidade</Label>
            <Input
              disabled
              { ...register("address.cityName") }
              placeholder="Cidade"
              className=""
              id="cidade"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Input
              disabled
              { ...register("address.stateName") }
              placeholder="Estado"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bairro">Bairro</Label>
          <Input
            disabled
            { ...register("address.neighborhoodName") }
            placeholder="Bairro"
            className="placeholder:text-placeholder"
            id="bairro"
          />
        </div>
        <div className="flex md:flex-row flex-col md:items-start gap-4">
          <div className="space-y-2 flex-1">
            <Label htmlFor="rua">Rua</Label>
            <Input
              disabled
              { ...register("address.streetName") }
              id="rua"
              className="placeholder:text-placeholder"
              placeholder="Nome da rua"
            />
          </div>
          <div className="space-y-2 w-full md:w-[120px]">
            <Label htmlFor="number">Número</Label>
            <Input
              { ...register("address.buildingNumber") }
              id="number"
              className="placeholder:text-placeholder"
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
            className="h-[100px] resize-none w-full placeholder:text-placeholder"
            placeholder="Digite detalhes adicionais, como número do apartamento, bloco ou ponto de referência"
          />
        </div>
      </CardContent>
    </Card>
  );
}
