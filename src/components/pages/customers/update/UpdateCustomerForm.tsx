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
import { CUSTOMER_STATUSES } from "@/utils/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PhoneInput from "../../../shared/PhoneInput";
import DocumentInput from "../../../shared/DocumentInput";
import { UpdateCustomerFormSchemaType } from "@/lib/zod/UpdateCustomerValidation";
import { toast } from "sonner";
import { Customer } from "@/utils/@types/customer";
import { useEffect, useState } from "react";
import { fetchWithToken } from "@/utils/fetchWithToken";
import { ApiResponse } from "@/lib/api";

interface UpdateCustomerFormProps {
  selectedCustomer: Customer | null;
}

export function UpdateCustomerForm({
  selectedCustomer,
}: UpdateCustomerFormProps) {
  const {
    handleSubmit,
    formState: { errors },
    register,
    setValue,
    control,
  } = useFormContext<UpdateCustomerFormSchemaType>();

  // useEffect(() => {
  //     async function getCustomerAddresses(customerId: string) {
  //         const response = await fetchWithToken(`${process.env.NEXT_PUBLIC_SERVER_URL}/customer/addresses?customerId=${customerId}`, {
  //             credentials: "include",
  //         });
  //         const { data }: {data: Address[]} = await response.json();
  //         // setCustomerAddresses(data);
  //     }
  //     if(selectedCustomer && selectedCustomer.customerId) {
  //         getCustomerAddresses(selectedCustomer.customerId);
  //     }
  // }, [ selectedCustomer ]);

  if (!selectedCustomer) return;

  return (
    <>
      {/* <CustomerGeneralInformationForm /> */}
      <Card>
        <CardHeader>
          <CardTitle>Dados Pessoais</CardTitle>
          <CardDescription>
            Preencha os dados pessoais do cliente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border p-4 rounded-md ">
            <h3 className="text-lg font-medium mb-4">Informações do Cliente</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  className="placeholder:text-muted-foreground/50"
                  { ...register("fullname") }
                  id="nome"
                  placeholder="Nome completo"
                />
                <div className="h-3">
                  {errors.fullname && (
                    <p className="text-xs font-medium text-destructive">
                      {errors.fullname.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="empresa">Empresa</Label>
                <Input
                  className="placeholder:text-muted-foreground/50"
                  { ...register("companyName") }
                  id="empresa"
                  placeholder="Nome da empresa"
                  onBlur={ (e) => {
                    if (e.target.value === "") {
                      setValue("companyName", null);
                    }
                  } }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <DocumentInput
                  register={ register("cpf") }
                  isCPF
                  placeholder="000.000.000-00"
                />
                <div className="h-3">
                  {errors.cpf && (
                    <p className="text-xs font-medium text-destructive">
                      {errors.cpf.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <DocumentInput
                  register={ register("cnpj") }
                  placeholder="00.000.000/0000-00"
                />
                <div className="h-3">
                  {errors.cnpj && (
                    <p className="text-xs font-medium text-destructive">
                      {errors.cnpj.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Controller
                  name="customerStatus"
                  control={ control }
                  render={ ({ field }) => (
                    <Select onValueChange={ field.onChange } value={ field.value }>
                      <SelectTrigger id="status" className="w-full">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        {CUSTOMER_STATUSES.map((status) => (
                          <SelectItem key={ status } value={ status }>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) }
                />
              </div>
            </div>
          </div>

          <div className="border p-4 rounded-md">
            <h3 className="text-lg font-medium mb-4">Informações de Contato</h3>
            <div className="space-y-4">
              <div className="space-y-4">
                {/* Emails */}
                <div className="space-y-4">
                  <Label>Emails</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Input
                        className="placeholder:text-muted-foreground/50"
                        { ...register("email") }
                        placeholder="Email Principal"
                        type="email"
                        onBlur={ (e) => {
                          if (e.target.value === "") setValue("email", null);
                        } }
                      />
                    </div>
                    <div className="space-y-2">
                      <Input
                        className="placeholder:text-muted-foreground/50"
                        { ...register("emailDescription") }
                        placeholder="Descrição (ex: Pessoal)"
                        onBlur={ (e) => {
                          if (e.target.value === "")
                            setValue("emailDescription", null);
                        } }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Input
                        className="placeholder:text-muted-foreground/50"
                        { ...register("secondaryEmail") }
                        placeholder="Email Secundário"
                        type="email"
                        onBlur={ (e) => {
                          if (e.target.value === "")
                            setValue("secondaryEmail", null);
                        } }
                      />
                      {errors.secondaryEmail && (
                        <p className="text-xs font-medium text-destructive">
                          {errors.secondaryEmail.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Input
                        className="placeholder:text-muted-foreground/50"
                        { ...register("secondaryEmailDescription") }
                        placeholder="Descrição (ex: Trabalho)"
                        onBlur={ (e) => {
                          if (e.target.value === "")
                            setValue("secondaryEmailDescription", null);
                        } }
                      />
                    </div>
                  </div>
                </div>

                {/* Phones */}
                <div className="space-y-4">
                  <Label>Telefones</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <PhoneInput control={ control } name="cellphone" />
                      <div className="h-3">
                        {errors.cellphone && (
                          <p className="text-xs font-medium text-destructive">
                            {errors.cellphone.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Input
                        className="placeholder:text-muted-foreground/50"
                        { ...register("cellphoneDescription") }
                        placeholder="Descrição (ex: WhatsApp)"
                        onBlur={ (e) => {
                          if (e.target.value === "")
                            setValue("cellphoneDescription", null);
                        } }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <PhoneInput control={ control } name="secondaryCellphone" />
                      {errors.secondaryCellphone && (
                        <p className="text-xs font-medium text-destructive">
                          {errors.secondaryCellphone.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Input
                        className="placeholder:text-muted-foreground/50"
                        { ...register("secondaryCellphoneDescription") }
                        placeholder="Descrição (ex: Casa)"
                        onBlur={ (e) => {
                          if (e.target.value === "")
                            setValue("secondaryCellphoneDescription", null);
                        } }
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                    @
                  </span>
                  <Input
                    { ...register("instagram") }
                    id="instagram"
                    className="pl-8 placeholder:text-muted-foreground/50"
                    placeholder="usuario"
                    onBlur={ (e) => {
                      if (e.target.value === "") {
                        setValue("instagram", null);
                      }
                    } }
                  />
                </div>
                {errors.instagram && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.instagram.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
