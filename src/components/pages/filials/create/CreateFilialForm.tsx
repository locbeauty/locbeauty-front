"use client";

import { useState } from "react";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectEmployee } from "../../../shared/SelectEmployee";
import {
  createFilialFormSchema,
  CreateFilialFormSchemaType,
} from "@/lib/zod/CreateFilialValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import PhoneInput from "../../../shared/PhoneInput";
import { toast } from "sonner";
import { fetchWithToken } from "@/utils/fetchWithToken";
import { useAuth } from "@/contexts/auth-provider";
import { Loader2, MapPin, CheckCircle2, AlertCircle } from "lucide-react";

// ─── CEP helpers ──────────────────────────────────────────────────────────────

function formatCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return digits;
}

type CepStatus = "idle" | "loading" | "success" | "error";

async function lookupCep(digits: string) {
  const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
  if (!res.ok) return null;
  const data = await res.json();
  if (data.erro) return null;
  return {
    street: data.logradouro as string,
    neighborhood: data.bairro as string,
    city: data.localidade as string,
    state: data.uf as string,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CreateFilialForm() {
  const { user } = useAuth();
  const [cepRaw, setCepRaw] = useState("");
  const [cepStatus, setCepStatus] = useState<CepStatus>("idle");
  const [cepError, setCepError] = useState("");

  const createFilialMethods = useForm<CreateFilialFormSchemaType>({
    resolver: zodResolver(createFilialFormSchema),
    defaultValues: {
      filialName: "",
      cellphone: "",
      zipCode: "",
      street: "",
      buildingNumber: "",
      addressComplement: "",
      neighborhood: "",
      city: "",
      state: "",
    },
  });

  const {
    handleSubmit,
    control,
    register,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = createFilialMethods;

  // ─── CEP handler ────────────────────────────────────────────────────────────

  async function handleCepChange(raw: string) {
    const formatted = formatCep(raw);
    setCepRaw(formatted);
    setValue("zipCode", formatted.replace(/\D/g, ""), { shouldValidate: false });

    const digits = formatted.replace(/\D/g, "");
    if (digits.length < 8) {
      setCepStatus("idle");
      setCepError("");
      return;
    }

    setCepStatus("loading");
    const result = await lookupCep(digits);
    if (!result) {
      setCepStatus("error");
      setCepError("CEP não encontrado");
      return;
    }

    setCepStatus("success");
    setCepError("");
    if (result.street) setValue("street", result.street);
    if (result.neighborhood) setValue("neighborhood", result.neighborhood);
    setValue("city", result.city);
    setValue("state", result.state);
  }

  // ─── Submit ─────────────────────────────────────────────────────────────────

  async function handleCreateFilial(data: CreateFilialFormSchemaType) {
    try {
      const response = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/filials/create`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );
      const json = await response.json();

      if (!response.ok) {
        toast.warning(json.message, { style: { fontSize: "1rem" } });
      } else {
        toast.success("Filial criada com sucesso!", { style: { fontSize: "1rem" } });
        reset();
        setCepRaw("");
        setCepStatus("idle");
      }
    } catch {
      toast.error("Erro ao criar filial.");
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <form
      id="create-filial-form"
      onSubmit={handleSubmit(handleCreateFilial)}
      className="flex flex-col gap-5"
    >
      <FormProvider {...createFilialMethods}>
        <CardContent className="space-y-6">

          {/* Informações básicas */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nome da Filial <span className="text-destructive">*</span></Label>
              <Input
                {...register("filialName")}
                placeholder="Ex: LocRecife"
                className="placeholder:text-placeholder"
              />
              {errors.filialName && (
                <p className="text-sm font-medium text-destructive">{errors.filialName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Telefone <span className="text-destructive">*</span></Label>
              <PhoneInput control={control} name="cellphone" />
              {errors.cellphone && (
                <p className="text-sm font-medium text-destructive">{errors.cellphone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Gerente</Label>
              <SelectEmployee control={control} name="managerEmployeeId" currentUser={user} />
              {errors.managerEmployeeId && (
                <p className="text-sm font-medium text-destructive">{errors.managerEmployeeId.message}</p>
              )}
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b pb-1">
              Endereço da Filial
            </h3>

            {/* CEP */}
            <div className="space-y-2 max-w-[200px]">
              <Label>CEP <span className="text-destructive">*</span></Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9 placeholder:text-placeholder"
                  placeholder="00000-000"
                  value={cepRaw}
                  onChange={(e) => handleCepChange(e.target.value)}
                  maxLength={9}
                />
                {cepStatus === "loading" && (
                  <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {cepStatus === "success" && (
                  <CheckCircle2 className="absolute right-3 top-2.5 h-4 w-4 text-green-600" />
                )}
                {cepStatus === "error" && (
                  <AlertCircle className="absolute right-3 top-2.5 h-4 w-4 text-destructive" />
                )}
              </div>
              {cepStatus === "error" && (
                <p className="text-sm font-medium text-destructive">{cepError}</p>
              )}
              {errors.zipCode && (
                <p className="text-sm font-medium text-destructive">{errors.zipCode.message}</p>
              )}
            </div>

            {/* Rua + Número */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Rua <span className="text-destructive">*</span></Label>
                <Input
                  {...register("street")}
                  placeholder="Av. Paulista"
                  className="placeholder:text-placeholder"
                />
                {errors.street && (
                  <p className="text-sm font-medium text-destructive">{errors.street.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Número <span className="text-destructive">*</span></Label>
                <Input
                  {...register("buildingNumber")}
                  placeholder="123"
                  className="placeholder:text-placeholder"
                />
                {errors.buildingNumber && (
                  <p className="text-sm font-medium text-destructive">{errors.buildingNumber.message}</p>
                )}
              </div>
            </div>

            {/* Complemento + Bairro */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Complemento</Label>
                <Input
                  {...register("addressComplement")}
                  placeholder="Sala 301"
                  className="placeholder:text-placeholder"
                />
              </div>

              <div className="space-y-2">
                <Label>Bairro</Label>
                <Input
                  {...register("neighborhood")}
                  placeholder="Centro"
                  className="placeholder:text-placeholder"
                />
              </div>
            </div>

            {/* Cidade + Estado */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Cidade <span className="text-destructive">*</span></Label>
                <Input
                  {...register("city")}
                  placeholder="Recife"
                  className="placeholder:text-placeholder"
                />
                {errors.city && (
                  <p className="text-sm font-medium text-destructive">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Estado <span className="text-destructive">*</span></Label>
                <Input
                  {...register("state")}
                  placeholder="PE"
                  maxLength={2}
                  className="placeholder:text-placeholder uppercase"
                  onChange={(e) => setValue("state", e.target.value.toUpperCase())}
                />
                {errors.state && (
                  <p className="text-sm font-medium text-destructive">{errors.state.message}</p>
                )}
              </div>
            </div>
          </div>

        </CardContent>
      </FormProvider>
    </form>
  );
}
