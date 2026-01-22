"use client";

import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { ResponsiveCard } from "@/components/shared/ResponsiveCard";
import { FilialDetailsDialog } from "./FilialDetailsDialog";
import { UpdateFilialDialog } from "../update/UpdateFilialDialog";
import { Filial } from "@/utils/@types/filials";
import { fetchWithToken } from "@/utils/fetchWithToken";
import { Can } from "@/components/auth/Can";
import { SYSTEM_MODULES } from "@/utils/@types/access";

export function FilialsTable() {
  const [ isUpdateFilialDialogOpen, setIsUpdateFilialDialogOpen ] =
    useState(false);
  const [ selectedFilial, setSelectedFilial ] = useState<Filial | null>(null);

  const [ isFilialDetailsDialogOpen, setIsFilialDetailsDialogOpen ] =
    useState(false);
  const [ allFilials, setAllFilials ] = useState<Filial[] | null>(null);

  const handleToggleUpdateFilialDialog = (
    openStatus: boolean,
    filial: Filial | null,
  ) => {
    if (openStatus) {
      setSelectedFilial(filial);
    }

    setIsUpdateFilialDialogOpen(openStatus);
  };

  const handleToggleFilialDetailsDialog = (
    openStatus: boolean,
    filial: Filial | null,
  ) => {
    setSelectedFilial(filial);
    setIsFilialDetailsDialogOpen(openStatus);
  };

  useEffect(() => {
    async function handleGetAllFilials() {
      const response = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/filials`,
        {
          credentials: "include",
          next: {
            tags: [ "get-all-filials" ],
          },
        },
      );
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
              <th className="text-left p-3 font-medium text-sm">Filial</th>
              <th className="text-left p-3 font-medium text-sm">CNPJ</th>
              <th className="text-left p-3 font-medium text-sm">Gerente</th>
              <th className="text-center p-3 font-medium text-sm">Endereço</th>
              <th className="text-center p-3 font-medium text-sm">Telefone</th>
              <th className="text-center p-3 font-medium text-sm">Email</th>
              <th className="text-left p-3 font-medium text-sm">Ações</th>
            </tr>
          </thead>
          <tbody>
            {allFilials?.length === 0 && (
              <tr>
                <td className="text-center p-4" colSpan={ 8 }>
                  Nada a mostrar por aqui.
                </td>
              </tr>
            )}
            {allFilials ? (
              allFilials.map((filial) => (
                <tr
                  key={ filial.filialId }
                  className="border-t hover:bg-muted/50"
                >
                  <td className="p-3 text-sm truncate max-w-[200px]">
                    {filial.filialName}
                  </td>
                  <td className="p-3 text-sm">{filial.CNPJ}</td>
                  <td className="p-3 text-sm">
                    {filial.managerEmployee?.fullname || "-"}
                  </td>
                  <td className="p-3 text-center text-sm truncate max-w-[200px]">
                    {filial.Address?.street}, {filial.Address?.buildingNumber} -{" "}
                    {filial.Address?.city}/{filial.Address?.state}{" "}
                  </td>
                  <td className="p-3 text-center text-sm">
                    {filial.cellphone}
                  </td>
                  <td className="p-3 text-center text-sm">{filial.email}</td>
                  <td className="">
                    <div className="flex gap-2 items-center">
                      <Can module={ SYSTEM_MODULES.FILIALS } action="canView">
                        <Button
                          onClick={ () =>
                            handleToggleFilialDetailsDialog(true, filial)
                          }
                        >
                          <Eye />
                        </Button>
                      </Can>
                      <Can module={ SYSTEM_MODULES.FILIALS } action="canEdit">
                        <Button
                          variant="outline"
                          onClick={ () =>
                            handleToggleUpdateFilialDialog(true, filial)
                          }
                        >
                          <Pencil />
                        </Button>
                      </Can>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
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

      {allFilials &&
        allFilials.map((filial) => (
          <Fragment key={ filial.filialId }>
            <Can module={ SYSTEM_MODULES.FILIALS } action="canView">
              <ResponsiveCard
                cardData={ {
                  id: filial.filialId,
                  title: filial.Address?.state || "",
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
            </Can>
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
