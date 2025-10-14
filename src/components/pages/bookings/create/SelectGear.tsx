// "use client";

// import {
//     Controller,
//     ControllerRenderProps,
//     useFormContext,
// } from "react-hook-form";

// import { Button } from "@/components/ui/button";
// import {
//     Command,
//     CommandEmpty,
//     CommandGroup,
//     CommandInput,
//     CommandItem,
//     CommandList,
// } from "@/components/ui/command";
// import {
//     Drawer,
//     DrawerContent,
//     DrawerTitle,
//     DrawerTrigger,
// } from "@/components/ui/drawer";
// import {
//     Popover,
//     PopoverContent,
//     PopoverTrigger,
// } from "@/components/ui/popover";
// import { useMediaQuery } from "usehooks-ts";
// import { useMounted } from "@/hooks/useMounted";
// import { useEffect, useState } from "react";
// import { Gear } from "@/utils/@types/gears";
// import { CreateBookingFormSchemaType } from "@/lib/zod/CreateBookingValidation";
// import { useCart } from "@/contexts/cart-provider";
// import { useAuth } from "@/contexts/auth-provider";
// import { GetAllGears } from "@/services/gears.service";
// import { useQuery } from "@tanstack/react-query";
// import { ApiResponse } from "@/lib/api";

// export function SelectGear({
//     gears,
//     onSelect,
// }: {
//   gears: Gear[] | undefined;
//   onSelect: (gear: Gear) => void;
// }) {
//     const [ filteredGears, setFilteredGears ] = useState<Gear[] | undefined>([]);
//     const { user } = useAuth();

//     const isMounted = useMounted();
//     const isDesktop = useMediaQuery("(min-width: 768px)");
//     // const { items } = useCart();

//     const {
//         control,
//         watch
//     } = useFormContext<CreateBookingFormSchemaType>();

//     const items = watch("gears");

//     const filialId = user?.role === "Gerente" ? user.sourceFilial.filialId : undefined;

//     const { data, isLoading, error, refetch } = useQuery<ApiResponse<Gear[]>, Error>({
//         queryKey: [ "get-all-gears" ],
//         queryFn: () => GetAllGears({ filialId }),
//         staleTime: 1000 * 60, // 1 minuto de cache
//     });

//     const originalGears = data?.data;

//     useEffect(() => {
//         const updated = originalGears?.filter(
//             gear => !items?.some(item => item.gearId === gear.gearId)
//         );
//         setFilteredGears(updated);
//     }, [ items, originalGears ]);

//     if (!isMounted) {
//         return <div className="h-10 w-full" />;
//     }

//     return (
//         <div className="flex flex-col space-y-1">
//             <Controller
//                 control={ control }
//                 name="gears"
//                 render={ ({ field }) =>
//                     isDesktop ? (
//                         <DesktopSelect gears={ filteredGears } field={ field } />
//                     ) : (
//                         <MobileSelect gears={ filteredGears } field={ field } />
//                     )
//                 }
//             />
//         </div>
//     );
// }

// function DesktopSelect({
//     field,
//     gears,
// }: {
//     field: ControllerRenderProps<CreateBookingFormSchemaType, "gears">;
//     gears: Gear[] | undefined;
// }) {
//     const [ open, setOpen ] = useState(false);

//     const selectedGear = field.value;

//     return (
//         <Popover open={ open } onOpenChange={ setOpen }>
//             <PopoverTrigger asChild>
//                 <Button variant="outline" className="w-full justify-start group cursor-pointer">
//                     {field.value && field.value.length > 0 ? (
//                         <>{field.value.map((g) => g.gearName).join(", ")}</>
//                     ) : (
//                         <span className="text-placeholder group-hover:text-white">Selecione a máquina</span>
//                     )}
//                 </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-full p-0" align="start">
//                 <GearsList
//                     gears={ gears }
//                     setOpen={ setOpen }
//                     onChange={ field.onChange }
//                     value={ field.value }
//                 />
//             </PopoverContent>
//         </Popover>
//     );
// }

