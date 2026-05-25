"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useQuery } from "@tanstack/react-query";
import { findAllFilials } from "@/services/filials.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle, RouteIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const GOOGLE_MAPS_API_KEY = "AIzaSyA_g8REueNGH3OnPicdll0KvPHHgGp8Ses";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: any;
  }
}

const VEHICLE_OPTIONS = [
  { label: "Carro", multiplier: 1 },
  { label: "Caminhão leve", multiplier: 2 },
  { label: "Caminhão pesado", multiplier: 3 },
] as const;

interface AddressDistanceInputProps {
  filialId?: string;
  distanceInKM: number;
  setDistanceInKM: (value: number) => void;
  onTollCost?: (cents: number) => void;
  isRoundTrip?: boolean;
}

export function AddressDistanceInput({
  filialId,
  setDistanceInKM,
  onTollCost,
  isRoundTrip = true,
}: AddressDistanceInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const originRef = useRef<string | null>(null);
  const autocompleteRef = useRef<boolean>(false);

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [rawTollCents, setRawTollCents] = useState(0);
  const [routeInfo, setRouteInfo] = useState<{ km: number; durationText: string } | null>(null);
  const [vehicleIdx, setVehicleIdx] = useState(1); // default: Caminhão leve

  const vehicleMultiplier = VEHICLE_OPTIONS[vehicleIdx].multiplier;
  const tripMultiplier = isRoundTrip ? 2 : 1;
  const adjustedTollCents = rawTollCents * vehicleMultiplier * tripMultiplier;

  // Re-notify parent whenever toll changes (vehicle type, round trip, or new route)
  useEffect(() => {
    if (rawTollCents > 0 && onTollCost) {
      onTollCost(adjustedTollCents);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adjustedTollCents]);

  const tollText = rawTollCents > 0
    ? ` · Pedágios: R$ ${(adjustedTollCents / 100).toFixed(2).replace(".", ",")}`
    : "";
  const successMessage = routeInfo ? `${routeInfo.km} km · ~${routeInfo.durationText}${tollText}` : "";

  const { data: filials } = useQuery({
    queryKey: ["filials-all"],
    queryFn: () => findAllFilials(),
    enabled: !!filialId,
  });

  const filial = filials?.find((f) => f.filialId === filialId);

  useEffect(() => {
    originRef.current = filial?.street
      ? [
          `${filial.street}, ${filial.buildingNumber ?? ""}`,
          filial.neighborhood,
          `${filial.city} - ${filial.state}`,
          filial.zipCode,
          "Brasil",
        ]
          .filter(Boolean)
          .join(", ")
      : null;
  }, [filial]);

  useEffect(() => {
    if (window.google?.maps?.places) {
      initAutocomplete();
      return;
    }
    const interval = setInterval(() => {
      if (window.google?.maps?.places) {
        clearInterval(interval);
        initAutocomplete();
      }
    }, 200);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function initAutocomplete() {
    if (!inputRef.current || autocompleteRef.current) return;
    autocompleteRef.current = true;

    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      { componentRestrictions: { country: "BR" }, fields: ["formatted_address"] },
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const destination = place?.formatted_address;
      if (destination) calculateRoute(destination);
    });
  }

  async function calculateRoute(destinationAddress: string) {
    const origin = originRef.current;
    if (!origin) {
      setStatus("error");
      setErrorMessage("Endereço de origem da filial não encontrado.");
      return;
    }

    setStatus("loading");
    setRouteInfo(null);
    setRawTollCents(0);
    setErrorMessage("");

    try {
      const response = await fetch(
        "https://routes.googleapis.com/directions/v2:computeRoutes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
            "X-Goog-FieldMask":
              "routes.distanceMeters,routes.duration,routes.travelAdvisory.tollInfo",
          },
          body: JSON.stringify({
            origin: { address: origin },
            destination: { address: destinationAddress },
            travelMode: "DRIVE",
            routingPreference: "TRAFFIC_AWARE",
            extraComputations: ["TOLLS"],
          }),
        },
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = await response.json();

      if (!response.ok || !data.routes?.length) {
        setStatus("error");
        setErrorMessage(data.error?.message ?? "Não foi possível calcular a rota.");
        return;
      }

      const route = data.routes[0];
      const km = Math.round(route.distanceMeters / 1000);
      setDistanceInKM(km);

      const durationSecs = parseInt(route.duration?.replace("s", "") || "0");
      const hours = Math.floor(durationSecs / 3600);
      const minutes = Math.floor((durationSecs % 3600) / 60);
      const durationText = hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;

      const tollPrice = route.travelAdvisory?.tollInfo?.estimatedPrice?.[0];
      if (tollPrice) {
        const units = parseInt(tollPrice.units ?? "0");
        const nanos = tollPrice.nanos ?? 0;
        setRawTollCents(Math.round((units + nanos / 1e9) * 100));
      } else {
        setRawTollCents(0);
      }

      setRouteInfo({ km, durationText });
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage("Erro ao conectar com a API de rotas.");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = inputRef.current?.value?.trim();
      if (value) calculateRoute(value);
    }
  }

  function handleCalculateClick() {
    const value = inputRef.current?.value?.trim();
    if (value) calculateRoute(value);
  }

  if (!filialId) {
    return (
      <p className="text-xs text-muted-foreground py-2">
        Selecione uma filial primeiro.
      </p>
    );
  }

  return (
    <>
      <Script
        src={ `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places` }
        strategy="afterInteractive"
        onLoad={ initAutocomplete }
      />

      <div className="space-y-2">
        {/* Tipo de veículo */}
        <div className="flex gap-1">
          {VEHICLE_OPTIONS.map((opt, idx) => (
            <button
              key={ opt.label }
              type="button"
              onClick={ () => setVehicleIdx(idx) }
              className={ cn(
                "flex-1 text-xs px-2 py-1 rounded border transition-colors",
                vehicleIdx === idx
                  ? "bg-primary text-primary-foreground border-primary font-semibold"
                  : "bg-background text-muted-foreground border-input hover:border-primary/50",
              ) }
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Input de endereço */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              ref={ inputRef }
              placeholder="Digite o endereço de destino..."
              onKeyDown={ handleKeyDown }
              onChange={ () => {
                if (status !== "idle") {
                  setStatus("idle");
                  setRouteInfo(null);
                  setRawTollCents(0);
                }
              } }
            />
            {status === "loading" && (
              <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {status === "success" && (
              <CheckCircle2 className="absolute right-2 top-2.5 h-4 w-4 text-green-600" />
            )}
            {status === "error" && (
              <AlertCircle className="absolute right-2 top-2.5 h-4 w-4 text-destructive" />
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={ handleCalculateClick }
            disabled={ status === "loading" }
            title="Calcular rota"
          >
            <RouteIcon className="h-4 w-4" />
          </Button>
        </div>

        {status === "success" && successMessage && (
          <p className="text-xs text-green-600 font-medium">{successMessage}</p>
        )}
        {status === "error" && (
          <p className="text-xs text-destructive">{errorMessage || "Erro ao calcular rota."}</p>
        )}
        {!filial?.street && (
          <p className="text-xs text-amber-600">
            Endereço da filial não cadastrado.
          </p>
        )}
      </div>
    </>
  );
}
