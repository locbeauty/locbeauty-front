"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createCityDistance } from "@/services/city-distances.service";
import { useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Plus,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Truck,
  Info,
} from "lucide-react";
import { SelectFilial } from "@/components/shared/SelectFilial";
import { useAuth } from "@/contexts/auth-provider";
import { USER_ROLES } from "@/utils/constants";
import { fetchWithToken } from "@/utils/fetchWithToken";
import { Filial } from "@/utils/@types/filials";

// ─── Zod schema ──────────────────────────────────────────────────────────────

const formSchema = z.object({
  cep: z
    .string()
    .min(8, "CEP inválido")
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length === 8, "CEP deve ter 8 dígitos"),
  filialId: z.string().min(1, "Filial é obrigatória"),
  street: z.string().min(1, "Rua é obrigatória"),
  buildingNumber: z.string().min(1, "Número é obrigatório"),
  addressComplement: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// ─── Distance + freight helpers ───────────────────────────────────────────────

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const FUEL_PRICE_CENTS = 650;
const CONSUMPTION_KM_L = 10;

function estimateFreightCents(distanceKm: number): number {
  const liters = (distanceKm / CONSUMPTION_KM_L) * 2;
  return Math.round(liters * FUEL_PRICE_CENTS);
}

function formatBRL(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function formatCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return digits;
}

// ─── Geo lookup helpers ───────────────────────────────────────────────────────

type GeoPoint = { lat: number; lng: number; city: string; state: string };

async function geocodeCity(city: string, state: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const q = encodeURIComponent(`${city}, ${state}, Brasil`);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
      { headers: { "Accept-Language": "pt-BR", "User-Agent": "LocBeauty/1.0" } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data[0]?.lat) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

async function lookupCepGeo(cep: string): Promise<GeoPoint | null> {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return null;
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${digits}`);
    if (res.ok) {
      const data = await res.json();
      const city = data.city as string;
      const state = data.state as string;
      const lat = parseFloat(data.location?.coordinates?.latitude);
      const lng = parseFloat(data.location?.coordinates?.longitude);
      if (lat && lng) return { lat, lng, city, state };
      // BrasilAPI has city/state but no coords — fall back to Nominatim
      if (city && state) {
        const geo = await geocodeCity(city, state);
        if (geo) return { ...geo, city, state };
      }
    }
  } catch { /* ignore */ }
  return null;
}

// ─── ViaCEP fallback ─────────────────────────────────────────────────────────

async function lookupViaCep(
  cep: string,
): Promise<{ city: string; state: string; street?: string } | null> {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.erro) return null;
    return {
      city: data.localidade as string,
      state: data.uf as string,
      street: (data.logradouro as string) || undefined,
    };
  } catch {
    return null;
  }
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface CreateCityDistanceDialogProps {
  preSelectedFilialId?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CreateCityDistanceDialog({
  preSelectedFilialId,
}: CreateCityDistanceDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const defaultFilialId =
    preSelectedFilialId ||
    (user?.role === USER_ROLES.MASTER ? "" : user?.sourceFilialId || "");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cep: "",
      filialId: defaultFilialId,
      street: "",
      buildingNumber: "",
      addressComplement: "",
    },
  });

  const { isSubmitting } = form.formState;

  // ─── Filials list (needed to read each filial's zipCode) ─────────────────────

  const [filials, setFilials] = useState<Filial[]>([]);

  useEffect(() => {
    if (!open) return;
    fetchWithToken(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/filials`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then(({ data }) => setFilials(data || []))
      .catch(() => {});
  }, [open]);

  // ─── CEP lookup state (customer destination) ─────────────────────────────────

  const [cepRaw, setCepRaw] = useState("");
  const [cepLookup, setCepLookup] = useState<{
    status: "idle" | "loading" | "success" | "error";
    city?: string;
    state?: string;
    geo?: { lat: number; lng: number };
    message?: string;
  }>({ status: "idle" });

  // ─── Filial geo state ─────────────────────────────────────────────────────────

  const [filialGeo, setFilialGeo] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [filialNoZip, setFilialNoZip] = useState(false);
  const [filialGeoLoading, setFilialGeoLoading] = useState(false);

  const selectedFilialId = form.watch("filialId");

  useEffect(() => {
    if (!selectedFilialId || selectedFilialId === "ALL") {
      setFilialGeo(null);
      setFilialNoZip(false);
      return;
    }
    const filial = filials.find((f) => f.filialId === selectedFilialId);
    if (!filial) return;
    if (!filial.zipCode) {
      setFilialGeo(null);
      setFilialNoZip(true);
      return;
    }
    setFilialNoZip(false);
    setFilialGeoLoading(true);
    lookupCepGeo(filial.zipCode).then((geo) => {
      setFilialGeo(geo ? { lat: geo.lat, lng: geo.lng } : null);
      setFilialGeoLoading(false);
    });
  }, [selectedFilialId, filials]);

  // ─── CEP change handler ───────────────────────────────────────────────────────

  async function handleCepChange(raw: string) {
    const formatted = formatCep(raw);
    setCepRaw(formatted);
    form.setValue("cep", formatted, { shouldValidate: false });

    const digits = formatted.replace(/\D/g, "");
    if (digits.length < 8) {
      setCepLookup({ status: "idle" });
      return;
    }

    setCepLookup({ status: "loading" });

    const geo = await lookupCepGeo(digits);
    if (geo) {
      setCepLookup({
        status: "success",
        city: geo.city,
        state: geo.state,
        geo: { lat: geo.lat, lng: geo.lng },
      });
      // BrasilAPI also returns street in some cases; fall through to ViaCEP for street
    }

    // Always call ViaCEP to get the street name for auto-fill
    const viaCep = await lookupViaCep(digits);
    if (viaCep) {
      if (!geo) {
        setCepLookup({ status: "success", city: viaCep.city, state: viaCep.state });
      }
      if (viaCep.street) {
        form.setValue("street", viaCep.street, { shouldValidate: false });
      }
    } else if (!geo) {
      setCepLookup({ status: "error", message: "CEP não encontrado" });
    }
  }

  // ─── Reset when dialog closes ─────────────────────────────────────────────────

  useEffect(() => {
    if (!open) {
      form.reset({
        cep: "",
        filialId: defaultFilialId,
        street: "",
        buildingNumber: "",
        addressComplement: "",
      });
      setCepRaw("");
      setCepLookup({ status: "idle" });
      setFilialGeo(null);
      setFilialNoZip(false);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Derived: auto-calculated distance ────────────────────────────────────────

  const autoDistance =
    filialGeo && cepLookup.status === "success" && cepLookup.geo
      ? Math.round(
          haversineKm(
            filialGeo.lat,
            filialGeo.lng,
            cepLookup.geo.lat,
            cepLookup.geo.lng,
          ),
        )
      : null;

  const freightCents =
    autoDistance != null ? estimateFreightCents(autoDistance) : null;

  // ─── Submit ───────────────────────────────────────────────────────────────────

  async function onSubmit(values: FormValues) {
    if (cepLookup.status !== "success" || !cepLookup.city || !cepLookup.state) {
      toast.error("Consulte um CEP válido antes de salvar.");
      return;
    }
    if (autoDistance == null) {
      toast.error(
        "Não foi possível calcular a distância. Verifique o CEP da filial.",
      );
      return;
    }

    try {
      await createCityDistance({
        cityName: cepLookup.city,
        state: cepLookup.state,
        distance: autoDistance,
        filialId: values.filialId,
        street: values.street,
        buildingNumber: values.buildingNumber,
        addressComplement: values.addressComplement || null,
      });
      toast.success("Distância cadastrada com sucesso!");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["city-distances"] });
    } catch {
      toast.error("Erro ao cadastrar distância. Verifique se já existe.");
    }
  }

  const canSubmit =
    !isSubmitting &&
    cepLookup.status === "success" &&
    autoDistance != null;

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Nova Distância
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastro de Distância</DialogTitle>
          <DialogDescription>
            Informe a filial de origem e o CEP de destino. A distância será
            calculada automaticamente.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            {/* Filial de Origem */}
            <FormField
              control={form.control}
              name="filialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Filial de Origem</FormLabel>
                  <SelectFilial
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultFilial={field.value}
                  />
                  {filialNoZip && (
                    <div className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
                      <Info className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>
                        Esta filial não possui CEP cadastrado. Adicione o
                        endereço na tela de filiais para calcular distâncias
                        automaticamente.
                      </span>
                    </div>
                  )}
                  {filialGeoLoading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Obtendo localização da filial...</span>
                    </div>
                  )}
                  <div className="min-h-[20px]">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* CEP de Destino */}
            <FormField
              control={form.control}
              name="cep"
              render={({ field: _field }) => (
                <FormItem>
                  <FormLabel>CEP de Destino</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-9 placeholder:text-placeholder"
                        placeholder="00000-000"
                        value={cepRaw}
                        onChange={(e) => handleCepChange(e.target.value)}
                        maxLength={9}
                      />
                      {cepLookup.status === "loading" && (
                        <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </FormControl>

                  {cepLookup.status === "success" && (
                    <div className="flex items-center gap-2 rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-800">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>
                        <span className="font-medium">{cepLookup.city}</span>
                        {" — "}
                        <span>{cepLookup.state}</span>
                      </span>
                    </div>
                  )}
                  {cepLookup.status === "error" && (
                    <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{cepLookup.message}</span>
                    </div>
                  )}
                  {cepLookup.status === "success" && !cepLookup.geo && (
                    <div className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
                      <Info className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>
                        CEP encontrado, mas coordenadas indisponíveis. A
                        distância não pôde ser calculada automaticamente.
                      </span>
                    </div>
                  )}

                  <div className="min-h-[20px]">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Endereço de Destino */}
            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Rua <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Av. Paulista"
                        className="placeholder:text-placeholder"
                      />
                    </FormControl>
                    <div className="min-h-[20px]">
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="buildingNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="123"
                        className="placeholder:text-placeholder"
                      />
                    </FormControl>
                    <div className="min-h-[20px]">
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="addressComplement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Complemento</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Sala 301, Apto 12..."
                      className="placeholder:text-placeholder"
                    />
                  </FormControl>
                  <div className="min-h-[20px]">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Distância calculada + Frete Estimado */}
            {autoDistance != null && freightCents != null && (
              <div className="rounded-md border bg-muted/40 px-4 py-3 space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Truck className="h-4 w-4 text-primary" />
                  Distância e Frete Estimados
                </div>
                <div className="grid grid-cols-2 gap-x-4 text-sm text-muted-foreground">
                  <span>Distância calculada</span>
                  <span className="text-right font-medium text-foreground">
                    {autoDistance} km
                  </span>
                  <span>Percurso ida e volta</span>
                  <span className="text-right font-medium text-foreground">
                    {autoDistance * 2} km
                  </span>
                  <span>Estimativa de frete</span>
                  <span className="text-right text-lg font-bold text-primary">
                    {formatBRL(freightCents)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground pt-1">
                  Base: R$&nbsp;6,50/L · 10&nbsp;km/L · ida e volta
                </p>
              </div>
            )}

            <DialogFooter>
              <Button type="submit" disabled={!canSubmit}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Salvar Distância
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
