"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  GetCheckoutById,
  UpdateCheckoutStatus,
  UpdateDriverLocation,
} from "@/services/checkouts.service";
import { findAllFilials } from "@/services/filials.service";
import { minutesToHHMM } from "@/utils/minutesToHHMM";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertTriangle, Loader2, MapPin, CheckCircle2, XCircle, ExternalLink, Navigation } from "lucide-react";
import { toast } from "sonner";
import { RouteDetailsMap } from "@/components/pages/routes/RouteDetailsMap";
import { ReportRouteDialog } from "@/components/pages/routes/ReportRouteDialog";
import { useAuth } from "@/contexts/auth-provider";
import { USER_ROLES, CheckoutStatuses } from "@/utils/constants";
import { BookingStatusBadge } from "@/components/pages/bookings/common/BookingStatusBadge";

const GOOGLE_MAPS_API_KEY = "AIzaSyA_g8REueNGH3OnPicdll0KvPHHgGp8Ses";
const MAX_DISTANCE_METERS = 1000;

function buildGoogleMapsUrl(origin: string | null, destination: string): string {
  const params = new URLSearchParams({ api: "1", destination, travelmode: "driving" });
  if (origin) params.set("origin", origin);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type GpsValidationStatus = "idle" | "checking" | "close" | "far" | "error";

export default function RouteDetailsPage() {
  const { routeId } = useParams<{ routeId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isMotorista = user?.role === USER_ROLES.MOTORISTA;

  const [ reportOpen, setReportOpen ] = useState(false);
  const [ confirmEntregaOpen, setConfirmEntregaOpen ] = useState(false);
  const [ confirmRecolhidoOpen, setConfirmRecolhidoOpen ] = useState(false);
  const [ gpsStatus, setGpsStatus ] = useState<GpsValidationStatus>("idle");
  const [ gpsDistanceM, setGpsDistanceM ] = useState<number | null>(null);

  const {
    data: checkoutData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [ "checkout", routeId ],
    queryFn: () => GetCheckoutById(routeId),
    enabled: !!routeId,
    retry: 1,
    // Poll every 30s for admin tracking; driver doesn't need polling (it pushes)
    refetchInterval: !isMotorista ? 30000 : false,
  });

  const checkout = checkoutData?.data;

  const { data: filialsData, isLoading: isLoadingFilials } = useQuery({
    queryKey: [ "filials-all" ],
    queryFn: () => findAllFilials(),
    enabled: !!checkout?.SourceFilial?.filialId,
  });

  const filial = filialsData?.find((f) => f.filialId === checkout?.SourceFilial?.filialId);

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: (status: CheckoutStatuses) =>
      UpdateCheckoutStatus({
        checkoutId: routeId,
        checkoutStatus: status,
        date: checkout ? new Date(checkout.date).toISOString() : new Date().toISOString(),
      }),
    onSuccess: (_, status) => {
      const messages: Partial<Record<CheckoutStatuses, string>> = {
        Entregue: "Equipamento entregue ao cliente!",
        Concluido: "Equipamento recolhido! Agendamento concluído.",
      };
      toast.success(messages[status] ?? "Status atualizado!");
      queryClient.invalidateQueries({ queryKey: [ "get-routes" ] });
      queryClient.invalidateQueries({ queryKey: [ "checkout", routeId ] });
    },
    onError: () => toast.error("Erro ao atualizar status. Tente novamente."),
  });

  // Driver GPS broadcast: send location every 30s when route is active
  useEffect(() => {
    if (!isMotorista) return;
    const activeStatuses: CheckoutStatuses[] = [ "Em_Andamento", "Entregue" ];
    if (!checkout || !activeStatuses.includes(checkout.checkoutStatus)) return;
    if (!navigator.geolocation) return;

    function sendLocation() {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          UpdateDriverLocation({
            checkoutId: routeId,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        undefined,
        { enableHighAccuracy: true, timeout: 10000 },
      );
    }

    sendLocation(); // immediate on mount
    const interval = setInterval(sendLocation, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ isMotorista, checkout?.checkoutStatus, routeId ]);

  const isPageLoading = isLoading || isLoadingFilials;

  const status = checkout?.checkoutStatus;
  const isEmAndamento = status === "Em_Andamento";
  const isEntregue = status === "Entregue";
  const isConcluido = status === "Concluido";
  const isCancelado = status === "Cancelado";
  const isActive = isEmAndamento || isEntregue;

  const returnInMinutes = checkout
    ? checkout.startHourInMinutes + checkout.totalDurationInMinutes
    : 0;
  const isSameDayReturn = returnInMinutes < 1440;
  const returnTimeLabel = minutesToHHMM(returnInMinutes % 1440);

  const pickupAddress = filial?.street
    ? [ `${filial.street}, ${filial.buildingNumber}`, filial.neighborhood, `${filial.city} - ${filial.state}`, filial.zipCode, "Brasil" ]
        .filter(Boolean).join(", ")
    : null;

  const destinationAddress = checkout?.Address?.street
    ? [ `${checkout.Address.street}, ${checkout.Address.buildingNumber}`, checkout.Address.neighborhood, `${checkout.Address.city} - ${checkout.Address.state}`, checkout.Address.zipCode, "Brasil" ]
        .filter(Boolean).join(", ")
    : null;

  const originLabel = filial?.street
    ? [ filial.street, filial.buildingNumber, filial.zipCode ].filter(Boolean).join(", ")
    : null;

  const destinationLabel = checkout?.Address?.street
    ? [ checkout.Address.street, checkout.Address.buildingNumber, checkout.Address.zipCode ].filter(Boolean).join(", ")
    : null;

  const driverLocation =
    checkout?.driverLat != null && checkout?.driverLng != null
      ? { lat: checkout.driverLat, lng: checkout.driverLng }
      : null;

  // Admin: show how stale the location is
  const locationAge = checkout?.driverLocationAt
    ? Math.floor((Date.now() - new Date(checkout.driverLocationAt).getTime()) / 60000)
    : null;

  async function validateGpsLocation() {
    setGpsStatus("checking");
    setGpsDistanceM(null);

    if (!navigator.geolocation || !destinationAddress) {
      setGpsStatus("error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude: driverLat, longitude: driverLng } = position.coords;
          const geoRes = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destinationAddress)}&key=${GOOGLE_MAPS_API_KEY}`,
          );
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const geoData: any = await geoRes.json();

          if (geoData.status !== "OK" || !geoData.results?.[0]) {
            setGpsStatus("error");
            return;
          }

          const { lat, lng } = geoData.results[0].geometry.location;
          const distMeters = haversineDistance(driverLat, driverLng, lat, lng);
          setGpsDistanceM(Math.round(distMeters));
          setGpsStatus(distMeters <= MAX_DISTANCE_METERS ? "close" : "far");
        } catch {
          setGpsStatus("error");
        }
      },
      () => setGpsStatus("error"),
      { timeout: 12000, enableHighAccuracy: true },
    );
  }

  function openRecolhidoDialog() {
    setGpsStatus("idle");
    setGpsDistanceM(null);
    setConfirmRecolhidoOpen(true);
  }

  if (isPageLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || (!isLoading && !checkout)) {
    return (
      <div className="space-y-6 pb-10">
        <h1 className="text-2xl font-bold tracking-tight">Detalhes da Rota</h1>
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-muted-foreground">
          <AlertTriangle className="h-10 w-10 text-amber-500" />
          <p className="text-base font-medium">
            {isError ? "Erro ao carregar os dados da rota." : "Rota não encontrada."}
          </p>
          <Button variant="outline" onClick={ () => router.back() }>Voltar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Título */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Detalhes da Rota</h1>
          {checkout && (
            <p className="text-sm text-muted-foreground">
              {new Date(checkout.date).toLocaleDateString("pt-BR")} · {minutesToHHMM(checkout.startHourInMinutes)}
              {checkout.driver && ` · ${checkout.driver.fullname}`}
            </p>
          )}
        </div>
        {checkout && <BookingStatusBadge status={ checkout.checkoutStatus } />}
      </div>

      {/* Corpo principal: mapa + informações */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Mapa */}
        <div className="w-full md:w-[55%] space-y-2">
          {/* Live tracking badge for admin */}
          {!isMotorista && isActive && driverLocation && (
            <div className="flex items-center gap-2 text-xs bg-primary/5 border border-primary/20 rounded-md px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="font-medium text-primary">Rastreamento ao vivo</span>
              {locationAge !== null && (
                <span className="text-muted-foreground ml-auto">
                  {locationAge === 0 ? "agora mesmo" : `há ${locationAge} min`}
                </span>
              )}
            </div>
          )}

          <div className="border rounded-lg overflow-hidden min-h-[240px] md:min-h-[360px]">
            <RouteDetailsMap
              origin={ pickupAddress }
              destination={ destinationAddress }
              driverLocation={ !isMotorista ? driverLocation : null }
            />
          </div>

          {destinationAddress && (
            <a
              href={ buildGoogleMapsUrl(pickupAddress, destinationAddress) }
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Abrir no Google Maps
            </a>
          )}
        </div>

        {/* Informações gerais */}
        <div className="md:flex-1 flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Informações Gerais
          </h2>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground mb-0.5">Local de Origem</p>
              <p className="font-medium">{checkout?.SourceFilial?.filialName ?? "—"}</p>
              {originLabel && <p className="text-muted-foreground">{originLabel}</p>}
            </div>

            <div className="border-t pt-3">
              <p className="text-muted-foreground mb-0.5">Local de Destino</p>
              <p className="font-medium">{checkout?.Customer?.fullname ?? "—"}</p>
              {destinationLabel && <p className="text-muted-foreground">{destinationLabel}</p>}
            </div>

            <div className="border-t pt-3">
              <span className="text-muted-foreground">Distância: </span>
              <span>{checkout?.distanceInKm ? `${checkout.distanceInKm} km` : "—"}</span>
            </div>

            {checkout?.Bookings?.length > 0 && (
              <p>
                <span className="text-muted-foreground">Equipamentos: </span>
                <span>{checkout.Bookings.map((b) => b.Gear.gearName).join(", ")}</span>
              </p>
            )}

            {/* Driver live location info for admin */}
            {!isMotorista && checkout?.driver && isActive && (
              <div className="border-t pt-3">
                <p className="text-muted-foreground mb-0.5">Motorista</p>
                <div className="flex items-center gap-2">
                  <Navigation className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="font-medium">{checkout.driver.fullname}</span>
                </div>
                {driverLocation
                  ? <p className="text-xs text-green-600 mt-0.5">Localização recebida</p>
                  : <p className="text-xs text-muted-foreground mt-0.5">Aguardando localização...</p>
                }
              </div>
            )}
          </div>

          {/* Botões — ações apenas para Motorista */}
          <div className="flex flex-col gap-2 pt-6">
            {isMotorista && isEmAndamento && (
              <Button className="w-full" onClick={ () => setConfirmEntregaOpen(true) } disabled={ isUpdatingStatus }>
                {isUpdatingStatus && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Equipamento Entregue
              </Button>
            )}

            {isMotorista && isEntregue && (
              <Button className="w-full" onClick={ openRecolhidoDialog } disabled={ isUpdatingStatus }>
                {isUpdatingStatus && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Equipamento Recolhido
              </Button>
            )}

            {isConcluido && (
              <Button variant="outline" className="w-full" disabled>
                Entrega Concluída
              </Button>
            )}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={ () => router.back() }>
                Voltar
              </Button>
              {isMotorista && (
                <button
                  className="flex-1 text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={ () => setReportOpen(true) }
                  disabled={ !checkout || isConcluido || isCancelado }
                >
                  Reportar Problema
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report dialog */}
      {checkout && (
        <ReportRouteDialog
          open={ reportOpen }
          onOpenChange={ setReportOpen }
          checkoutId={ routeId }
          customerName={ checkout.Customer?.fullname }
        />
      )}

      {/* Dialog: Confirmar Equipamento Entregue */}
      <Dialog open={ confirmEntregaOpen } onOpenChange={ setConfirmEntregaOpen }>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar entrega ao cliente</DialogTitle>
            <DialogDescription>
              Confirme que o equipamento foi entregue a{" "}
              <span className="font-medium text-foreground">
                {checkout?.Customer?.fullname ?? "o cliente"}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          {isSameDayReturn && (
            <div className="rounded-md bg-muted px-4 py-3">
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">
                Horário previsto de retorno à filial
              </p>
              <p className="text-2xl font-bold tabular-nums">{returnTimeLabel}</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={ () => setConfirmEntregaOpen(false) }>Cancelar</Button>
            <Button
              onClick={ () => { setConfirmEntregaOpen(false); updateStatus("Entregue"); } }
              disabled={ isUpdatingStatus }
            >
              {isUpdatingStatus && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirmar entrega
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Confirmar Equipamento Recolhido (GPS) */}
      <Dialog
        open={ confirmRecolhidoOpen }
        onOpenChange={ (open) => { setConfirmRecolhidoOpen(open); if (!open) setGpsStatus("idle"); } }
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar recolhimento</DialogTitle>
            <DialogDescription>
              Valide sua localização para confirmar que o equipamento foi recolhido no endereço do cliente.
            </DialogDescription>
          </DialogHeader>

          {gpsStatus === "idle" && (
            <div className="flex flex-col items-center gap-3 py-2">
              <MapPin className="h-10 w-10 text-primary" />
              <p className="text-sm text-center text-muted-foreground">
                Clique em <strong>Validar localização</strong> para confirmar que você está no endereço de recolhimento.
              </p>
              {destinationLabel && <p className="text-xs text-center font-medium">{destinationLabel}</p>}
            </div>
          )}

          {gpsStatus === "checking" && (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Obtendo sua localização...</p>
            </div>
          )}

          {gpsStatus === "close" && (
            <div className="flex flex-col items-center gap-3 py-2">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
              <p className="text-sm font-semibold text-green-700">Localização confirmada!</p>
              {gpsDistanceM !== null && (
                <p className="text-xs text-muted-foreground">Você está a {gpsDistanceM} m do endereço.</p>
              )}
            </div>
          )}

          {gpsStatus === "far" && (
            <div className="flex flex-col items-center gap-3 py-2">
              <XCircle className="h-10 w-10 text-destructive" />
              <p className="text-sm font-semibold text-destructive">Você está longe do endereço</p>
              {gpsDistanceM !== null && (
                <p className="text-xs text-muted-foreground text-center">
                  Você está a {gpsDistanceM >= 1000 ? `${(gpsDistanceM / 1000).toFixed(1)} km` : `${gpsDistanceM} m`}.
                  Aproxime-se para confirmar.
                </p>
              )}
              <Button variant="outline" size="sm" onClick={ validateGpsLocation }>Tentar novamente</Button>
            </div>
          )}

          {gpsStatus === "error" && (
            <div className="flex flex-col items-center gap-3 py-2">
              <AlertTriangle className="h-10 w-10 text-amber-500" />
              <p className="text-sm font-semibold">Não foi possível obter a localização</p>
              <p className="text-xs text-muted-foreground text-center">
                Verifique se a permissão de localização está ativada no navegador.
              </p>
              <Button variant="outline" size="sm" onClick={ validateGpsLocation }>Tentar novamente</Button>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={ () => setConfirmRecolhidoOpen(false) }>Cancelar</Button>
            {gpsStatus === "idle" && (
              <Button onClick={ validateGpsLocation }>
                <MapPin className="h-4 w-4 mr-2" />
                Validar localização
              </Button>
            )}
            {gpsStatus === "close" && (
              <Button
                onClick={ () => { setConfirmRecolhidoOpen(false); updateStatus("Concluido"); } }
                disabled={ isUpdatingStatus }
              >
                {isUpdatingStatus && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Confirmar recolhimento
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
