import { SelectFilial } from "@/components/shared/SelectFilial";
import DocumentInput from "../../../shared/DocumentInput";
import { SelectRole } from "@/components/shared/SelectRole";
import PhoneInput from "../../../shared/PhoneInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Controller, useFormContext } from "react-hook-form";
import { CreateEmployeeFormSchemaType } from "@/lib/zod/CreateEmployeeValidation";
import { useEffect, useState } from "react";
import { DatePicker } from "@/components/ui/DatePicker";

export function EmployeeForm() {
    const {
        register,
        watch,
        control,
        setValue,
        setError,
        clearErrors,
        trigger,
        formState: { errors },
    } = useFormContext<CreateEmployeeFormSchemaType>();
    const [ confirmPassword, setConfirmPassword ] = useState("");

    const birthdate = watch("birthdate");
    const password = watch("password");

    useEffect(() => {
        if (password !== confirmPassword && confirmPassword.length > 0) {
            setError("password", { message: "Senhas não batem." });
        } else {
            clearErrors("password");
            setConfirmPassword("");
        }
    }, [ setError, clearErrors, password, confirmPassword ]);

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
                        type="name"
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
                    <DocumentInput
                        placeholder="000.000.000-00"
                        register={ register("documentNumber") }
                    />
                    <div className="h-3">
                        {errors.documentNumber && (
                            <p className="text-xs font-medium text-destructive">
                                {errors.documentNumber.message}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="birthdate">Data de nascimento</Label>
                <Controller
                    control={ control }
                    name="birthdate"
                    render={ () => (
                        <DatePicker
                            id="birthdate"
                            placeholder="Escolha a data de nascimento"
                            value={ birthdate }
                            onChange={ (date) => {
                                setValue("birthdate", date!);
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

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="nome">Cargo:</Label>
                    <SelectRole control={ control } name="roleId" />
                    <div className="h-3">
                        {errors.roleId && (
                            <p className="text-xs font-medium text-destructive">
                                {errors.roleId.message}
                            </p>
                        )}
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="nome">Filial:</Label>
                    <SelectFilial control={ control } name="sourceFilialId" />
                    <div className="h-3">
                        {errors.sourceFilialId && (
                            <p className="text-xs font-medium text-destructive">
                                {errors.sourceFilialId.message}
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
                <div className="flex gap-10">
                    <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input
                            { ...register("password") }
                            id="password"
                            type="password"
                            placeholder="Escolha a senha para login"
                            className="placeholder:text-placeholder"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Confirme a senha</Label>
                        <Input
                            onChange={ (e) => setConfirmPassword(e.target.value) }
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirme a senha para login"
                            className="placeholder:text-placeholder"
                        />
                        <div className="h-3">
                            {errors.password && (
                                <p className="text-xs font-medium text-destructive">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
