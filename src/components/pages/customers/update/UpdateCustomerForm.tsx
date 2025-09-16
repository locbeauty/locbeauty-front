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
import PhoneInput from "../../../shared/PhoneInput";
import DocumentInput from "../../../shared/DocumentInput";
import { useFormContext } from "react-hook-form";
import { UpdateCustomerFormSchemaType } from "@/lib/zod/UpdateCustomerValidation";
import { toast } from "sonner";
import { Customer } from "@/utils/@types/customer";
import { useEffect, useState } from "react";
import { fetchWithToken } from "@/utils/fetchWithToken";
import { Address } from "@/utils/@types/address";
import { ListCustomerAddressesCard } from "./ListAddressCard";

interface UpdateCustomerFormProps {
  selectedCustomer: Customer | null;
}

export function UpdateCustomerForm({
    selectedCustomer,
}: UpdateCustomerFormProps) {

    const { handleSubmit, formState: { errors }, register, setValue, control } = useFormContext<UpdateCustomerFormSchemaType>();
    const [ customerAddresses, setCustomerAddresses ] = useState<Address[] | null>(null);

    useEffect(() => {
        async function getCustomerAddresses(customerId: string) {
            const response = await fetchWithToken(`${process.env.NEXT_PUBLIC_SERVER_URL}/customer/addresses?customerId=${customerId}`, {
                credentials: "include",
            });
            const { data }: {data: Address[]} = await response.json();
            setCustomerAddresses(data);
        }
        if(selectedCustomer && selectedCustomer.customerId) {
            getCustomerAddresses(selectedCustomer.customerId);
        }
    }, [ selectedCustomer ]);

    function handleUpdateCustomer(
        updatedCustomerData: UpdateCustomerFormSchemaType
    ) {
    // TODO: selecionar as informações antes de enviar pra
        console.log("updatedCustomerData: ", updatedCustomerData);
        toast.success("Cliente editado com sucesso!");
    }

    if(!selectedCustomer) return;

    return (
        <>
            {/* <CustomerGeneralInformationForm /> */}
            <Card>
                <CardHeader>
                    <CardTitle>Dados Pessoais</CardTitle>
                    <CardDescription>Preencha os dados pessoais do cliente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="border p-4 rounded-md md:h-[420px] h-[400px]">
                        <h3 className="text-lg font-medium mb-4">Informações do Cliente</h3>

                        <div className="space-y-4">
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
                                <Label htmlFor="empresa">Empresa</Label>
                                <Input
                                    className="placeholder:text-placeholder"
                                    { ...register("companyName") }
                                    id="empresa"
                                    placeholder="Nome da empresa"
                                    onBlur={ (e) => {
                                        if(e.target.value === "") {
                                            setValue("companyName", null);
                                        }
                                    } }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="documentNumber">CPF/CNPJ</Label>
                                <DocumentInput disabled={ true } register={ register("documentNumber") } />
                                <div className="h-3">
                                    {errors.documentNumber && (
                                        <p className="text-xs font-medium text-destructive">
                                            {errors.documentNumber.message}
                                        </p>
                                    )}
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
                                        onBlur={ (e) => {
                                            if(e.target.value === "") {
                                                setValue("email", null);
                                            }
                                        } }
                                    />
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
                                    <Input
                                        { ...register("instagram") }
                                        id="instagram"
                                        className="pl-8 placeholder:text-placeholder"
                                        placeholder="usuario"
                                        onBlur={ (e) => {
                                            if(e.target.value === "") {
                                                setValue("instagram", null);
                                            }
                                        } }
                                    />
                                </div>
                                {errors.instagram && <p className="text-xs font-medium text-destructive">{errors.instagram.message}</p>}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <ListCustomerAddressesCard customerId={ selectedCustomer.customerId } customerAddresses={ customerAddresses } />
        </>
    );
}
