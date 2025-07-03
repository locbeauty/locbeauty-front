"use client";

import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { regionals } from "@/utils/mocks/regionals";
import { ResponsiveCard } from "@/components/shared/ResponsiveCard";
import { RegionalDetailsDialog } from "./RegionalDetailsDialog";
import { UpdateRegionalDialog } from "../update/UpdateRegionalDialog";
import { Filial } from "@/utils/@types/regionals";

export function RegionalsTable() {

    const [ isUpdateRegionalDialogOpen, setIsUpdateRegionalDialogOpen ] = useState(false);
    const [ selectedRegional, setSelectedRegional ] = useState<Filial | null>(null);

    const [ isRegionalDetailsDialogOpen, setIsRegionalDetailsDialogOpen ] = useState(false);
    const [ allFilials, setAllFilials ] = useState<Filial[]>([]);

    const handleToggleUpdateFilialDialog = (openStatus: boolean, regional: Filial | null) => {
        if(openStatus) {
            setSelectedRegional(regional);
        }

        setIsUpdateRegionalDialogOpen(openStatus);
    };

    const handleToggleFilialDetailsDialog = (openStatus: boolean, regional: Filial | null) => {
        setSelectedRegional(regional);
        setIsRegionalDetailsDialogOpen(openStatus);
    };

    useEffect(() => {
        async function handleGetAllFilials() {
            const response = await fetch("http://localhost:3333/api/filials", { credentials: "include" });
            const { data }: {data: Filial[]} = await response.json();
            console.log("DATA: ", data);
            setAllFilials(data);
        }
        handleGetAllFilials();
    }, []);
    return (
        <>
            <div className="border rounded-lg max-h-[70vh] lg:w-full w-[89vw] overflow-x-auto hidden md:block">
                <table className="w-full">
                    <thead className="bg-muted">
                        <tr>
                            <th className="text-left p-3 font-medium">CNPJ</th>
                            <th className="text-left p-3 font-medium">Descrição</th>
                            <th className="text-left p-3 font-medium">Gerente</th>
                            <th className="text-left p-3 font-medium">Endereço</th>
                            <th className="text-left p-3 font-medium">Telefone</th>
                            <th className="text-left p-3 font-medium">Email</th>
                            <th className="text-left p-3 font-medium">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            allFilials.map(filial => (
                                <tr key={ filial.filialId } className="border-t hover:bg-muted/50">
                                    <td className="p-3">{filial.CNPJ}</td>
                                    <td className="p-3">{filial.description}</td>
                                    <td className="p-3">{filial.managerEmployeeId}</td>
                                    <td className="p-3">{ filial.address.streetName }, {filial.address.buildingNumber} - {filial.address.cityName}/{filial.address.state.UF} </td>
                                    <td className="p-3">{filial.cellphone}</td>
                                    <td className="p-3">{filial.email}</td>
                                    <td className="p-3 flex justify-center items-center gap-4">
                                        <Button onClick={ () => handleToggleUpdateFilialDialog(true, filial) }>
                                            <Eye />
                                        </Button>
                                        <Button variant="outline" onClick={ () => handleToggleUpdateFilialDialog(true, filial) }>
                                            <Pencil />
                                        </Button>
                                    </td>
                                </tr>

                            ))
                        }
                    </tbody>
                </table>
            </div>

            {allFilials.map((regional) => (
                <Fragment key={ regional.regionalId }>
                    <ResponsiveCard
                        cardData={ {
                            id: regional.regionalId,
                            title: regional.address.state.stateName,
                            description: regional.description,
                            items: [
                                { itemLabel: "Email: ", itemInfo: regional.email },
                                {
                                    itemLabel: "Telefone: ",
                                    itemInfo: regional.cellphone,
                                },
                            ],
                        } }
                        rawData={ regional }
                        handleToggleDialog={ handleToggleFilialDetailsDialog }
                    />
                </Fragment>
            ))}

            <RegionalDetailsDialog
                selectedRegional={ selectedRegional }
                handleToggleUpdateRegionalDialog={ handleToggleUpdateFilialDialog }
                handleToggleFilialDetailsDialog={ handleToggleFilialDetailsDialog }
                isRegionalDetailsModalOpen={ isRegionalDetailsDialogOpen } />

            <UpdateRegionalDialog
                isUpdateRegionalDialogOpen={ isUpdateRegionalDialogOpen }
                selectedRegional={ selectedRegional! }
                setSelectedRegional={ setSelectedRegional }
                handleToggleUpdateRegionalDialog={ handleToggleUpdateFilialDialog }
            />
        </>
    );
}