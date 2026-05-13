"use client";

import { useAuth } from "@/contexts/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Loader2, Save, User, Phone, Lock, Mail } from "lucide-react";
import { fetchWithToken } from "@/utils/fetchWithToken";
import { z } from "zod";
import PhoneInput from "@/components/shared/PhoneInput";
import { Employee } from "@/utils/@types/employee";

const profileSchema = z.object({
  fullname: z.string().optional(),
  username: z.string().min(3, "Username deve ter no mínimo 3 caracteres"),
  cellphone: z.string().min(1, "Telefone é obrigatório"),
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  password: z.string().optional(),
  role: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function EditProfileForm() {
  const { user } = useAuth();
  const [ isLoading, setIsLoading ] = useState(true);
  const [ employeeData, setEmployeeData ] = useState<Employee | null>(null);
  const [ confirmPassword, setConfirmPassword ] = useState("");

  const methods = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    watch,
    formState: { errors, isDirty },
  } = methods;

  const password = watch("password");

  useEffect(() => {
    if (password !== confirmPassword && confirmPassword.length > 0) {
      setError("password", { message: "Senhas não batem." });
    } else {
      clearErrors("password");
    }
  }, [ setError, clearErrors, password, confirmPassword ]);

  useEffect(() => {
    async function fetchProfile() {
      const userId = user?.employeeId || user?.sub;
      if (!userId) return;
      try {
        const response = await fetchWithToken(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/me`,
          {
            credentials: "include",
          },
        );
        const { user: currentEmployee } = await response.json();

        if (currentEmployee) {
          setEmployeeData(currentEmployee);
          reset({
            fullname: currentEmployee.fullname,
            username: currentEmployee.username,
            cellphone: currentEmployee.cellphone,
            email: currentEmployee.email,
          });
        }
      } catch (error) {
        toast.error("Erro ao carregar perfil.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [ user?.employeeId, user?.sub, reset ]);

  async function onSubmit(data: ProfileFormValues) {
    const userId = user?.employeeId || user?.sub;
    if (!userId) return;

    if (data.password && data.password !== confirmPassword) {
      setError("password", { message: "Senhas não conferem" });
      return;
    }

    try {
      const payload = {
        ...data,
        role: employeeData?.role,
        sourceFilialId: employeeData?.SourceFilial?.filialId,
        password: data.password || undefined,
      };

      const response = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/employees/update/${userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          setError("username", { message: "Username já existe." });
          toast.error("Username já existe.");
        } else {
          toast.error(errorData.message || "Erro ao atualizar perfil");
        }
      } else {
        toast.success("Perfil atualizado com sucesso!");
        setConfirmPassword("");
      }
    } catch (error) {
      toast.error("Erro ao conectar com o servidor");
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <FormProvider { ...methods }>
      <form onSubmit={ handleSubmit(onSubmit) } className="space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                disabled
                value={ employeeData?.fullname || "" }
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="documentNumber">CPF</Label>
              <Input
                disabled
                value={ employeeData?.documentNumber || "" }
                className="placeholder:text-placeholder"
                placeholder="Insira um CPF"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                { ...register("username") }
                id="username"
                className="placeholder:text-placeholder"
                placeholder="Insira um username"
              />
              {errors.username && (
                <p className="text-sm text-destructive">
                  {errors.username.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" /> Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cellphone">Telefone</Label>
              <PhoneInput control={ control } name="cellphone" />
              {errors.cellphone && (
                <p className="text-sm text-destructive">
                  {errors.cellphone.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> Email
              </Label>
              <Input
                { ...register("email") }
                id="email"
                type="email"
                className="placeholder:text-placeholder"
                placeholder="Insira um email"
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" /> Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <Input
                { ...register("password") }
                id="password"
                type="password"
                placeholder="Preencha apenas se quiser alterar"
                className="placeholder:text-placeholder"
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirme a Senha</Label>
              <Input
                value={ confirmPassword }
                onChange={ (e) => setConfirmPassword(e.target.value) }
                id="confirmPassword"
                type="password"
                placeholder="Confirme a nova senha"
                className="placeholder:text-placeholder"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={ !isDirty && !confirmPassword }>
            <Save className="mr-2 h-4 w-4" />
            Salvar Alterações
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