// function MobileSelect({
//     field,
//     gears,
// }: {
//   field: ControllerRenderProps<CreateBookingFormSchemaType, "gears">;
//   gears: Gear[] | undefined;
// }) {
//     const [ open, setOpen ] = useState(false);

//     const selectedGear = field.value;

//     return (
//         <Drawer open={ open } onOpenChange={ setOpen }>
//             <DrawerTrigger asChild>
//                 <Button variant="outline" className="w-full justify-start group cursor-pointer">
//                     {field.value && field.value.length > 0 ? (
//                         <>{field.value.map((g) => g.gearName).join(", ")}</>
//                     ) : (
//                         <span className="text-placeholder group-hover:text-white">Selecione a máquina</span>
//                     )}
//                 </Button>
//             </DrawerTrigger>
//             <DrawerContent>
//                 <DrawerTitle className="px-4 pt-4 text-base font-semibold">
//           Máquinas
//                 </DrawerTitle>
//                 <div className="mt-2 border-t px-4">
//                     <GearsList
//                         gears={ gears }
//                         setOpen={ setOpen }
//                         onChange={ field.onChange }
//                         value={ field.value }
//                     />
//                 </div>
//             </DrawerContent>
//         </Drawer>
//     );
// }

// function GearsList({
//     setOpen,
//     onChange,
//     value,
//     gears,
// }: {
//   setOpen: (_open: boolean) => void;
//   onChange: (_value: { gearId: string; gearName: string }[]) => void;
//   value: { gearId: string; gearName: string }[];
//   gears: Gear[] | undefined;
// }) {
//     return (
//         <Command>
//             <CommandInput placeholder="Filtrar máquinas..." />
//             <CommandList>
//                 <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
//                 <CommandGroup>
//                     {gears?.map((gear) => (
//                         <CommandItem
//                             key={ gear.gearId }
//                             value={ gear.gearName }
//                             className="w-full"
//                             onSelect={ () => {
//                                 // Evita duplicatas
//                                 const alreadySelected = value?.some(
//                                     (g) => g.gearId === gear.gearId
//                                 );

//                                 if (!alreadySelected) {
//                                     onChange([ ...(value || []), { gearId: gear.gearId, gearName: gear.gearName } ]);
//                                 }

//                                 setOpen(false);
//                             } }
//                         >
//                             {gear.gearName}
//                         </CommandItem>
//                     ))}
//                 </CommandGroup>
//             </CommandList>
//         </Command>
//     );
// }

// "use client";

// import {
//     Controller,
//     useFormContext,
// } from "react-hook-form";

// import { Button } from "@/components/ui/button";
// import {
//     Command,
//     CommandEmpty,
//     CommandGroup,
//     CommandInput,
//     CommandItem,
//     CommandList,
// } from "@/components/ui/command";
// import {
//     Drawer,
//     DrawerContent,
//     DrawerTitle,
//     DrawerTrigger,
// } from "@/components/ui/drawer";
// import {
//     Popover,
//     PopoverContent,
//     PopoverTrigger,
// } from "@/components/ui/popover";
// import { useMediaQuery } from "usehooks-ts";
// import { useMounted } from "@/hooks/useMounted";
// import { useEffect, useState } from "react";
// import { Gear } from "@/utils/@types/gears";
// import { CreateBookingFormSchemaType } from "@/lib/zod/CreateBookingValidation";
// import { useAuth } from "@/contexts/auth-provider";
// import { GetAllGears } from "@/services/gears.service";
// import { useQuery } from "@tanstack/react-query";
// import { ApiResponse } from "@/lib/api";

// export function SelectGear({
//     onSelect,
// }: {
//   onSelect: (gear: Gear) => void;
// }) {
//     const [ filteredGears, setFilteredGears ] = useState<Gear[]>([]);
//     const { user } = useAuth();

//     const isMounted = useMounted();
//     const isDesktop = useMediaQuery("(min-width: 768px)");

