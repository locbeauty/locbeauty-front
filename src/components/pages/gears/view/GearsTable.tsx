"use client";
import { Check, Eye, Pencil, X } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { ResponsiveCard } from "@/components/shared/ResponsiveCard";
import { UpdateGearDialog } from "../update/UpdateGearDialog";
import { Button } from "@/components/ui/button";
import { GearDetailsDialog } from "./GearDetailsDialog";
import { Gear } from "@/utils/@types/gears";

export function GearsTable() {
    const [ gears, setGears ] = useState<Gear[]>([]);

    const [ isUpdateGearDialogOpen, setIsUpdateGearDialogOpen ] = useState(false);
    const [ isGearDetailsDialogOpen, setIsGearDetailsDialogOpen ] = useState(false);
    const [ selectedGear, setSelectedGear ] = useState<Gear | null>(null);

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
            const response = await fetch("http://localhost:3333/api/gears/", { credentials: "include" });

            const { data } = await response.json();
            setGears(data);
        }
        getGears();
    }, []);

    return (
        <>
            <div className="border rounded-lg max-h-[70vh] w-full overflow-x-auto hidden md:block">
                <table className="w-full">
                    <thead className="bg-muted">
                        <tr>
                            <th className="text-left p-3 font-medium">Nome</th>
                            <th className="text-left p-3 font-medium">Descrição</th>
                            <th className="text-center p-3 font-medium">Filial</th>
                            <th className="text-center p-3 font-medium">
                Unidades disponíveis
                            </th>
                            <th className="text-center p-3 font-medium">Unidades totais</th>
                            <th className="text-center p-3 font-medium">Data da aquisição</th>
                            <th className="text-center p-3 font-medium">
                Pode ser transferido?
                            </th>
                            <th className="text-center p-3 font-medium">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {gears.map((gear) => (
                            <tr
                                key={ gear.gearId }
                                className="border-t hover:bg-muted/50 items-stretch"
                            >
                                <td className="p-3">{gear.name}</td>
                                <td className="p-3 max-w-[700px] truncate whitespace-nowrap overflow-hidden">
                                    {gear.description}
                                </td>
                                <td className="p-3 text-center">{gear.filialId}</td>
                                <td className="p-3 text-center">{gear.availableUnits}</td>
                                <td className="p-3 text-center">{gear.availableUnits}</td>
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
                        ))}
                    </tbody>
                </table>
            </div>
            {gears.map((gear) => (
                <Fragment key={ gear.gearId }>
                    <ResponsiveCard
                        cardData={ {
                            id: gear.gearId,
                            title: gear.name,
                            description: gear.description,
                            transferableIndicator: true,
                            transferable: gear.transferable,
                            items: [
                                { itemLabel: "Filial:", itemInfo: gear.filialId },
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
