"use client";

import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, RefreshCcw } from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { ResponsiveCard } from "@/components/shared/ResponsiveCard";
import { FilialDetailsDialog } from "./FilialDetailsDialog";
import { UpdateFilialDialog } from "../update/UpdateFilialDialog";
import { Filial } from "@/utils/@types/filials";
import { fetchWithToken } from "@/utils/fetchWithToken";
import { Can } from "@/components/auth/Can";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { useAuth } from "@/contexts/auth-provider";
import { DeleteFilial, UpdateFilial } from "@/services/filials.service";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";
import { RestoreConfirmationDialog } from "@/components/shared/RestoreConfirmationDialog";
import { USER_ROLES } from "@/utils/constants";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ListPagination,
  DEFAULT_PAGE_SIZE,
} from "@/components/shared/ListPagination";

interface FilialsTableProps {
  /** Busca livre por nome, cidade/estado, gerente ou e-mail. */
  searchTerm?: string;
}

// Faixa dos sinais diacríticos combinantes, em ASCII para evitar ambiguidade.
const DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

/** Normaliza para busca: sem acento e sem diferenciar maiúsculas. */
function normalize(value?: string | null) {
  return (value ?? "").normalize("NFD").replace(DIACRITICS, "").toLowerCase();
}

export function FilialsTable({ searchTerm }: FilialsTableProps) {
  const [ isUpdateFilialDialogOpen, setIsUpdateFilialDialogOpen ] =
    useState(false);
  const [ selectedFilial, setSelectedFilial ] = useState<Filial | null>(null);

  const [ isFilialDetailsDialogOpen, setIsFilialDetailsDialogOpen ] =
    useState(false);
  const [ allFilials, setAllFilials ] = useState<Filial[] | null>(null);
  const [ isDeleting, setIsDeleting ] = useState(false);
  const [ isDeleteConfirmationDialogOpen, setIsDeleteConfirmationDialogOpen ] =
    useState(false);
  const [ filialToDelete, setFilialToDelete ] = useState<Filial | null>(null);
  const [ filialToRestore, setFilialToRestore ] = useState<Filial | null>(null);
  const [ refreshCounter, setRefreshCounter ] = useState(0);
  const [ isRestoring, setIsRestoring ] = useState(false);
  const [ isRestoreConfirmationDialogOpen, setIsRestoreConfirmationDialogOpen ] =
    useState(false);

  const [ isVisible, setIsVisible ] = useState<boolean>(false);

  // Paginação local (a listagem de filiais vem completa do servidor).
  const [ pagination, setPagination ] = useState({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
  });

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [ isVisible, searchTerm ]);

  const { user } = useAuth();

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

  const handleDeleteFilial = async () => {
    if (!filialToDelete) return;

    setIsDeleting(true);
    try {
      const response = await DeleteFilial(filialToDelete.filialId);

      if (response.statusCode === 200 || response.statusCode === 204) {
        toast.success("Filial excluída com sucesso.");
        setAllFilials(
          (prev) =>
            prev?.filter((f) => f.filialId !== filialToDelete.filialId) ?? null,
        );
      } else {
        toast.error(response.message || "Erro ao excluir filial.");
      }
    } catch (error) {
      toast.error("Erro ao excluir filial.");
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmationDialogOpen(false);
      setFilialToDelete(null);
    }
  };

  const handleRestoreFilial = (filial: Filial) => {
    setFilialToRestore(filial);
    setIsRestoreConfirmationDialogOpen(true);
  };

  const confirmRestoreFilial = async () => {
    if (!filialToRestore) return;
    const targetId = filialToRestore.filialId;
    console.log("Starting restore for filial:", targetId);

    setIsRestoring(true);
    try {
      const response = await UpdateFilial({
        filialId: targetId,
        data: { isVisible: true },
      });

      console.log("Restore response status:", response.statusCode);

      if (
        response.statusCode === 200 ||
        response.statusCode === 201 ||
        response.statusCode === 204
      ) {
        toast.success("Filial restaurada com sucesso.");
        setAllFilials((prev) => {
          if (!prev) {
            console.log("Previous filials state is null");
            return null;
          }
          const filtered = prev.filter(
            (f) => String(f.filialId) !== String(targetId),
          );
          console.log("Filials before filter:", prev.length);
          console.log("Filials after filter:", filtered.length);
          return filtered;
        });
      } else {
        console.error("Restore failed with status:", response.statusCode);
        toast.error(response.message || "Erro ao restaurar filial.");
      }
    } catch (error) {
      console.error("Restore error:", error);
      toast.error("Erro ao restaurar filial.");
    } finally {
      setIsRestoring(false);
      setIsRestoreConfirmationDialogOpen(false);
      if (filialToRestore?.filialId === targetId) {
        setFilialToRestore(null);
      }
    }
  };

  useEffect(() => {
    async function handleGetAllFilials() {
      const queryParams = new URLSearchParams();

      if (isVisible) {
        queryParams.append("isVisible", "false");
      }

      const response = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/filials?${queryParams.toString()}`,
        {
          credentials: "include",
          cache: "no-store",
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
  }, [ refreshCounter, isVisible ]);

  // Busca livre (sem acento/caixa) por nome, cidade, estado, gerente ou e-mail.
  const filteredFilials = useMemo(() => {
    const term = normalize(searchTerm).trim();
    if (!term || !allFilials) return allFilials ?? [];

    return allFilials.filter((filial) =>
      [
        filial.filialName,
        filial.city,
        filial.state,
        filial.managerEmployee?.fullname,
        filial.email,
      ].some((field) => normalize(field).includes(term)),
    );
  }, [ allFilials, searchTerm ]);

  const totalFilials = filteredFilials.length;
  const totalPagesCount = Math.max(
    1,
    Math.ceil(totalFilials / pagination.limit),
  );
  const currentPage = Math.min(pagination.page, totalPagesCount);
  const pagedFilials = filteredFilials.slice(
    (currentPage - 1) * pagination.limit,
    currentPage * pagination.limit,
  );

  return (
    <>
      {(user?.role === USER_ROLES.MASTER ||
        user?.role === USER_ROLES.ADMIN) && (
        <div className= "flex jus tify-end mb-4">
          <div className="flex  items-center  space-x-2">
            <Switch
              id="view-deleted-filials"
              checked={ isVisible }
              onCheckedChange={ setIsVisible }
            />
            <Label htmlFor="view-deleted-filials">Ver Excluídos</Label>
          </div>
        </div>
      )}
      <div className="border rounded-lg max-h-[70vh] lg:w-full w-[89vw] overflow-x-auto hidden md:block">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium text-sm">Filial</th>
              <th className="text-center p-3 font-medium text-sm">Vínculos</th>
              <th className="p-3 font-medium text-sm text-center">Gerente</th>
              <th className="text-center p-3 font-medium text-sm">Telefone</th>
              <th className="text-center p-3 font-medium text-sm">Email</th>
              <th className="text-left p-3 font-medium text-sm">Ações</th>
            </tr>
          </thead>
          <tbody>
            {allFilials && filteredFilials.length === 0 && (
              <tr>
                <td className="text-center p-4" colSpan={ 7 }>
                  {searchTerm
                    ? "Nenhuma filial encontrada para esta busca."
                    : "Nada a mostrar por aqui."}
                </td>
              </tr>
            )}
            {allFilials ? (
              pagedFilials.map((filial) => (
                <tr
                  key={ filial.filialId }
                  className="border-t hover:bg-muted/50"
                >
                  <td className="p-3 text-sm truncate max-w-[200px]">
                    {filial.filialName}
                  </td>
                  <td className="p-3 text-sm text-center">
                    {filial.LinkedFilials?.length ? (
                      <div className="flex flex-wrap justify-center gap-1">
                        {filial.LinkedFilials.map((linked) => (
                          <Badge
                            key={ linked.filialId }
                            variant="outline"
                            className="bg-purple-50 text-purple-700 border-purple-200"
                            title="Filial vinculada: os dados são compartilhados entre as duas filiais"
                          >
                            {linked.filialName}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )}
                  </td>
                  <td className="p-3 text-sm text-center">
                    {filial.managerEmployee?.fullname || "--"}
                  </td>
                  <td className="p-3 text-center text-sm">
                    {filial.cellphone || "--"}
                  </td>
                  <td className="p-3 text-center text-sm">
                    {filial.email || "--"}
                  </td>
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

                      {user?.role === USER_ROLES.MASTER &&
                        (isVisible ?  (
                          <Button
                            variant="ghost"
                            className="text-green-600 hover:bg-green-50"
                            onClick={ () => handleRestoreFilial(filial) }
                            disabled={ isRestoring }
                          >
                            <RefreshCcw className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={ () => {
                              setFilialToDelete(filial);
                              setIsDeleteConfirmationDialogOpen(true);
                            } }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        ))}
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

      <div className="md:hidden flex flex-col gap-4">
        {allFilials &&
          pagedFilials.map((filial) => (
            <Fragment key={ filial.filialId }>
              <Can module={ SYSTEM_MODULES.FILIALS } action="canView">
                <ResponsiveCard
                  cardData={ {
                    id: filial.filialId,
                    title: filial.filialName,
                    items: [
                      { itemLabel: "Email: ", itemInfo: filial.email },
                      {
                        itemLabel: "Telefone: ",
                        itemInfo:  filial.cellphone,
                      },
                      {
                        itemLabel: "Vínculos: ",
                        itemInfo:
                          filial.LinkedFilials?.map(
                            (linked) => linked.filialName,
                          ).join(", ") || "--",
                      },
                    ],
                  } }
                  rawData={ filial }
                  handleToggleDialog={ handleToggleFilialDetailsDialog }
                />
              </Can>
            </Fragment>
          ))}
      </div>

      <ListPagination
        page={ currentPage }
        limit={ pagination.limit }
        totalItems={ totalFilials }
        onPageChange={ (page) => setPagination((prev) => ({ ...prev, page })) }
        onLimitChange={ (limit) => setPagination({ page: 1, limit }) }
        itemLabel="filial(is)"
      />

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
        onSuccess={ () => setRefreshCounter((prev) => prev + 1) }
      />

      <DeleteConfirmationDialog
        isOpen={ isDeleteConfirmationDialogOpen }
        onOpenChange={ setIsDeleteConfirmationDialogOpen }
        onConfirm={ handleDeleteFilial }
        title="Confirmar Exclusão"
        description="Tem certeza que deseja excluir a filial"
        itemName={ filialToDelete?.filialName }
        isDeleting={ isDeleting }
      />

      <RestoreConfirmationDialog
        isOpen={ isRestoreConfirmationDialogOpen }
        onOpenChange={ setIsRestoreConfirmationDialogOpen }
        onConfirm={ confirmRestoreFilial }
        title="Confirmar Restauração"
        description="Tem certeza que deseja restaurar a filial"
        itemName={ filialToRestore?.filialName }
        isRestoring={ isRestoring }
      />
    </>
  );
}
