import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    createRegionalFormSchema,
    CreateRegionalFormSchemaType,
} from "@/lib/zod/CreateRegionalValidation";
import { CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import PhoneInput from "@/components/shared/PhoneInput";
import { Input } from "@/components/ui/input";
import { SelectEmployee } from "../create/SelectEmployee";
import { RegionalAddressForm } from "../create/RegionalAddressForm";
import DocumentInput from "@/components/shared/DocumentInput";
import { Textarea } from "@/components/ui/textarea";
import { Regional } from "@/utils/@types/regionals";

interface UpdateRegionalFormProps {
  selectedRegional: Regional;
}

export function UpdateRegionalForm({
    selectedRegional,
}: UpdateRegionalFormProps) {
    const updateRegionalMethods = useForm<CreateRegionalFormSchemaType>({
        resolver: zodResolver(createRegionalFormSchema),
        defaultValues: {
            address: {
                addressComplement: selectedRegional.address.addressComplement,
                zipCode: selectedRegional.address.zipCode,
                cityName: selectedRegional.address.city,
                buildingNumber: selectedRegional.address.buildingNumber,
                neighborhoodName: selectedRegional.address.neighborhood,
                stateName: selectedRegional.address.state.stateName,
                streetName: selectedRegional.address.street,
            },
            cellphone: selectedRegional.cellphone,
            CNPJ: selectedRegional.CNPJ,
            email: selectedRegional.email,
            managerEmployeeId: selectedRegional.managerEmployeeId,
            description: selectedRegional.description,
        },
    });

    const {
        handleSubmit,
        register,
        control,
        formState: { errors },
    } = updateRegionalMethods;

    function handleUpdateRegional(
        updatedRegionalData: CreateRegionalFormSchemaType
    ) {
        console.log("updatedRegionalData: ", updatedRegionalData);
        toast.success("Regional editado com sucesso!");
    }
    return (
        <form
            id="update-regional-form"
            onSubmit={ handleSubmit(handleUpdateRegional) }
            className="flex flex-col gap-5"
        >
            <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="telefone">CNPJ/CPF</Label>
                        <DocumentInput
                            disabled
                            documentType="CNPJ"
                            register={ register("CNPJ") }
                        />
                        {errors.cellphone && (
                            <p className="text-sm font-medium text-destructive">
                                {errors.cellphone.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="telefone">Telefone</Label>
                        <PhoneInput register={ register("cellphone") } />
                        {errors.cellphone && (
                            <p className="text-sm font-medium text-destructive">
                                {errors.cellphone.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            { ...register("email") }
                            id="email"
                            type="email"
                            placeholder="email@exemplo.com"
                            className="placeholder:text-placeholder"
                        />
                        {errors.email && (
                            <p className="text-sm font-medium text-destructive">
                                {errors.email.message}
                            </p>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Descrição</Label>
                    <Textarea
                        { ...register("description") }
                        placeholder="Informações adicionais sobre a filial"
                        className="placeholder:text-placeholder max-h-[200px]"
                    />
                    {errors.email && (
                        <p className="text-sm font-medium text-destructive">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="gerente">Gerente</Label>
                    <SelectEmployee
                        managerEmployeeId={ selectedRegional.managerEmployeeId }
                        control={ control }
                        name="managerEmployeeId"
                    />
                    {errors.managerEmployeeId && (
                        <p className="text-sm font-medium text-destructive">
                            {errors.managerEmployeeId.message}
                        </p>
                    )}
                </div>
                <FormProvider { ...updateRegionalMethods }>
                    <RegionalAddressForm />
                </FormProvider>
            </CardContent>
        </form>
    );
}