//     const { watch } = useFormContext<CreateBookingFormSchemaType>();
//     const selectedGears = watch("gears");

//     const filialId = user?.role === "Gerente" ? user.sourceFilial.filialId : undefined;

//     const { data } = useQuery<ApiResponse<Gear[]>, Error>({
//         queryKey: [ "get-all-gears", filialId ],
//         queryFn: () => GetAllGears({ filialId }),
//         staleTime: 1000 * 60,
//     });

//     const allGears = data?.data ?? [];

//     useEffect(() => {
//         const updated = allGears.filter(
//             (gear) => !selectedGears?.some((item) => item.gearId === gear.gearId)
//         );
//         setFilteredGears(updated);
//     }, [ selectedGears, allGears ]);

//     if (!isMounted) return <div className="h-10 w-full" />;

//     return (
//         <div className="flex flex-col space-y-1">
//             {isDesktop ? (
//                 <DesktopSelect gears={ filteredGears } onSelect={ onSelect } />
//             ) : (
//                 <MobileSelect gears={ filteredGears } onSelect={ onSelect } />
//             )}
//         </div>
//     );
// }

// function DesktopSelect({
//     gears,
//     onSelect,
// }: {
//   gears: Gear[];
//   onSelect: (gear: Gear) => void;
// }) {
//     const [ open, setOpen ] = useState(false);

//     return (
//         <Popover open={ open } onOpenChange={ setOpen }>
//             <PopoverTrigger asChild>
//                 <Button variant="outline" className="w-full justify-start group cursor-pointer">
//                     <span className="text-placeholder group-hover:text-white">
//             Selecione a máquina
//                     </span>
//                 </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-full p-0" align="start">
//                 <GearsList gears={ gears } setOpen={ setOpen } onSelect={ onSelect } />
//             </PopoverContent>
//         </Popover>
//     );
// }

// function MobileSelect({
//     gears,
//     onSelect,
// }: {
//   gears: Gear[];
//   onSelect: (gear: Gear) => void;
// }) {
//     const [ open, setOpen ] = useState(false);

//     return (
//         <Drawer open={ open } onOpenChange={ setOpen }>
//             <DrawerTrigger asChild>
//                 <Button variant="outline" className="w-full justify-start group cursor-pointer">
//                     <span className="text-placeholder group-hover:text-white">
//             Selecione a máquina
//                     </span>
//                 </Button>
//             </DrawerTrigger>
//             <DrawerContent>
//                 <DrawerTitle className="px-4 pt-4 text-base font-semibold">
//           Máquinas
//                 </DrawerTitle>
//                 <div className="mt-2 border-t px-4">
//                     <GearsList gears={ gears } setOpen={ setOpen } onSelect={ onSelect } />
//                 </div>
//             </DrawerContent>
//         </Drawer>
//     );
// }

// function GearsList({
//     setOpen,
//     onSelect,
//     gears,
// }: {
//   setOpen: (open: boolean) => void;
//   onSelect: (gear: Gear) => void;
//   gears: Gear[];
// }) {
//     return (
//         <Command>
//             <CommandInput placeholder="Filtrar máquinas..." />
//             <CommandList>
//                 <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
//                 <CommandGroup>
//                     {gears.map((gear) => (
//                         <CommandItem
//                             key={ gear.gearId }
//                             value={ gear.gearName }
//                             onSelect={ () => {
//                                 onSelect(gear);
//                                 setOpen(false);
//                             } }
//                         >
//                             {gear.gearName}
//                         </CommandItem>
//                     ))}
//                 </CommandGroup>
//             </CommandList>
//         </Command>
//     );
// }
"use client";

import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Drawer,
    DrawerContent,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useMediaQuery } from "usehooks-ts";
import { useMounted } from "@/hooks/useMounted";
import { useEffect, useMemo, useState } from "react";
import { Gear } from "@/utils/@types/gears";
import { useAuth } from "@/contexts/auth-provider";
import { GetAllGears } from "@/services/gears.service";
import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { CreateCheckoutFormSchemaType } from "@/lib/zod/CreateBookingValidation";

