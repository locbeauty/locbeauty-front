// import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
// import { useEffect, useState } from "react";

// export function CityInput() {
//     const [ distanceInKM, setDistanceInKM ] = useState(0);
//     const [ cityQuery, setCityQuery ] = useState("");
//     const [ cityOptions, setCityOptions ] = useState<
//   { name: string; distance: number, id: number }[]
// >([]);
//     const [ isLoadingCities, setIsLoadingCities ] = useState(false);

//     useEffect(() => {
//         const delay = setTimeout(() => {
//             if (cityQuery.trim().length > 0) fetchCities(cityQuery);
//         }, 500); // debounce de 500ms

//         return () => clearTimeout(delay);
//     }, [ cityQuery ]);

//     async function fetchCities(query: string) {
//         try {
//             setIsLoadingCities(true);

//             const res = await fetch(
//                 `https://nominatim.openstreetmap.org/search?format=json&countrycodes=br&limit=1&addressdetails=2&q=${query}`
//             );
//             const data = await res.json();

//             console.log("data: ", data);
//             const baseCity = { lat: -8.0476, lon: -34.8770 };

//             const results = data.slice(0, 10).map((item: any, index: number) => {
//                 const lat = Number(item.lat);
//                 const lon = Number(item.lon);

//                 const distance = getDistanceInKm(
//                     baseCity.lat,
//                     baseCity.lon,
//                     lat,
//                     lon
//                 );

//                 const cityName =
//                     data[0]?.address.city ||
//                     data[0]?.address.town ||
//                     data[0]?.address.village ||
//                     data[0]?.address.municipality;

//                 return {
//                     id: index,
//                     name: cityName,
//                     distance: Math.round(distance),
//                 };
//             });

//             setCityOptions(results);
//         } finally {
//             setIsLoadingCities(false);
//         }
//     }

//     function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
//         const R = 6371;
//         const dLat = ((lat2 - lat1) * Math.PI) / 180;
//         const dLon = ((lon2 - lon1) * Math.PI) / 180;

//         const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos((lat1 * Math.PI) / 180) *
//       Math.cos((lat2 * Math.PI) / 180) *
//       Math.sin(dLon / 2) ** 2;

//         return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     }

//     return (
//         <div className="">
//             <Command className="border rounded-md">
//                 <CommandInput
//                     placeholder="Digite a cidade"
//                     value={ cityQuery }
//                     onValueChange={ (value) => setCityQuery(value) }
//                 />
//                 <CommandList>
//                     {isLoadingCities && <CommandEmpty>Buscando cidades...</CommandEmpty>}

//                     {!isLoadingCities && cityOptions.length === 0 && (
//                         <CommandEmpty>Nenhuma cidade encontrada</CommandEmpty>
//                     )}

//                     <CommandGroup>
//                         {cityOptions.map((city) => (
//                             <CommandItem
//                                 key={ city.id }
//                                 value={ city.name }
//                                 onSelect={ () => {
//                                     setCityQuery(city.name);
//                                     setDistanceInKM(city.distance);
//                                 } }
//                             >
//                                 <div className="flex flex-col">
//                                     <span>{city.name}</span>
//                                     <span className="text-sm text-muted-foreground">
//                                         {city.distance} km de distância
//                                     </span>
//                                 </div>
//                             </CommandItem>
//                         ))}
//                     </CommandGroup>
//                 </CommandList>
//             </Command>

//             <p className="text-sm mt-2">
//   Distância selecionada: <strong>{distanceInKM} km</strong>
//             </p>
//         </div>
//     );
// }

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { useEffect, useState } from "react";

// Definição de tipo básico para organizar o estado
type CityOption = {
  id: number | string;
  name: string;
  distance: number;
};

