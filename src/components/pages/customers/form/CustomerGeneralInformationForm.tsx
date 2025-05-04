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
import PhoneInput from "./PhoneInput";
import DocumentInput from "./DocumentInput";
import { Controller, useFormContext } from "react-hook-form";
import { CreateCustomerFormSchemaType } from "./CreateCustomerForm";
import { SingleDatePicker, SingleDateYearTrigger } from "@/components/ui/single-date-picker";

export function CustomerGeneralInformationForm() {
    const {
        register,
        control,
        watch,
        formState: { errors },
    } = useFormContext<CreateCustomerFormSchemaType>();

    const personType = watch("personType");

    return (
        <Card>
            <CardHeader>
                <CardTitle>Dados Pessoais</CardTitle>
                <CardDescription>Preencha os dados pessoais do cliente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
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

                <div className="border p-4 rounded-md">
                    <h3 className="text-lg font-medium mb-4">Informações do Cliente</h3>

                    { /* Área com altura fixa para os campos específicos */ }
                    <div className="relative">
                        { /* Campos específicos de Pessoa Física */ }
                        <div
                            className={ `space-y-4 transition-all duration-300 ease-in-out ${
                                personType === "PF"
                                    ? "opacity-100 max-h-[200px] visible"
                                    : "opacity-0 max-h-0 invisible overflow-hidden"
                            }` }
                        >
                            <div className="space-y-2">
                                <Label htmlFor="cpf">CPF</Label>
                                <DocumentInput register={ register("CPF") } documentType="CPF" />
                                { errors.CPF && (
                                    <p className="text-sm font-medium text-destructive">
                                        { errors.CPF.message }
                                    </p>
                                ) }
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="aniversario">Aniversário</Label>
                                <Controller
                                    control={ control }
                                    name="birthday"
                                    render={ () => (
                                        <SingleDatePicker
                                            control={ control }
                                            name="birthday"
                                            placeholder="Selecione a data de nascimento"
                                        >
                                            <SingleDateYearTrigger />
                                        </SingleDatePicker>
                                    ) }
                                />
                                { errors.birthday && (
                                    <p className="text-sm font-medium text-destructive">
                                        { errors.birthday.message }
                                    </p>
                                ) }
                            </div>
                        </div>

                        { /* Campos específicos de Pessoa Jurídica */ }
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
                                    { ...register("companyName") }
                                    id="empresa"
                                    placeholder="Nome da empresa"
                                    disabled={ personType !== "PJ" }
                                />
                                { errors.companyName && (
                                    <p className="text-sm font-medium text-destructive">
                                        { errors.companyName.message }
                                    </p>
                                ) }
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cnpj">CNPJ</Label>
                                <DocumentInput
                                    register={ register("CNPJ") }
                                    documentType="CNPJ"
                                />
                                { errors.CNPJ && (
                                    <p className="text-sm font-medium text-destructive">
                                        { errors.CNPJ.message }
                                    </p>
                                ) }
                            </div>
                        </div>
                    </div>

                    { /* Campos comuns para ambos os tipos */ }
                    <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="nome">
                Nome { personType === "PJ" ? "do Responsável" : "Completo" }
                            </Label>
                            <Input
                                { ...register(
                                    personType === "PF" ? "customerName" : "companyName"
                                ) }
                                id="nome"
                                placeholder={
                                    personType === "PJ" ? "Nome do responsável" : "Nome completo"
                                }
                            />
                            { errors.customerName && (
                                <p className="text-sm font-medium text-destructive">
                                    { errors.customerName.message }
                                </p>
                            ) }
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
                                    { ...register("email") }
                                    id="email"
                                    type="email"
                                    placeholder="email@exemplo.com"
                                />
                                { errors.email && (
                                    <p className="text-sm font-medium text-destructive">
                                        { errors.email.message }
                                    </p>
                                ) }
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="telefone">Telefone</Label>
                                <PhoneInput register={ register("cellphone") } />
                                { errors.cellphone && (
                                    <p className="text-sm font-medium text-destructive">
                                        { errors.cellphone.message }
                                    </p>
                                ) }
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="instagram">Instagram</Label>
                            <Input
                                { ...register("instagram") }
                                id="instagram"
                                placeholder="@usuario"
                            />
                            { errors.instagram && (
                                <p className="text-sm font-medium text-destructive">
                                    { errors.instagram.message }
                                </p>
                            ) }
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
