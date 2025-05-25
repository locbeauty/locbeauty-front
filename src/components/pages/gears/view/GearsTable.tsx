"use client";
import { Check, X } from "lucide-react";
import { Fragment, useState } from "react";
import { ResponsiveCard } from "@/components/shared/ResponsiveCard";
import { gears as gearsMock } from "@/utils/mocks/gears";
import { Gear } from "./GearCard";
import { UpdateDialog } from "../update/UpdateDialog";

export function GearsTable() {
    const [ gears, setGears ] = useState<Gear[]>(gearsMock);

    const [ isDialogOpen, setIsDialogOpen ] = useState(false);
    const [ , setSelectedGear ] = useState<Gear | null>(null);
    const [ editedGear, setEditedGear ] = useState<Gear | null>(null);

    const handleToggleUpdateGearDialog = (openStatus: boolean, gear: Gear) => {
        setIsDialogOpen(openStatus);
        setSelectedGear(gear);
        setEditedGear({ ...gear });
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
                                <td className="p-3 text-center">{gear.acquisitionDate}</td>
                                <td className="p-0 h-full">
                                    <div className="h-full flex justify-center items-center">
                                        {gear.transferable ? (
                                            <Check className="text-green-500" />
                                        ) : (
                                            <X className="text-red-500" />
                                        )}
                                    </div>
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
                                    itemInfo: gear.acquisitionDate,
                                },
                            ],
                        } }
                        rawData={ gear }
                        handleToggleDialog={ handleToggleUpdateGearDialog }
                    />
                </Fragment>
            ))}

            <UpdateDialog
                editedGear={ editedGear }
                isDialogOpen={ isDialogOpen }
                setIsDialogOpen={ setIsDialogOpen }
                setEditedGear={ setEditedGear }
                setGears={ setGears }
                setSelectedGear={ setSelectedGear }
            />
        </>
    );
}