export function CityInput({
    distanceInKM,
    setDistanceInKM,
}: {
  distanceInKM: number;
  setDistanceInKM: (value: number) => void;
}) {
    // const [ distanceInKM, setDistanceInKM ] = useState(0);
    const [ cityQuery, setCityQuery ] = useState("");
    const [ cityOptions, setCityOptions ] = useState<CityOption[]>([]);
    const [ isLoadingCities, setIsLoadingCities ] = useState(false);

    useEffect(() => {
    // AbortController cancela requisições anteriores se o usuário continuar digitando
        const controller = new AbortController();
        const { signal } = controller;

        const fetchCities = async () => {
            try {
                setIsLoadingCities(true);

                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&countrycodes=br&limit=2&addressdetails=1&q=${cityQuery}`,
                    { signal }
                );

                if (!res.ok) throw new Error("Falha na requisição");

                const data = await res.json();

                // Coordenadas de referência (Recife)
                const baseCity = { lat: -8.0476, lon: -34.877 };

                const results = data.map(
                    (item: {
            lat: string;
            lon: string;
            place_id: number;
            address?: {
              city?: string;
              town?: string;
              village?: string;
              municipality?: string;
            };
            display_name: string;
          }) => {
                        const lat = Number(item.lat);
                        const lon = Number(item.lon);

                        const distance = getDistanceInKm(
                            baseCity.lat,
                            baseCity.lon,
                            lat,
                            lon
                        );

                        // CORREÇÃO LÓGICA: Usar 'item' em vez de 'data[0]'
                        const cityName =
              item.address?.city ||
              item.address?.town ||
              item.address?.village ||
              item.address?.municipality ||
              item.display_name.split(",")[0]; // Fallback para o nome principal

                        return {
                            // CORREÇÃO: Usar ID único da API (place_id ou osm_id) em vez do index
                            id: item.place_id,
                            name: cityName,
                            distance: Math.round(distance),
                        };
                    }
                );

                // Remove duplicatas baseadas no nome da cidade para limpar a UI
                const uniqueResults = results.filter(
                    (city: CityOption, index: number, self: CityOption[]) =>
                        index === self.findIndex((c) => c.name === city.name)
                );

                setCityOptions(uniqueResults);
            } catch (error: unknown) {
                if (error instanceof Error && error.name !== "AbortError") {
                    console.error("Erro ao buscar cidades:", error);
                    setCityOptions([]);
                }
            } finally {
                if (!signal.aborted) {
                    setIsLoadingCities(false);
                }
            }
        };

        const delay = setTimeout(() => {
            if (cityQuery.trim().length > 0) {
                fetchCities();
            } else {
                setCityOptions([]);
            }
        }, 500);

        return () => {
            clearTimeout(delay);
            controller.abort(); // Cancela a requisição pendente ao desmontar ou re-executar
        };
    }, [ cityQuery ]); // Dependência única: cityQuery

    useEffect(() => {
        setDistanceInKM(0);
    }, [ setDistanceInKM ]);

    return (
        <div className="w-full">
            {/* shouldFilter={false} é crucial para buscas remotas (server-side) */}
            <Command className="border rounded-md" shouldFilter={ false }>
                <CommandInput
                    placeholder="Digite a cidade"
                    value={ cityQuery }
                    onValueChange={ setCityQuery }
                />
                <CommandList>
                    {isLoadingCities && <CommandEmpty>Buscando cidades...</CommandEmpty>}

                    {!isLoadingCities &&
            cityQuery.length > 0 &&
            cityOptions.length === 0 && (
                        <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
                    )}

                    <CommandGroup>
                        {cityOptions.map((city) => (
                            <CommandItem
                                key={ city.id }
                                value={ city.name } // Importante: O valor deve bater com o texto exibido para seleção funcionar bem
                                onSelect={ (currentValue) => {
                                    setCityQuery(currentValue);
                                    setDistanceInKM(city.distance);
                                    // Opcional: fechar sugestões aqui se desejar
                                } }
                            >
                                <div className="flex flex-col w-full">
                                    <span className="font-medium">{city.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {city.distance} km de distância
                                    </span>
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </Command>

            <p className="text-sm mt-4 text-center">
        Distância selecionada:{" "}
                <strong className="text-primary">{distanceInKM} km</strong>
            </p>
        </div>
    );
}

// Função utilitária movida para fora do componente (não precisa ser recriada a cada render)
function getDistanceInKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
) {
    const R = 6371; // Raio da Terra em km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
