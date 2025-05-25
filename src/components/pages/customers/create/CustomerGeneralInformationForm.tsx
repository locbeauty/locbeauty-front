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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import PhoneInput from "../../../shared/PhoneInput";
import DocumentInput from "../../../shared/DocumentInput";
import { Controller, useFormContext } from "react-hook-form";
import { SelectRegional } from "../../../shared/SelectRegional";
import { DatePicker } from "@/components/ui/DatePicker";
import { CreateCustomerFormSchemaType } from "@/lib/zod/CreateCustomerValidation";

export function CustomerGeneralInformationForm() {
    const {
        register,
        control,
        watch,
        setValue,
        trigger,
        formState: { errors },
    } = useFormContext<CreateCustomerFormSchemaType>();

    const personType = watch("personType");
    const birthdate = watch("birthdate");

    return (
        <Card>
            <CardHeader>
                <CardTitle>Dados Pessoais</CardTitle>
                <CardDescription>Preencha os dados pessoais do cliente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col-reverse md:flex-row gap-4 justify-between md:items-center">
                    <div className="space-y-4">
                        <Label>Tipo de Pessoa</Label>
                        <Controller
                            name="personType"
                            control={ control }
                            defaultValue="PF"
                            render={ ({ field }) => {
                                return (
                                    <RadioGroup
                                        defaultValue="PF"
                                        className="flex gap-4"
                                        onValueChange={ field.onChange }
                                        value={ field.value }
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="PF" id="pessoa-fisica" />
                                            <Label htmlFor="pessoa-fisica">Pessoa Física</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="PJ" id="pessoa-juridica" />
                                            <Label htmlFor="pessoa-juridica">Pessoa Jurídica</Label>
                                        </div>
                                    </RadioGroup>
                                );
                            } }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Regional</Label>
                        <Controller
                            name="personType"
                            control={ control }
                            defaultValue="PF"
                            render={ () => {
                                return (
                                    <SelectRegional<CreateCustomerFormSchemaType>
                                        control={ control }
                                        name="regionalId"
                                    />
                                );
                            } }
                        />
                    </div>
                </div>

                <div className="border p-4 rounded-md md:h-[350px] h-[350px]">
                    <h3 className="text-lg font-medium mb-4">Informações do Cliente</h3>

                    <div className="relative">
                        {/* Campos específicos de Pessoa Física */}
                        <div
                            className={ `space-y-4 transition-all duration-300 ease-in-out ${
                                personType === "PF"
                                    ? "opacity-100 visible"
                                    : "opacity-0 max-h-0 invisible overflow-hidden"
                            }` }
                        >
                            <div className="space-y-2">
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
                            <div className="space-y-2">
                                <Label htmlFor="cpf">CPF</Label>
                                <DocumentInput register={ register("CPF") } documentType="CPF" />
                                <div className="h-3">
                                    {errors.CPF && (
                                        <p className="text-xs font-medium text-destructive">
                                            {errors.CPF.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="aniversario">Data de nascimento</Label>
                                <Controller
                                    control={ control }
                                    name="birthdate"
                                    render={ () => (
                                        <DatePicker
                                            placeholder="Escolha a data de nascimento"
                                            value={ birthdate }
                                            onChange={ (date) => {
                                                setValue("birthdate", date);
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
                        </div>

                        {/* Campos específicos de Pessoa Jurídica */}
                        <div
                            className={ `space-y-4 transition-all duration-300 ease-in-out ${
                                personType === "PJ"
                                    ? "opacity-100 max-h-[200px] visible"
                                    : "opacity-0 max-h-0 invisible overflow-hidden"
                            }` }
                        >
                            <div className="space-y-2">
                                <Label htmlFor="empresa">Empresa</Label>
                                <Input
                                    className="placeholder:text-placeholder"
                                    { ...register("companyName") }
                                    id="empresa"
                                    placeholder="Nome da empresa"
                                    disabled={ personType !== "PJ" }
                                />
                                <div className="h-3">
                                    {errors.companyName && (
                                        <p className="text-xs font-medium text-destructive">
                                            {errors.companyName.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cnpj">CNPJ</Label>
                                <DocumentInput
                                    register={ register("CNPJ") }
                                    documentType="CNPJ"
                                />
                                <div className="h-3">
                                    {errors.CNPJ && (
                                        <p className="text-xs font-medium text-destructive">
                                            {errors.CNPJ.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome do Responsável</Label>
                                <Input
                                    className="placeholder:text-placeholder"
                                    { ...register("personAccountableName") }
                                    id="personAccountableName"
                                    placeholder={ "Nome do responsável" }
                                />
                                <div className="h-3">
                                    {errors.personAccountableName && (
                                        <p className="text-xs font-medium text-destructive">
                                            {errors.personAccountableName.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border p-4 rounded-md">
                    <h3 className="text-lg font-medium mb-4">Informações de Contato</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    className="placeholder:text-placeholder"
                                    { ...register("email") }
                                    id="email"
                                    type="email"
                                    placeholder="email@exemplo.com"
                                />
                                <div className="h-3">
                                    {errors.email && (
                                        <p className="text-xs font-medium text-destructive">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="telefone">Telefone</Label>
                                <PhoneInput register={ register("cellphone") } />
                                <div className="h-3">
                                    {errors.cellphone && (
                                        <p className="text-xs font-medium text-destructive">
                                            {errors.cellphone.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="instagram">Instagram</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">@</span>
                                <Input { ...register("instagram") }  id="instagram" className="pl-8 placeholder:text-placeholder" placeholder="usuario" />
                            </div>
                            {errors.instagram && <p className="text-xs font-medium text-destructive">{errors.instagram.message}</p>}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
