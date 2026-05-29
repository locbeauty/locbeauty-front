"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import PhoneInput from "../../../shared/PhoneInput";
import DocumentInput from "../../../shared/DocumentInput";
import { Controller, useFormContext } from "react-hook-form";
import { DatePicker } from "@/components/ui/DatePicker";
import { CreateCustomerFormSchemaType } from "@/lib/zod/CreateCustomerValidation";
import { Button } from "@/components/ui/button";
import { X, User, Phone, Mail } from "lucide-react";
import { SelectFilial } from "@/components/shared/SelectFilial";
import { SelectFilials } from "@/components/shared/SelectFilials";
import { useAuth } from "@/contexts/auth-provider";

interface CustomerGeneralInformationFormProps {
  accessibleFilialsIds?: string[];
  defaultFilialId?: string;
}

export function CustomerGeneralInformationForm({
  accessibleFilialsIds,
  defaultFilialId,
}: CustomerGeneralInformationFormProps) {
  const {
    register,
    control,
    watch,
    setValue,
    trigger,
    clearErrors,
    formState: { errors },
  } = useFormContext<CreateCustomerFormSchemaType>();
  const { user } = useAuth();

  const birthdate = watch("birthdate");

  function clearBirthdate() {
    setValue("birthdate", null);
    clearErrors("birthdate");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados Pessoais</CardTitle>
        <CardDescription>Preencha os dados pessoais do cliente</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border p-4 rounded-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-medium">Informações do Cliente</h3>
            </div>
            {/* <div className="flex items-center space-x-2">
              <Controller
                control={ control }
                name="isTrainee"
                render={ ({ field }) => (
                  <Checkbox
                    id="isTrainee"
                    checked={ field.value }
                    onCheckedChange={ field.onChange }
                  />
                ) }
              />
              <Label htmlFor="isTrainee">É Aluno?</Label>
            </div> */}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="space-y-2 col-span-12 md:col-span-4">
                <Label>Filial *</Label>
                <Controller
                  control={ control }
                  name="filialId"
                  render={ ({ field }) => (
                    <SelectFilial
                      control={ control }
                      name="filialId"
                      accessibleFilials={ accessibleFilialsIds }
                      defaultFilial={ defaultFilialId }
                    />
                  ) }
                />
                {errors.filialId && (
                  <p className="text-sm text-destructive">
                    {errors.filialId.message}
                  </p>
                )}
              </div>
              <div className="space-y-2 col-span-12 md:col-span-8">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  className="placeholder:text-placeholder"
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
            </div>

            <div className="space-y-2">
              <Label>Outras filiais em que atua</Label>
              <Controller
                control={ control }
                name="filialIds"
                render={ ({ field }) => (
                  <SelectFilials
                    value={ field.value ?? [] }
                    onChange={ field.onChange }
                    accessibleFilials={ accessibleFilialsIds }
                    excludeFilialId={ watch("filialId") }
                    placeholder="Selecione filiais adicionais (opcional)"
                  />
                ) }
              />
              <p className="text-xs text-muted-foreground">
                A filial principal selecionada acima já é incluída
                automaticamente.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="empresa">Empresa</Label>
                <Input
                  className="placeholder:text-placeholder"
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="birthdate">Data de nascimento</Label>
                  <Controller
                    control={ control }
                    name="birthdate"
                    render={ () => (
                      <DatePicker
                        id="birthdate"
                        placeholder="Escolha a data de nascimento"
                        value={ birthdate ?? null }
                        onChange={ (date) => {
                          setValue("birthdate", date ? date : null);
                          trigger("birthdate");
                        } }
                        classNames={ {
                          trigger:
                            errors.birthdate &&
                            "border-destructive focus-visible:ring-destructive",
                        } }
                      />
                    ) }
                  />
                  <div className="h-3">
                    {errors.birthdate && (
                      <p className="text-xs font-medium text-destructive">
                        {errors.birthdate.message}
                      </p>
                    )}
                  </div>
                </div>
                {birthdate && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={ clearBirthdate }
                    className="h-9 w-9 p-0"
                  >
                    <X className="size-4" />
                  </Button>
                )}
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
                    className="pl-8 placeholder:text-placeholder"
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
        </div>

        <div className="border p-4 rounded-md">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-medium">Informações de Contato</h3>
          </div>

          <div className="space-y-6">
            {/* Emails Section */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Emails</Label>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="space-y-2 col-span-12 md:col-span-8">
                  <Input
                    { ...register("email") }
                    placeholder="Email Principal"
                    type="email"
                    onBlur={ (e) => {
                      if (e.target.value === "") setValue("email", null);
                    } }
                    className="placeholder:text-placeholder"
                  />
                </div>
                <div className="space-y-2 col-span-12 md:col-span-4">
                  <Input
                    { ...register("emailDescription") }
                    placeholder="Descrição (ex: Pessoal)"
                    onBlur={ (e) => {
                      if (e.target.value === "")
                        setValue("emailDescription", null);
                    } }
                    className="placeholder:text-placeholder"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="space-y-2 col-span-12 md:col-span-8">
                  <Input
                    { ...register("secondaryEmail") }
                    placeholder="Email Secundário"
                    type="email"
                    onBlur={ (e) => {
                      if (e.target.value === "")
                        setValue("secondaryEmail", null);
                    } }
                    className="placeholder:text-placeholder"
                  />
                  {errors.secondaryEmail && (
                    <p className="text-xs font-medium text-destructive">
                      {errors.secondaryEmail.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2 col-span-12 md:col-span-4">
                  <Input
                    { ...register("secondaryEmailDescription") }
                    placeholder="Descrição (ex: Trabalho)"
                    onBlur={ (e) => {
                      if (e.target.value === "")
                        setValue("secondaryEmailDescription", null);
                    } }
                    className="placeholder:text-placeholder"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-4">
                <Phone className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-medium">Telefones</h3>
              </div>
              {/* Phones Section */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="space-y-2 col-span-12 md:col-span-8">
                    <PhoneInput control={ control } name="cellphone" />
                    <div className="h-3">
                      {errors.cellphone && (
                        <p className="text-xs font-medium text-destructive">
                          {errors.cellphone.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 col-span-12 md:col-span-4">
                    <Input
                      { ...register("cellphoneDescription") }
                      placeholder="Descrição (ex: WhatsApp)"
                      onBlur={ (e) => {
                        if (e.target.value === "")
                          setValue("cellphoneDescription", null);
                      } }
                      className="placeholder:text-placeholder"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="space-y-2 col-span-12 md:col-span-8">
                    <PhoneInput control={ control } name="secondaryCellphone" />
                    {errors.secondaryCellphone && (
                      <p className="text-xs font-medium text-destructive">
                        {errors.secondaryCellphone.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 col-span-12 md:col-span-4">
                    <Input
                      { ...register("secondaryCellphoneDescription") }
                      placeholder="Descrição (ex: Casa)"
                      onBlur={ (e) => {
                        if (e.target.value === "")
                          setValue("secondaryCellphoneDescription", null);
                      } }
                      className="placeholder:text-placeholder"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
