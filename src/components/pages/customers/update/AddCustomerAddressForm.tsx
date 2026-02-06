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
import { Controller, useFormContext } from "react-hook-form";
import { BRAZILIAN_STATES } from "@/utils/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import CEPInput from "@/components/shared/CEPInput";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddressTypeSchema } from "@/lib/zod/address";
import { AddressAutocompleteInput } from "@/components/shared/AddressAutocompleteInput";

interface AddCustomerAddressFormProps {
  handleSaveUpdatedCustomer: (newAddressData: AddressTypeSchema) => void;
  hideButton?: boolean;
}

export function AddCustomerAddressForm({
  handleSaveUpdatedCustomer,
  hideButton = false,
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
        <div className="contents">
          <CEPInput
            clearErrors={ clearErrors }
            control={ control }
            setError={ setError }
            setValue={ setValue }
            trigger={ trigger }
            isUpdateForm={ true }
            zipCodeError={ errors.zipCode?.message }
          />

          <div className="grid gap-4 md:grid-cols-2 mt-6">
            <AddressAutocompleteInput
              name="cityName"
              label="Cidade"
              placeholder="Cidade"
              suggestionType="city"
              id="cidade"
            />
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Controller
                name="stateName"
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
                {errors.stateName && (
                  <p className="text-sm font-medium text-destructive">
                    {errors.stateName.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <AddressAutocompleteInput
              name="neighborhoodName"
              label="Bairro"
              placeholder="Bairro"
              suggestionType="neighborhood"
              id="bairro"
            />
          </div>

          <div className="flex md:flex-row flex-col md:items-start gap-4 mt-6">
            <AddressAutocompleteInput
              name="streetName"
              label="Rua"
              placeholder="Nome da rua"
              suggestionType="street"
              id="rua"
              className="flex-1"
            />
            <div className="space-y-2">
              <Label htmlFor="number">Número</Label>
              <Input
                { ...register("buildingNumber") }
                id="number"
                className="placeholder:text-muted-foreground/50"
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
          <div className="space-y-2 mt-6">
            <Label htmlFor="number">Complemento</Label>

            <Textarea
              { ...register("addressComplement") }
              className="h-[100px] resize-none max-w-[80vw] placeholder:text-muted-foreground/50"
              placeholder="Digite detalhes adicionais, como número do apartamento, bloco ou ponto de referência"
            />
          </div>
          {!hideButton && (
            <div className="flex mt-6">
              <Button
                type="button"
                className="ml-auto flex"
                onClick={ handleSubmit(handleSaveUpdatedCustomer) }
              >
                Adicionar
                <Plus />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
