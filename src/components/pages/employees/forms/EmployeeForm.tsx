import { SelectRole } from "@/components/shared/SelectRole";
import { SelectFilial } from "@/components/shared/SelectFilial";
import { MaskedDateInput } from "./MaskedDateInput";
import PhoneInput from "../../../shared/PhoneInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Controller, useFormContext } from "react-hook-form";
import { CreateEmployeeFormSchemaType } from "@/lib/zod/CreateEmployeeValidation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-provider";
import { User, Phone, Lock, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDebounceValue } from "usehooks-ts";
import { fetchWithToken } from "@/utils/fetchWithToken";

interface EmployeeFormProps {
  isEditing?: boolean;
  currentUsername?: string;
  accessibleFilialsIds?: string[];
  defaultFilialId?: string;
}

export function EmployeeForm({
  isEditing = false,
  currentUsername,
  accessibleFilialsIds,
  defaultFilialId,
}: EmployeeFormProps) {
  const {
    register,
    watch,
    control,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext<CreateEmployeeFormSchemaType>();

  const [ confirmPassword, setConfirmPassword ] = useState("");
  const password = watch("password");
  const username = watch("username");

  const [ debouncedUsername ] = useDebounceValue(username, 500);
  const [ isCheckingUsername, setIsCheckingUsername ] = useState(false);
  const [ isUsernameAvailable, setIsUsernameAvailable ] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    async function checkUsername() {
      if (!debouncedUsername || debouncedUsername.length < 3) {
        setIsUsernameAvailable(null);
        return;
      }

      if (currentUsername && debouncedUsername === currentUsername) {
        setIsUsernameAvailable(true);
        clearErrors("username");
        return;
      }

      setIsCheckingUsername(true);
      try {
        const response = await fetchWithToken(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/employees/check-availability?username=${debouncedUsername}`,
        );
        const data = await response.json();

        if (data.available) {
          setIsUsernameAvailable(true);
          clearErrors("username");
        } else {
          setIsUsernameAvailable(false);
          setError("username", { message: "Username já está em uso." });
        }
      } catch (error) {
        console.error("Error checking username availability:", error);
      } finally {
        setIsCheckingUsername(false);
      }
    }

    checkUsername();
  }, [ debouncedUsername, setError, clearErrors, currentUsername ]);

  useEffect(() => {
    if (password !== confirmPassword && confirmPassword.length > 0) {
      setError("password", { message: "Senhas não batem." });
    } else {
      clearErrors("password");
    }
  }, [ setError, clearErrors, password, confirmPassword ]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-6">
        {/* Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Filial *</Label>
              <Controller
                control={ control }
                name="sourceFilialId"
                render={ ({ field }) => (
                  <SelectFilial
                    control={ control }
                    name="sourceFilialId"
                    accessibleFilials={ accessibleFilialsIds }
                    defaultFilial={ defaultFilialId }
                  />
                ) }
              />
              {errors.sourceFilialId && (
                <p className="text-sm text-destructive">
                  {errors.sourceFilialId.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullname">Nome Completo</Label>
              <Input
                { ...register("fullname") }
                id="fullname"
                placeholder="Ex: Maria Silva"
                disabled={ isEditing }
              />
              {errors.fullname && (
                <p className="text-xs font-medium text-destructive">
                  {errors.fullname.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username (utilizado para login)</Label>
              <div className="relative">
                <Input
                  { ...register("username") }
                  id="username"
                  placeholder="Ex: mariasilva"
                />
                <div className="absolute right-3 top-2.5">
                  {isCheckingUsername ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : isUsernameAvailable === true ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : isUsernameAvailable === false ? (
                    <XCircle className="h-4 w-4 text-destructive" />
                  ) : null}
                </div>
              </div>
              {errors.username && (
                <p className="text-xs font-medium text-destructive">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthdate">Data de Nascimento</Label>
              <Controller
                control={ control }
                name="birthdate"
                render={ ({ field: { value, onChange } }) => (
                  <MaskedDateInput
                    id="birthdate"
                    value={ value }
                    onChange={ onChange }
                    error={ errors.birthdate?.message }
                    disabled={ isEditing }
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
              <Label htmlFor="role">Cargo</Label>
              <SelectRole control={ control } name="role" />
              {errors.role && (
                <p className="text-xs font-medium text-destructive">
                  {errors.role.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Contato */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" /> Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cellphone">Telefone</Label>
              <PhoneInput register={ register("cellphone") } />
              {errors.cellphone && (
                <p className="text-xs font-medium text-destructive">
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
                placeholder="exemplo@email.com"
              />
              {errors.email && (
                <p className="text-xs font-medium text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" /> Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                { ...register("password") }
                id="password"
                type="password"
                placeholder="Senha de acesso"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                onChange={ (e) => setConfirmPassword(e.target.value) }
                id="confirmPassword"
                type="password"
                placeholder="Repita a senha"
              />
              {errors.password && (
                <p className="text-xs font-medium text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
