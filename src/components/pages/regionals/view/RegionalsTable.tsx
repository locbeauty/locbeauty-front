"use client";

import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";
import { Fragment, useState } from "react";
import { regionals } from "@/utils/mocks/regionals";
import { ResponsiveCard } from "@/components/shared/ResponsiveCard";
import { RegionalDetailsDialog } from "./RegionalDetailsDialog";
import { UpdateRegionalDialog } from "../update/UpdateRegionalDialog";
import { Regional } from "@/utils/@types/regionals";

export function RegionalsTable() {

    const [ isUpdateRegionalDialogOpen, setIsUpdateRegionalDialogOpen ] = useState(false);
    const [ selectedRegional, setSelectedRegional ] = useState<Regional | null>(null);

    const [ isRegionalDetailsDialogOpen, setIsRegionalDetailsDialogOpen ] = useState(false);

    const handleToggleUpdateRegionalDialog = (openStatus: boolean, regional: Regional | null) => {
        if(openStatus) {
            setSelectedRegional(regional);
        }

        setIsUpdateRegionalDialogOpen(openStatus);
    };

    const handleToggleRegionalDetailsDialog = (openStatus: boolean, regional: Regional | null) => {
        setSelectedRegional(regional);
        setIsRegionalDetailsDialogOpen(openStatus);
    };
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
                            regionals.map(regional => (
                                <tr key={ regional.regionalId } className="border-t hover:bg-muted/50">
                                    <td className="p-3">{regional.CNPJ}</td>
                                    <td className="p-3">{regional.description}</td>
                                    <td className="p-3">{regional.manager.fullname}</td>
                                    <td className="p-3">{ regional.street }, {regional.houseNumber} - {regional.city}/{regional.state.UF} </td>
                                    <td className="p-3">{regional.cellphone}</td>
                                    <td className="p-3">{regional.email}</td>
                                    <td className="p-3 flex justify-center items-center gap-4">
                                        <Button onClick={ () => handleToggleRegionalDetailsDialog(true, regional) }>
                                            <Eye />
                                        </Button>
                                        <Button variant="outline" onClick={ () => handleToggleUpdateRegionalDialog(true, regional) }>
                                            <Pencil />
                                        </Button>
                                    </td>
                                </tr>

                            ))
                        }
                    </tbody>
                </table>
            </div>

            {regionals.map((regional) => (
                <Fragment key={ regional.regionalId }>
                    <ResponsiveCard
                        cardData={ {
                            id: regional.regionalId,
                            title: regional.state.title,
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
                        handleToggleDialog={ handleToggleRegionalDetailsDialog }
                    />
                </Fragment>
            ))}

            <RegionalDetailsDialog
                selectedRegional={ selectedRegional }
                handleToggleUpdateRegionalDialog={ handleToggleUpdateRegionalDialog }
                handleToggleRegionalDetailsDialog={ handleToggleRegionalDetailsDialog }
                isRegionalDetailsModalOpen={ isRegionalDetailsDialogOpen } />

            <UpdateRegionalDialog
                isUpdateRegionalDialogOpen={ isUpdateRegionalDialogOpen }
                selectedRegional={ selectedRegional! }
                setSelectedRegional={ setSelectedRegional }
                handleToggleUpdateRegionalDialog={ handleToggleUpdateRegionalDialog }
            />
        </>
    );
}