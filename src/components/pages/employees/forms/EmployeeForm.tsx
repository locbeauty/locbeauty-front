import DocumentInput from "../../../shared/DocumentInput";
import { SelectRole } from "@/components/shared/SelectRole";
import PhoneInput from "../../../shared/PhoneInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Controller, useFormContext } from "react-hook-form";
import { CreateEmployeeFormSchemaType } from "@/lib/zod/CreateEmployeeValidation";
import { useEffect, useState, useMemo } from "react";
import { DatePicker } from "@/components/ui/DatePicker";
import { SelectFilial } from "@/components/shared/SelectFilial";
import { useAuth } from "@/contexts/auth-provider";
import { useAccess } from "@/contexts/access-provider";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { USER_ROLES } from "@/utils/constants";
import {
  User,
  FileText,
  Calendar as CalendarIcon,
  Briefcase,
  Building,
  Phone,
  Mail,
  Lock,
} from "lucide-react";

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

  const { user } = useAuth();
  const { accesses } = useAccess();

  const accessibleFilials = useMemo(() => {
    if (user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MASTER) {
      return undefined;
    }
    return accesses
      .filter((a) => a.module === SYSTEM_MODULES.EMPLOYEES && a.canView)
      .map((a) => a.filialId);
  }, [ user, accesses ]);

  return (
    <div className="space-y-6">
      {/* Personal Information Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <User className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-medium">Dados Pessoais</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullname" className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Nome Completo
            </Label>
            <Input
              { ...register("fullname") }
              id="fullname"
              placeholder="Ex: Maria Silva"
              className="placeholder:text-placeholder"
            />
            {errors.fullname && (
              <p className="text-xs font-medium text-destructive">
                {errors.fullname.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentNumber" className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              CPF
            </Label>
            <DocumentInput
              isCPF={ true }
              placeholder="000.000.000-00"
              register={ register("documentNumber") }
            />
            {errors.documentNumber && (
              <p className="text-xs font-medium text-destructive">
                {errors.documentNumber.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="birthdate" className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
              Data de Nascimento
            </Label>
            <Controller
              control={ control }
              name="birthdate"
              render={ () => (
                <DatePicker
                  id="birthdate"
                  placeholder="Selecione a data"
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
            {errors.birthdate && (
              <p className="text-xs font-medium text-destructive">
                {errors.birthdate.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              Cargo
            </Label>
            <SelectRole control={ control } name="role" />
            {errors.role && (
              <p className="text-xs font-medium text-destructive">
                {errors.role.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sourceFilialId" className="flex items-center gap-2">
            <Building className="w-4 h-4 text-muted-foreground" />
            Filial de Origem
          </Label>
          <SelectFilial
            control={ control }
            name="sourceFilialId"
            accessibleFilials={ accessibleFilials }
            placeholder="Selecione a filial principal"
          />
          {errors.sourceFilialId && (
            <p className="text-xs font-medium text-destructive">
              {errors.sourceFilialId.message}
            </p>
          )}
        </div>
      </div>

      {/* Contact Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b mt-6">
          <Phone className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-medium">Contato</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cellphone" className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              Telefone
            </Label>
            <PhoneInput register={ register("cellphone") } />
            {errors.cellphone && (
              <p className="text-xs font-medium text-destructive">
                {errors.cellphone.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              Email
            </Label>
            <Input
              { ...register("email") }
              id="email"
              type="email"
              placeholder="exemplo@email.com"
              className="placeholder:text-placeholder"
            />
            {errors.email && (
              <p className="text-xs font-medium text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b mt-6">
          <Lock className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-medium">Segurança</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              Senha
            </Label>
            <Input
              { ...register("password") }
              id="password"
              type="password"
              placeholder="Senha de acesso"
              className="placeholder:text-placeholder"
            />
            {/* Note: Password error display depends on if it's required during edit.
                Commonly only show if error exists. */}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="flex items-center gap-2"
            >
              <Lock className="w-4 h-4 text-muted-foreground" />
              Confirmar Senha
            </Label>
            <Input
              onChange={ (e) => setConfirmPassword(e.target.value) }
              id="confirmPassword"
              type="password"
              placeholder="Repita a senha"
              className="placeholder:text-placeholder"
            />
            {errors.password && (
              <p className="text-xs font-medium text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
