"use client";
import { Check, Eye, Pencil, X } from "lucide-react";
import { Fragment, useState } from "react";
import { ResponsiveCard } from "@/components/shared/ResponsiveCard";
import { gears as gearsMock } from "@/utils/mocks/gears";
import { UpdateGearDialog } from "../update/UpdateGearDialog";
import { Button } from "@/components/ui/button";
import { GearDetailsDialog } from "./GearDetailsDialog";
import { Gear } from "@/utils/@types/gears";

export function GearsTable() {
    const [ gears, setGears ] = useState<Gear[]>(gearsMock);

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

    return (
        <>
            <div className="border rounded-lg max-h-[70vh] w-full overflow-x-auto hidden md:block">
                <table className="w-full">
                    <thead className="bg-muted">
                        <tr>
                            <th className="text-left p-3 font-medium">Nome</th>
                            <th className="text-left p-3 font-medium">Descrição</th>
                            <th className="text-center p-3 font-medium">Regional</th>
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
                                key={ gear.id }
                                className="border-t hover:bg-muted/50 items-stretch"
                            >
                                <td className="p-3">{gear.name}</td>
                                <td className="p-3 max-w-[700px] truncate whitespace-nowrap overflow-hidden">
                                    {gear.description}
                                </td>
                                <td className="p-3 text-center">{gear.region}</td>
                                <td className="p-3 text-center">{gear.availableUnits}</td>
                                <td className="p-3 text-center">{gear.totalUnits}</td>
                                <td className="p-3 text-center">{gear.acquisitionDate ? gear.acquisitionDate.toLocaleDateString("pt-BR") : "Não informado"}</td>
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
                <Fragment key={ gear.id }>
                    <ResponsiveCard
                        cardData={ {
                            id: gear.id,
                            title: gear.name,
                            description: gear.description,
                            transferableIndicator: true,
                            transferable: gear.transferable,
                            items: [
                                { itemLabel: "Regional:", itemInfo: gear.region },
                                {
                                    itemLabel: "Unidades disponíveis: ",
                                    itemInfo: gear.availableUnits,
                                },
                                { itemLabel: "Unidades totais:", itemInfo: gear.totalUnits },
                                {
                                    itemLabel: "Data da aquisição:",
                                    itemInfo: gear.acquisitionDate ? gear.acquisitionDate.toLocaleDateString("pt-BR") : "Não informado",
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
