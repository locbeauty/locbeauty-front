"use client";
import { Check, Eye, Pencil, X, Trash2, RefreshCcw } from "lucide-react";
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
import { DeleteGear, UpdateGear } from "@/services/gears.service";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";
import { RestoreConfirmationDialog } from "@/components/shared/RestoreConfirmationDialog";
import { USER_ROLES } from "@/utils/constants";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { queryClient } from "@/app/(main)/layout";

interface GearsTableProps {
  searchName?: string;
  filialId?: string;
}

export function GearsTable({ searchName, filialId }: GearsTableProps) {
  const [ gears, setGears ] = useState<Gear[] | null>(null);
  const [ isDeleting, setIsDeleting ] = useState(false);
  const [ isRestoring, setIsRestoring ] = useState(false);
  const [ isDeleteConfirmationDialogOpen, setIsDeleteConfirmationDialogOpen ] =
    useState(false);
  const [ gearToDelete, setGearToDelete ] = useState<Gear | null>(null);
  const [ gearToRestore, setGearToRestore ] = useState<Gear | null>(null);
  const [ refreshCounter, setRefreshCounter ] = useState(0);

  const [ isUpdateGearDialogOpen, setIsUpdateGearDialogOpen ] = useState(false);
  const [ isGearDetailsDialogOpen, setIsGearDetailsDialogOpen ] = useState(false);
  const [ selectedGear, setSelectedGear ] = useState<Gear | null>(null);

  const [ isVisible, setIsVisible ] = useState<boolean>(false);
  const [ isRestoreConfirmationDialogOpen, setIsRestoreConfirmationDialogOpen ] =
    useState(false);

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
        setGears(
          (prev) =>
            prev?.filter((g) => g.gearId !== gearToDelete.gearId) ?? null,
        );
        // setRefreshCounter((prev) => prev + 1); // Removed to prevent unnecessary re-fetch and flickering
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

  const handleRestoreGear = (gear: Gear) => {
    setGearToRestore(gear);
    setIsRestoreConfirmationDialogOpen(true);
  };

  const confirmRestoreGear = async () => {
    if (!gearToRestore) return;
    const targetId = gearToRestore.gearId;
    console.log("Starting restore for gear:", targetId);

    setIsRestoring(true);
    try {
      const response = await UpdateGear({
        gearId: targetId,
        data: { isVisible: true },
      });

      console.log("Restore response status:", response.statusCode);

      if (response.statusCode === 200 || response.statusCode === 204) {
        toast.success("Equipamento restaurado com sucesso.");
        setGears((prev) => {
          if (!prev) {
            console.log("Previous gears state is null");
            return null;
          }
          const filtered = prev.filter(
            (g) => String(g.gearId) !== String(targetId),
          );
          console.log("Gears after filter:", filtered.length);
          return filtered;
        });
        // We explicitly close dialog here to ensure state consistency
        setIsRestoreConfirmationDialogOpen(false);
      } else {
        console.error("Restore failed with status:", response.statusCode);
        toast.error(response.message || "Erro ao restaurar equipamento.");
      }
    } catch (error) {
      console.error("Restore error:", error);
      toast.error("Erro ao restaurar equipamento.");
    } finally {
      setIsRestoring(false);
      setIsRestoreConfirmationDialogOpen(false);
      if (gearToRestore?.gearId === targetId) {
        setGearToRestore(null);
      }
    }
  };

  useEffect(() => {
    let isActive = true;

    async function getGears() {
      const url = new URL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/gears`);

      // Logic to select filialIds in query
      if (filialId && filialId !== "ALL") {
        url.searchParams.append("filialIds", filialId);
      } else if (accessibleFilialIds) {
        accessibleFilialIds.forEach((id) =>
          url.searchParams.append("filialIds", id),
        );
      }

      if (searchName) {
        url.searchParams.append("name", searchName);
      }

      if (isVisible) {
        url.searchParams.append("isVisible", "false");
      }

      // console.log("Fetching gears from:", url.toString());

      try {
        const response = await fetchWithToken(url, {
          credentials: "include",
          cache: "no-store",
        });

        if (isActive) {
          const { data } = await response.json();
          setGears(data);
        }
      } catch (error) {
        console.error("Failed to fetch gears:", error);
      }
    }
    getGears();

    return () => {
      isActive = false;
    };
  }, [
    user,
    accessibleFilialIds,
    refreshCounter,
    isVisible,
    searchName,
    filialId,
  ]);

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

                    {user?.role === USER_ROLES.MASTER &&
                      (isVisible ? (
                        <Button
                          variant="ghost"
                          className="text-green-600 hover:bg-green-50"
                          onClick={ () => handleRestoreGear(gear) }
                          disabled={ isRestoring }
                        >
                          <RefreshCcw className="w-4 h-4" />
                        </Button>
                      ) : (
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
                      ))}
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

      <RestoreConfirmationDialog
        isOpen={ isRestoreConfirmationDialogOpen }
        onOpenChange={ setIsRestoreConfirmationDialogOpen }
        onConfirm={ confirmRestoreGear }
        title="Confirmar Restauração"
        description="Tem certeza que deseja restaurar o equipamento"
        itemName={ gearToRestore?.gearName }
        itemId={ gearToRestore?.gearId }
        setGears={ setGears }
        isRestoring={ isRestoring }
      />
    </>
  );
}
