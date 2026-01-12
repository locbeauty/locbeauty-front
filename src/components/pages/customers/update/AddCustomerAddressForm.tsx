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
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useEffect } from "react";
import { AddressTypeSchema } from "@/lib/zod/address";
import { toast } from "sonner";

interface AddCustomerAddressFormProps {
  handleSaveUpdatedCustomer: (newAddressData: AddressTypeSchema) => void;
}

export function AddCustomerAddressForm({
  handleSaveUpdatedCustomer,
}: AddCustomerAddressFormProps) {
  const {
    register,
    trigger,
    clearErrors,
    control,
    setError,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useFormContext<AddressTypeSchema>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastrar endereço</CardTitle>
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
          isUpdateForm={ true }
          zipCodeError={ errors.zipCode?.message }
        />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cidade">Cidade</Label>
            <Input
              { ...register("cityName") }
              placeholder="Cidade"
              className=""
              id="cidade"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Input { ...register("stateName") } placeholder="Estado" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bairro">Bairro</Label>
          <Input
            { ...register("neighborhoodName") }
            placeholder="Bairro"
            className="placeholder:text-placeholder"
            id="bairro"
          />
        </div>
        <div className="flex md:flex-row flex-col md:items-start gap-4">
          <div className="space-y-2 flex-1">
            <Label htmlFor="rua">Rua</Label>
            <Input
              { ...register("streetName") }
              id="rua"
              className="placeholder:text-placeholder"
              placeholder="Nome da rua"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="number">Número</Label>
            <Input
              { ...register("buildingNumber") }
              id="number"
              className="placeholder:text-placeholder"
              placeholder="Número"
            />
            <div className="min-h-[20px]">
              {errors.buildingNumber && (
                <p className="text-sm font-medium text-destructive">
                  {errors.buildingNumber.message}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="number">Complemento</Label>

          <Textarea
            { ...register("addressComplement") }
            className="h-[100px] resize-none max-w-[80vw] placeholder:text-placeholder"
            placeholder="Digite detalhes adicionais, como número do apartamento, bloco ou ponto de referência"
          />
        </div>
        <div className="flex">
          <Button
            type="submit"
            onClick={ handleSubmit(
              (data: AddressTypeSchema) => handleSaveUpdatedCustomer(data),
              (errors) => {
                console.log(errors);
                const firstError = Object.values(errors)[0];
                if (firstError) {
                  toast.warning(firstError.message || "Erro de validação", {
                    style: { fontSize: "1rem" },
                  });
                }
              }
            ) }
            className="ml-auto flex"
          >
            Adicionar
            <Plus />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
