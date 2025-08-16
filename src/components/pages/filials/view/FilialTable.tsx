"use client";

import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { ResponsiveCard } from "@/components/shared/ResponsiveCard";
import { FilialDetailsDialog } from "./FilialDetailsDialog";
import { UpdateFilialDialog } from "../update/UpdateFilialDialog";
import { Filial } from "@/utils/@types/filials";

export function FilialsTable() {
    const [ isUpdateFilialDialogOpen, setIsUpdateFilialDialogOpen ] =
    useState(false);
    const [ selectedFilial, setSelectedFilial ] = useState<Filial | null>(null);

    const [ isFilialDetailsDialogOpen, setIsFilialDetailsDialogOpen ] =
    useState(false);
    const [ allFilials, setAllFilials ] = useState<Filial[]>([]);

    const handleToggleUpdateFilialDialog = (
        openStatus: boolean,
        filial: Filial | null
    ) => {
        if (openStatus) {
            setSelectedFilial(filial);
        }

        setIsUpdateFilialDialogOpen(openStatus);
    };

    const handleToggleFilialDetailsDialog = (
        openStatus: boolean,
        filial: Filial | null
    ) => {
        setSelectedFilial(filial);
        setIsFilialDetailsDialogOpen(openStatus);
    };

    useEffect(() => {
        async function handleGetAllFilials() {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/filials`, {
                credentials: "include",
                next: {
                    tags: [ "get-all-filials" ]
                }
            });
            const { data }: { data: Filial[] } = await response.json();
            setAllFilials(data);

            return data;
        }
        handleGetAllFilials();
    }, []);
    return (
        <>
            <div className="border rounded-lg max-h-[70vh] lg:w-full w-[89vw] overflow-x-auto hidden md:block">
                <table className="w-full">
                    <thead className="bg-muted">
                        <tr>
                            <th className="text-left p-3 font-medium text-sm">CNPJ</th>
                            <th className="text-left p-3 font-medium text-sm">Gerente</th>
                            <th className="text-left p-3 font-medium text-sm">Endereço</th>
                            <th className="text-center p-3 font-medium text-sm">Telefone</th>
                            <th className="text-center p-3 font-medium text-sm">Email</th>
                            <th className="text-left p-3 font-medium text-sm">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allFilials.map((filial) => (
                            <tr key={ filial.filialId } className="border-t hover:bg-muted/50">
                                <td className="p-3 text-sm text-nowrap">{filial.CNPJ}</td>
                                <td className="p-3 text-sm text-nowrap">{filial.managerEmployee.fullname}</td>
                                <td className="p-3 text-sm">
                                    {filial.address.street.streetName}, {filial.address.buildingNumber} -{" "}
                                    {filial.address.city.cityName}/{filial.address.state.UF}{" "}
                                </td>
                                <td className="p-3 text-sm text-nowrap text-center">{filial.cellphone}</td>
                                <td className="p-3 text-sm text-center">{filial.email}</td>
                                <td className="">
                                    <Button
                                        onClick={ () => handleToggleFilialDetailsDialog(true, filial) }
                                    >
                                        <Eye />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={ () => handleToggleUpdateFilialDialog(true, filial) }
                                    >
                                        <Pencil />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {allFilials.map((filial) => (
                <Fragment key={ filial.filialId }>
                    <ResponsiveCard
                        cardData={ {
                            id: filial.filialId,
                            title: filial.address.state.stateName,
                            items: [
                                { itemLabel: "Email: ", itemInfo: filial.email },
                                {
                                    itemLabel: "Telefone: ",
                                    itemInfo: filial.cellphone,
                                },
                            ],
                        } }
                        rawData={ filial }
                        handleToggleDialog={ handleToggleFilialDetailsDialog }
                    />
                </Fragment>
            ))}

            <FilialDetailsDialog
                selectedFilial={ selectedFilial }
                handleToggleUpdateFilialDialog={ handleToggleUpdateFilialDialog }
                handleToggleFilialDetailsDialog={ handleToggleFilialDetailsDialog }
                isFilialDetailsModalOpen={ isFilialDetailsDialogOpen }
            />

            <UpdateFilialDialog
                isUpdateFilialDialogOpen={ isUpdateFilialDialogOpen }
                selectedFilial={ selectedFilial! }
                setSelectedFilial={ setSelectedFilial }
                handleToggleUpdateFilialDialog={ handleToggleUpdateFilialDialog }
            />
        </>
    );
}
