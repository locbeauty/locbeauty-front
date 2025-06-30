import { SelectRegional } from "@/components/shared/SelectRegional";
import DocumentInput from "../../../shared/DocumentInput";
import { SelectRole } from "@/components/shared/SelectRole";
import PhoneInput from "../../../shared/PhoneInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormContext } from "react-hook-form";
import { CreateEmployeeFormSchemaType } from "@/lib/zod/CreateEmployeeValidation";

export function EmployeeForm() {
    const { register, control, formState: { errors } } = useFormContext<CreateEmployeeFormSchemaType>();
    return (
        <>
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="nome">Nome</Label>
                    <Input
                        { ...register("fullname") }
                        id="nome"
                        placeholder="Nome completo"
                        className="placeholder:text-placeholder"
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
                    <DocumentInput register={ register("documentNumber") } />
                    <div className="h-3">
                        {errors.documentNumber && (
                            <p className="text-xs font-medium text-destructive">
                                {errors.documentNumber.message}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="nome">Cargo:</Label>
                    <SelectRole control={ control } name="role" />
                    <div className="h-3">
                        {errors.role && (
                            <p className="text-xs font-medium text-destructive">
                                {errors.role.message}
                            </p>
                        )}
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="nome">Regional:</Label>
                    <SelectRegional control={ control } name="sourceRegionalId" />
                    <div className="h-3">
                        {errors.sourceRegionalId && (
                            <p className="text-xs font-medium text-destructive">
                                {errors.sourceRegionalId.message}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        { ...register("email") }
                        id="email"
                        type="email"
                        placeholder="exemple@exemple.com"
                        className="placeholder:text-placeholder"
                    />
                    <div className="h-3">
                        {errors.email && (
                            <p className="text-xs font-medium text-destructive">
                                {errors.email.message}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}