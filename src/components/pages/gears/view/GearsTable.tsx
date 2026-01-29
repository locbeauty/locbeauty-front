"use client";
import { Check, Eye, Pencil, X, Trash2 } from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { ResponsiveCard } from "@/components/shared/ResponsiveCard";
import { UpdateGearDialog } from "../update/UpdateGearDialog";
import { Button } from "@/components/ui/button";
import { GearDetailsDialog } from "./GearDetailsDialog";
import { Gear } from "@/utils/@types/gears";
import { useAuth } from "@/contexts/auth-provider";
import { fetchWithToken } from "@/utils/fetchWithToken";
import { Can } from "@/components/auth/Can";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { useAccess } from "@/contexts/access-provider";
import { DeleteGear } from "@/services/gears.service";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";
import { USER_ROLES } from "@/utils/constants";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function GearsTable() {
  const [ gears, setGears ] = useState<Gear[] | null>(null);
  const [ isDeleting, setIsDeleting ] = useState(false);
  const [ isDeleteConfirmationDialogOpen, setIsDeleteConfirmationDialogOpen ] =
    useState(false);
  const [ gearToDelete, setGearToDelete ] = useState<Gear | null>(null);
  const [ refreshCounter, setRefreshCounter ] = useState(0);

  const [ isUpdateGearDialogOpen, setIsUpdateGearDialogOpen ] = useState(false);
  const [ isGearDetailsDialogOpen, setIsGearDetailsDialogOpen ] = useState(false);
  const [ selectedGear, setSelectedGear ] = useState<Gear | null>(null);

  const [ isVisible, setIsVisible ] = useState<boolean>(false);

  const { user } = useAuth();
  const { accesses } = useAccess();

  const accessibleFilialIds = useMemo(() => {
    // Admin/Master can see all
    if (user?.role === "ADMIN" || user?.role === "MASTER") {
      return undefined;
    }

    // Strict access control: derived only from EmployeeAccess permissions
    const permissions = accesses
      .filter((a) => a.module === SYSTEM_MODULES.GEARS && a.canView)
      .map((a) => a.filialId);

    const uniquePermissions = Array.from(new Set(permissions));

    // Fail-safe: if restricted user has no permissions, ensures NO_ACCESS
    return uniquePermissions.length > 0 ? uniquePermissions : [ "NO_ACCESS" ];
  }, [ user, accesses ]);

  const handleToggleUpdateGearDialog = (
    openStatus: boolean,
    gear: Gear | null,
  ) => {
    setIsUpdateGearDialogOpen(openStatus);
    setSelectedGear(gear);
  };

  const handleToggleGearDetailsDialog = (
    openStatus: boolean,
    gear: Gear | null,
  ) => {
    if (openStatus) {
      setSelectedGear(gear);
    }
    setIsGearDetailsDialogOpen(openStatus);
  };

  const handleDeleteGear = async () => {
    if (!gearToDelete) return;

    setIsDeleting(true);
    try {
      const response = await DeleteGear(gearToDelete.gearId);

      if (response.statusCode === 200 || response.statusCode === 204) {
        toast.success("Equipamento excluído com sucesso.");
        setRefreshCounter((prev) => prev + 1);
      } else {
        toast.error(response.message || "Erro ao excluir equipamento.");
      }
    } catch (error) {
      toast.error("Erro ao excluir equipamento.");
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmationDialogOpen(false);
      setGearToDelete(null);
    }
  };

  useEffect(() => {
    async function getGears() {
      const url = new URL(`${process.env.NEXT_PUBLIC_SERVER_URL}/gears`);

      // If user is restricted (accessibleFilialIds is defined), add filters
      if (accessibleFilialIds) {
        accessibleFilialIds.forEach((id) =>
          url.searchParams.append("filialIds", id),
        );
      }

      if (isVisible) {
        url.searchParams.append("isVisible", "false");
      }

      const response = await fetchWithToken(url, { credentials: "include" });

      const { data } = await response.json();
      setGears(data);
    }
    getGears();
  }, [ user, accessibleFilialIds, refreshCounter, isVisible ]);

  return (
    <>
      {(user?.role === USER_ROLES.MASTER ||
        user?.role === USER_ROLES.ADMIN) && (
        <div className="flex justify-end mb-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="view-deleted-gears"
              checked={ isVisible }
              onCheckedChange={ setIsVisible }
            />
            <Label htmlFor="view-deleted-gears">Ver Excluídos</Label>
          </div>
        </div>
      )}
      <div className="border rounded-lg max-h-[70vh] w-full overflow-x-auto hidden md:block">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium">Nome</th>
              <th className="text-center p-3 font-medium">Filial</th>
              <th className="text-center p-3 font-medium">
                Unidades operacionais
              </th>
              <th className="text-center p-3 font-medium">
                Unidades fora de serviço
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
            {gears ? (
              gears.map((gear) => (
                <tr
                  key={ gear.gearId }
                  className="border-t hover:bg-muted/50 items-stretch"
                >
                  <td className="p-3 text-sm">{gear.gearName}</td>
                  <td className="p-3 text-center text-sm">
                    {gear.SourceFilial.filialName}
                  </td>
                  <td className="p-3 text-center text-sm">
                    {gear.availableUnits}
                  </td>
                  <td className="p-3 text-center text-sm">
                    {gear.outOfServiceUnits}
                  </td>
                  <td className="p-3 justify-center flex items-center gap-4">
                    <Button
                      onClick={ () => handleToggleGearDetailsDialog(true, gear) }
                    >
                      <Eye />
                    </Button>

                    <Can module={ SYSTEM_MODULES.GEARS } action="canEdit">
                      <Button
                        variant="outline"
                        onClick={ () => handleToggleUpdateGearDialog(true, gear) }
                      >
                        <Pencil />
                      </Button>
                    </Can>

                    {user?.role === USER_ROLES.MASTER && (
                      <Button
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={ () => {
                          setGearToDelete(gear);
                          setIsDeleteConfirmationDialogOpen(true);
                        } }
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
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
      <div className="md:hidden flex flex-col gap-4">
        {gears &&
          gears.map((gear) => (
            <Fragment key={ gear.gearId }>
              <ResponsiveCard
                cardData={ {
                  id: gear.gearId,
                  title: gear.gearName,
                  transferableIndicator: false,
                  transferable: false,
                  items: [
                    {
                      itemLabel: "Filial:",
                      itemInfo: gear.SourceFilial.filialName,
                    },
                    {
                      itemLabel: "Unidades disponíveis: ",
                      itemInfo: gear.availableUnits,
                    },
                    {
                      itemLabel: "Unidades totais:",
                      itemInfo: gear.totalUnits,
                    },
                  ],
                } }
                rawData={ gear }
                handleToggleDialog={ handleToggleGearDetailsDialog }
              />
            </Fragment>
          ))}
      </div>
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

      <DeleteConfirmationDialog
        isOpen={ isDeleteConfirmationDialogOpen }
        onOpenChange={ setIsDeleteConfirmationDialogOpen }
        onConfirm={ handleDeleteGear }
        title="Confirmar Exclusão"
        description="Tem certeza que deseja excluir o equipamento"
        itemName={ gearToDelete?.gearName }
        isDeleting={ isDeleting }
      />
    </>
  );
}
