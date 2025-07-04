"use client";

import { Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { gears as gearsMock } from "@/utils/mocks/gears";
import { useState } from "react";
import { UpdateGearDialog } from "../update/UpdateGearDialog";
import { Gear } from "@/utils/@types/gears";

export function GearCard() {
    const [ gears, setGears ] = useState<Gear[]>(gearsMock);

    const [ isDialogOpen, setIsDialogOpen ] = useState(false);
    const [ , setSelectedGear ] = useState<Gear | null>(null);
    const [ editedGear, setEditedGear ] = useState<Gear | null>(null);

    const handleOpenDialog = (gear: Gear) => {
        setSelectedGear(gear);
        setEditedGear({ ...gear });
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-4 md:hidden">
            {gears.map((gear) => (
                <Card
                    key={ gear.gearId }
                    className="p-4 hover:bg-muted/50 cursor-pointer"
                    onClick={ () => handleOpenDialog(gear) }
                >
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{gear.name}</h3>
                        <div
                            className={ `flex items-center gap-1 ${
                                gear.transferable ? "text-green-500" : "text-red-500"
                            }` }
                        >
                            {gear.transferable ? (
                                <>
                                    <Check className="h-5 w-5" />
                                    <span className="text-xs font-medium">Transferível</span>
                                </>
                            ) : (
                                <>
                                    <X className="h-5 w-5" />
                                    <span className="text-xs font-medium">Não transferível</span>
                                </>
                            )}
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {gear.description}
                    </p>

                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                        <div className="font-medium">Filial:</div>
                        <div>{gear.filialId}</div>

                        <div className="font-medium">Unidades disponíveis:</div>
                        <div>{gear.availableUnits}</div>

                        <div className="font-medium">Unidades totais:</div>
                        <div>{gear.totalUnits}</div>

                        <div className="font-medium">Data da aquisição:</div>
                        <div>{gear.acquisitionDate ? gear.acquisitionDate.toLocaleString() : "Não informado"}</div>
                    </div>
                </Card>
            ))}
            <UpdateGearDialog
                selectedGear={ editedGear }
                isUpdateGearDialogOpen={ isDialogOpen }
                setIsUpdateGearDialogOpen={ setIsDialogOpen }
                setGears={ setGears }
                setSelectedGear={ setSelectedGear }
            />
        </div>
    );
}
