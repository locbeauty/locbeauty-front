import { Check, X } from "lucide-react";
import { GearCard } from "./GearCard";
import { gears } from "@/utils/mocks/gears";

export function GearsTable() {

    return (
        <>
            <div className="border rounded-lg max-h-[70vh] w-full overflow-x-auto hidden md:block">
                <table className="w-full">
                    <thead className="bg-muted">
                        <tr>
                            <th className="text-left p-3 font-medium">Nome</th>
                            <th className="text-left p-3 font-medium">Descrição</th>
                            <th className="text-center p-3 font-medium">Regional</th>
                            <th className="text-center p-3 font-medium">Unidades disponíveis</th>
                            <th className="text-center p-3 font-medium">Unidades totais</th>
                            <th className="text-center p-3 font-medium">Data da aquisição</th>
                            <th className="text-center p-3 font-medium">Pode ser transferido?</th>
                        </tr>
                    </thead>
                    <tbody>
                        {gears.map((gear, index) => (
                            <tr key={ index } className="border-t hover:bg-muted/50 items-stretch">
                                <td className="p-3">{gear.name}</td>
                                <td className="p-3 max-w-[700px] truncate whitespace-nowrap overflow-hidden">{gear.description}</td>
                                <td className="p-3 text-center">{gear.region}</td>
                                <td className="p-3 text-center">{gear.availableUnits}</td>
                                <td className="p-3 text-center">{gear.totalUnits}</td>
                                <td className="p-3 text-center">{gear.acquisitionDate}</td>
                                <td className="p-0 h-full">
                                    <div className="h-full flex justify-center items-center">
                                        {gear.transferable ? <Check className="text-green-500" /> : <X className="text-red-500" />}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <GearCard />
        </>
    );
}