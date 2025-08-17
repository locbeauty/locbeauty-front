"use client";
import { Check, Eye, Pencil, X } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { ResponsiveCard } from "@/components/shared/ResponsiveCard";
import { UpdateGearDialog } from "../update/UpdateGearDialog";
import { Button } from "@/components/ui/button";
import { GearDetailsDialog } from "./GearDetailsDialog";
import { Gear } from "@/utils/@types/gears";
import { useAuth } from "@/contexts/auth-provider";
import { fetchWithToken } from "@/utils/fetchWithToken";

export function GearsTable() {
    const [ gears, setGears ] = useState<Gear[] | null>(null);

    const [ isUpdateGearDialogOpen, setIsUpdateGearDialogOpen ] = useState(false);
    const [ isGearDetailsDialogOpen, setIsGearDetailsDialogOpen ] = useState(false);
    const [ selectedGear, setSelectedGear ] = useState<Gear | null>(null);

    const { user } = useAuth();

    const handleToggleUpdateGearDialog = (openStatus: boolean, gear: Gear | null) => {
        setIsUpdateGearDialogOpen(openStatus);
        setSelectedGear(gear);
    };

    const handleToggleGearDetailsDialog = (openStatus: boolean, gear: Gear | null) => {
        if(openStatus) {
            setSelectedGear(gear);
        }
        setIsGearDetailsDialogOpen(openStatus);
    };

    useEffect(() => {
        async function getGears() {
            const url = new URL(`${process.env.NEXT_PUBLIC_SERVER_URL}/gears`);
            if(user && user?.role !== "Gerente") {
                url.searchParams.append("filialId", user?.sourceFilial.filialId);
            }
            const response = await fetchWithToken(url, { credentials: "include" });

            const { data } = await response.json();
            console.log("data: ", data);
            setGears(data);
        }
        getGears();
    }, [ user ]);

    return (
        <>
            <div className="border rounded-lg max-h-[70vh] w-full overflow-x-auto hidden md:block">
                <table className="w-full">
                    <thead className="bg-muted">
                        <tr>
                            <th className="text-left p-3 font-medium">Nome</th>
                            <th className="text-center p-3 font-medium">Filial</th>
                            <th className="text-center p-3 font-medium">
                Unidades disponíveis
                            </th>
                            <th className="text-center p-3 font-medium">Unidades operacionais</th>
                            <th className="text-center p-3 font-medium">Data da aquisição</th>
                            <th className="text-center p-3 font-medium">
                Pode ser transferido?
                            </th>
                            <th className="text-center p-3 font-medium">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {gears?.length === 0 && (
                            <tr>
                                <td className="text-center p-4" colSpan={ 8 }>
                                    Nada a mostrar por aqui.
                                </td>
                            </tr>
                        )}
                        {gears ? (gears.map((gear) => (
                            <tr
                                key={ gear.gearId }
                                className="border-t hover:bg-muted/50 items-stretch"
                            >
                                <td className="p-3">{gear.gearName}</td>
                                <td className="p-3 text-center">{gear.SourceFilial.filialName}</td>
                                <td className="p-3 text-center">{gear.availableUnits}</td>
                                <td className="p-3 text-center">{gear.totalUnits}</td>
                                <td className="p-3 text-center">{gear.acquisitionDate ? new Date(gear.acquisitionDate).toLocaleDateString("pt-BR") : "Não informado"}</td>
                                <td className="p-0 h-full">
                                    <div className="h-full flex justify-center items-center">
                                        {gear.transferable ? (
                                            <Check className="text-green-500" />
                                        ) : (
                                            <X className="text-red-500" />
                                        )}
                                    </div>
                                </td>
                                <td className="p-3 text-center flex items-center gap-4">
                                    <Button onClick={ () => handleToggleGearDetailsDialog(true, gear) }>
                                        <Eye />
                                    </Button>

                                    <Button variant="outline" onClick={ () => handleToggleUpdateGearDialog(true, gear) }>
                                        <Pencil />
                                    </Button>
                                </td>
                            </tr>
                        ) )) : (
                            <tr>
                                <td
                                    colSpan={ 8 }
                                    className="p-4 text-center text-muted-foreground"
                                >
                  Carregando...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {gears && gears.map((gear) => (
                <Fragment key={ gear.gearId }>
                    <ResponsiveCard
                        cardData={ {
                            id: gear.gearId,
                            title: gear.gearName,
                            transferableIndicator: true,
                            transferable: gear.transferable,
                            items: [
                                { itemLabel: "Filial:", itemInfo: gear.SourceFilial.filialId },
                                {
                                    itemLabel: "Unidades disponíveis: ",
                                    itemInfo: gear.availableUnits,
                                },
                                { itemLabel: "Unidades totais:", itemInfo: gear.availableUnits },
                                {
                                    itemLabel: "Data da aquisição:",
                                    itemInfo: gear.acquisitionDate ? new Date(gear.acquisitionDate).toLocaleDateString("pt-BR") : "Não informado",
                                },
                            ],
                        } }
                        rawData={ gear }
                        handleToggleDialog={ handleToggleGearDetailsDialog }
                    />
                </Fragment>
            ))}
            <GearDetailsDialog
                handleToggleUpdateGearDialog={ handleToggleUpdateGearDialog }
                handleToggleGearDetailsDialog={ handleToggleGearDetailsDialog }
                isGearDetailsModalOpen={ isGearDetailsDialogOpen }
                selectedGear={ selectedGear }
            />

            <UpdateGearDialog
                selectedGear={ selectedGear }
                isUpdateGearDialogOpen={ isUpdateGearDialogOpen }
                setIsUpdateGearDialogOpen={ setIsUpdateGearDialogOpen }
                // setUpdatedGear={ setUpdatedGear }
                setGears={ setGears }
                setSelectedGear={ setSelectedGear }
            />
        </>
    );
}