export function SelectGear({ onSelect }: { onSelect: (gear: Gear) => void }) {
    const [ filteredGears, setFilteredGears ] = useState<Gear[] | undefined>([]);
    const { user } = useAuth();
    const isMounted = useMounted();
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const { watch } = useFormContext<CreateCheckoutFormSchemaType>();

    // const selectedGears = useMemo(() => watch("gears") || [], [ watch ]);
    const items = watch("gears");

    const filialId =
    user?.role === "Gerente" ? user.sourceFilial.filialId : undefined;

    const { data } = useQuery<ApiResponse<Gear[]>, Error>({
        queryKey: [ "get-all-gears", filialId ],
        queryFn: () => GetAllGears({ filialId }),
        staleTime: 1000 * 60,
    });

    const originalGears = data?.data;

    // useEffect(() => {
    //     const updated = allGears.filter(
    //         (gear) => !selectedGears.some((item) => item.gearId === gear.gearId)
    //     );

    //     // Evita setState se nada mudou
    //     setFilteredGears((prev) => {
    //         const sameLength = prev.length === updated.length;
    //         const sameItems = sameLength && prev.every((g, i) => g.gearId === updated[i].gearId);
    //         return sameItems ? prev : updated;
    //     });
    // }, [ selectedGears, allGears ]);

    useEffect(() => {
        const updated = originalGears?.filter(
            gear => !items?.some(item => item.gearId === gear.gearId)
        );
        setFilteredGears(updated);
    }, [ items, originalGears ]);

    if (!isMounted) return <div className="h-10 w-full" />;

    return (
        <div className="flex flex-col space-y-1">
            {
                !filteredGears ? (<Loader2 className="animate-spin" />) : (
                    isDesktop ? (
                        <DesktopSelect gears={ filteredGears } onSelect={ onSelect } />
                    ) : (
                        <MobileSelect gears={ filteredGears } onSelect={ onSelect } />
                    )
                )
            }
        </div>
    );
}

function DesktopSelect({
    gears,
    onSelect,
}: {
  gears: Gear[];
  onSelect: (gear: Gear) => void;
}) {
    const [ open, setOpen ] = useState(false);

    return (
        <Popover open={ open } onOpenChange={ setOpen }>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full justify-start group cursor-pointer"
                >
                    <span className="text-placeholder group-hover:text-white">
            Selecione a máquina
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <GearsList gears={ gears } setOpen={ setOpen } onSelect={ onSelect } />
            </PopoverContent>
        </Popover>
    );
}

function MobileSelect({
    gears,
    onSelect,
}: {
  gears: Gear[];
  onSelect: (gear: Gear) => void;
}) {
    const [ open, setOpen ] = useState(false);

    return (
        <Drawer open={ open } onOpenChange={ setOpen }>
            <DrawerTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full justify-start group cursor-pointer"
                >
                    <span className="text-placeholder group-hover:text-white">
            Selecione a máquina
                    </span>
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerTitle className="px-4 pt-4 text-base font-semibold">
          Máquinas
                </DrawerTitle>
                <div className="mt-2 border-t px-4">
                    <GearsList gears={ gears } setOpen={ setOpen } onSelect={ onSelect } />
                </div>
            </DrawerContent>
        </Drawer>
    );
}

function GearsList({
    gears,
    setOpen,
    onSelect,
}: {
  gears: Gear[];
  setOpen: (_open: boolean) => void;
  onSelect: (gear: Gear) => void;
}) {
    return (
        <Command>
            <CommandInput placeholder="Filtrar máquinas..." />
            <CommandList>
                <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                <CommandGroup>
                    {gears.map((gear) => (
                        <CommandItem
                            key={ gear.gearId }
                            value={ gear.gearName }
                            className="w-full"
                            onSelect={ () => {
                                onSelect(gear);
                                setOpen(false);
                            } }
                        >
                            {gear.gearName}
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </Command>
    );
}
