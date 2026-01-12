"use client";

import { useAuth } from "@/contexts/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { fetchWithToken } from "@/utils/fetchWithToken";
import { z } from "zod";
import PhoneInput from "@/components/shared/PhoneInput";
import { EmployeeAddressForm } from "@/components/pages/employees/forms/EmployeeAddressForm";
import { Employee } from "@/utils/@types/employee";

const profileSchema = z.object({
  fullname: z.string().optional(), // Read-only
  documentNumber: z.string().optional(), // Read-only
  // Editable fields
  cellphone: z.string().min(1, "Telefone é obrigatório"),
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  password: z.string().optional(),
  role: z.string().optional(), // Read-only context
  // Address fields reused from EmployeeAddressForm schema
  address: z.object({
    zipCode: z.string().min(8, "CEP inválido"),
    stateName: z.string().min(1, "Estado é obrigatório"),
    cityName: z.string().min(1, "Cidade é obrigatória"),
    neighborhoodName: z.string().min(1, "Bairro é obrigatório"),
    streetName: z.string().min(1, "Rua é obrigatória"),
    buildingNumber: z.string().min(1, "Número é obrigatório"),
    addressComplement: z.string().optional(),
  }),
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
    handleSubmit,
    reset,
    setValue,
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
      if (!user?.sub) return;
      try {
        // Since there isn't a direct /me full profile (usually), we might need to fetch by ID if /me doesn't return everything.
        // Assuming /employees endpoint or similar needs to be used?
        // Wait, EmployeesTable uses GET /employees. Update uses /employees/update?employeeId=...
        // Ideally we should get the single employee.
        // Let's assume we can GET /employees?employeeId=... or filter from list?
        // Or maybe there is a specific endpoint.
        // Let's try to fetch all and find, or just use /me data if it was complete (it's not, it's a token payload usually).
        // Let's try to fetch specific employee by ID if possible, or just all.
        // The task description implies we should have this data.

        // Inspecting EmployeesTable logic: GET /employees returns all.
        // We'll use that for now to be safe, or check if there is a get by ID.
        const response = await fetchWithToken(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/employees`,
          {
            credentials: "include",
          }
        );
        const { data } = await response.json();
        const currentEmployee = data.find(
          (emp: Employee) => emp.employeeId === user.sub
        );

        if (currentEmployee) {
          setEmployeeData(currentEmployee);
          reset({
            fullname: currentEmployee.fullname,
            documentNumber: currentEmployee.documentNumber,
            cellphone: currentEmployee.cellphone,
            email: currentEmployee.email,
            address: {
              zipCode: currentEmployee.Address?.zipCode || "",
              stateName: currentEmployee.Address?.State?.stateName || "",
              cityName: currentEmployee.Address?.City?.cityName || "",
              neighborhoodName:
                currentEmployee.Address?.Neighborhood?.neighborhoodName || "",
              streetName: currentEmployee.Address?.Street?.streetName || "",
              buildingNumber: currentEmployee.Address?.buildingNumber || "",
              addressComplement:
                currentEmployee.Address?.addressComplement || "",
            },
          });
        }
      } catch (error) {
        toast.error("Erro ao carregar perfil.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [ user?.sub, reset ]);

  async function onSubmit(data: ProfileFormValues) {
    if (!user?.sub) return;

    if (data.password && data.password !== confirmPassword) {
      setError("password", { message: "Senhas não conferem" });
      return;
    }

    try {
      // Reusing the update logic from UpdateEmployeeDialog
      // "role" and "sourceFilialId" are required by the backend update DTO typically,
      // even if not changing. We should include them from original data.

      const payload = {
        ...data,
        // Ensure we send back required fields that might not be in the form but are needed by backend
        role: employeeData?.role,
        sourceFilialId: employeeData?.SourceFilial?.filialId,
        // If password is empty string, don't send it? Or backend handles it?
        // Usually empty string updates password to empty.
        // If the user didn't type a password, we probably shouldn't send it or send undefined.
        // However, our schema has it optional.
        password: data.password || undefined,
      };

      const response = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/employees/update?employeeId=${user.sub}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || "Erro ao atualizar perfil");
      } else {
        toast.success("Perfil atualizado com sucesso!");
        setConfirmPassword(""); // Clear password confirmation
        // Optionally reload or re-fetch
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
    <Card>
      <CardContent className="pt-6">
        <FormProvider { ...methods }>
          <form onSubmit={ handleSubmit(onSubmit) } className="space-y-6">
            {/* Read-only Personal Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  disabled
                  value={ employeeData?.fullname || "" }
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label>CPF</Label>
                <Input
                  disabled
                  value={ employeeData?.documentNumber || "" }
                  className="bg-muted"
                />
              </div>
            </div>

            {/* Editable Contact Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cellphone">Telefone</Label>
                <PhoneInput register={ register("cellphone") } />
                {errors.cellphone && (
                  <p className="text-sm text-destructive">
                    {errors.cellphone.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input { ...register("email") } id="email" type="email" />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Password Section */}
            <div className="grid gap-4 md:grid-cols-2 p-4 border rounded-lg bg-muted/10">
              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <Input
                  { ...register("password") }
                  id="password"
                  type="password"
                  placeholder="Preencha apenas se quiser alterar"
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
                />
              </div>
            </div>

            {/* Address Section (Reusable) */}
            <div className="pt-4 border-t">
              <h3 className="text-lg font-medium mb-4">Endereço</h3>
              <EmployeeAddressForm />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={ !isDirty && !confirmPassword }>
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </Button>
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
