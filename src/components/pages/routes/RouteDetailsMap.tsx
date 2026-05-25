"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { MapPin } from "lucide-react";

const GOOGLE_MAPS_API_KEY = "AIzaSyA_g8REueNGH3OnPicdll0KvPHHgGp8Ses";

interface RouteDetailsMapProps {
  origin: string | null;
  destination: string | null;
  driverLocation?: { lat: number; lng: number } | null;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: any;
  }
}

function decodePolyline(encoded: string): Array<{ lat: number; lng: number }> {
  const points: Array<{ lat: number; lng: number }> = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let b: number;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return points;
}

export function RouteDetailsMap({ origin, destination, driverLocation }: RouteDetailsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const driverMarkerRef = useRef<any>(null);
  const initializedRef = useRef(false);
  const [ mapError, setMapError ] = useState<string | null>(null);
  const [ isMapReady, setIsMapReady ] = useState(false);

  async function initMap() {
    if (!mapRef.current || !window.google?.maps) return;
    if (!origin || !destination) return;
    if (initializedRef.current) return;
    initializedRef.current = true;

    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 7,
      center: { lat: -8.0539, lng: -34.8811 },
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });
    mapInstanceRef.current = map;

    try {
      const response = await fetch(
        "https://routes.googleapis.com/directions/v2:computeRoutes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
            "X-Goog-FieldMask":
              "routes.polyline.encodedPolyline,routes.legs.startLocation,routes.legs.endLocation",
          },
          body: JSON.stringify({
            origin: { address: origin },
            destination: { address: destination },
            travelMode: "DRIVE",
          }),
        },
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = await response.json();

      if (!response.ok || !data.routes?.length) {
        setMapError("Não foi possível calcular a rota. Verifique os endereços.");
        setIsMapReady(true);
        return;
      }

      const route = data.routes[0];
      const encodedPolyline = route.polyline?.encodedPolyline;

      if (encodedPolyline) {
        const path = decodePolyline(encodedPolyline);

        new window.google.maps.Polyline({
          path,
          geodesic: true,
          strokeColor: "#4F46E5",
          strokeOpacity: 0.85,
          strokeWeight: 4,
          map,
        });

        const bounds = new window.google.maps.LatLngBounds();
        path.forEach((p) => bounds.extend(p));
        map.fitBounds(bounds);
      }

      const startLatLng = route.legs?.[0]?.startLocation?.latLng;
      const endLatLng = route.legs?.[0]?.endLocation?.latLng;

      if (startLatLng) {
        new window.google.maps.Marker({
          position: { lat: startLatLng.latitude, lng: startLatLng.longitude },
          map,
          label: { text: "A", color: "white", fontWeight: "bold" },
          title: origin,
        });
      }

      if (endLatLng) {
        new window.google.maps.Marker({
          position: { lat: endLatLng.latitude, lng: endLatLng.longitude },
          map,
          label: { text: "B", color: "white", fontWeight: "bold" },
          title: destination,
        });
      }

      setIsMapReady(true);
    } catch {
      setMapError("Erro ao conectar com a API de rotas.");
      setIsMapReady(true);
    }
  }

  useEffect(() => {
    initializedRef.current = false;
    setIsMapReady(false);
    setMapError(null);

    if (window.google?.maps && origin && destination) {
      initMap();
      return;
    }

    const interval = setInterval(() => {
      if (window.google?.maps && origin && destination) {
        clearInterval(interval);
        initMap();
      }
    }, 200);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ origin, destination ]);

  // Update driver marker whenever live location changes
  useEffect(() => {
    if (!driverLocation || !mapInstanceRef.current || !window.google?.maps) return;

    const position = { lat: driverLocation.lat, lng: driverLocation.lng };

    if (driverMarkerRef.current) {
      driverMarkerRef.current.setPosition(position);
    } else {
      driverMarkerRef.current = new window.google.maps.Marker({
        position,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        map: mapInstanceRef.current as any,
        title: "Motorista",
        zIndex: 100,
        icon: {
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 7,
          fillColor: "#7c3aed",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          rotation: 0,
        },
      });
    }
  }, [ driverLocation ]);

  if (!origin || !destination) {
    return (
      <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
        <MapPin className="h-8 w-8 mb-2" />
        <p className="text-sm">Endereços insuficientes para exibir o mapa.</p>
      </div>
    );
  }

  return (
    <>
      <Script
        src={ `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places` }
        strategy="afterInteractive"
        onLoad={ () => {
          initializedRef.current = false;
          initMap();
        } }
      />
      <div className="relative h-full min-h-[360px]">
        <div ref={ mapRef } className="w-full h-full absolute inset-0" />
        {!isMapReady && !mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
            <div className="text-sm text-muted-foreground">Carregando mapa...</div>
          </div>
        )}
        {mapError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/20">
            <MapPin className="h-8 w-8 mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center px-4">{mapError}</p>
          </div>
        )}
      </div>
    </>
  );
}
