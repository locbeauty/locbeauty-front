import { useEffect, useMemo, useState } from "react";
import { Eye, Filter, X, Trash2, RefreshCcw, Pencil } from "lucide-react";
import {
  ListPagination,
  DEFAULT_PAGE_SIZE,
} from "@/components/shared/ListPagination";
import { useAuth } from "@/contexts/auth-provider";
import { useQueryClient } from "@tanstack/react-query";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";
import {
  DeleteVolunteer,
  UpdateVolunteer,
} from "@/services/volunteers.service";
import { USER_ROLES } from "@/utils/constants";
import { toast } from "sonner";

import { Volunteer } from "@/utils/@types/volunteer";
import { Training } from "@/utils/@types/training";
import { Filial } from "@/utils/@types/filials";
import { RestoreConfirmationDialog } from "@/components/shared/RestoreConfirmationDialog";
import { Button } from "@/components/ui/button";
import { ResponsiveCard } from "@/components/shared/ResponsiveCard";
import { VolunteerDetailsDialog } from "./VolunteerDetailsDialog";
import { UpdateVolunteerDialog } from "./UpdateVolunteerDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VolunteersTableProps {
  volunteers: Volunteer[] | undefined;
  allTrainings: Training[];
  filials?: Filial[];
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
}

export function VolunteersTable({
  volunteers,
  allTrainings,
  filials,
  isVisible,
  setIsVisible,
}: VolunteersTableProps) {
  const [ selectedVolunteer, setSelectedVolunteer ] = useState<Volunteer | null>(
    null,
  );
  const [ isDetailsOpen, setIsDetailsOpen ] = useState(false);
  const [ isEditOpen, setIsEditOpen ] = useState(false);
  const [ isDeleting, setIsDeleting ] = useState(false);
  const [ isDeleteConfirmationDialogOpen, setIsDeleteConfirmationDialogOpen ] =
    useState(false);
  const [ volunteerToDelete, setVolunteerToDelete ] = useState<Volunteer | null>(
    null,
  );
  const [ volunteerToRestore, setVolunteerToRestore ] =
    useState<Volunteer | null>(null);
  const [ isRestoring, setIsRestoring ] = useState(false);
  const [ isRestoreConfirmationDialogOpen, setIsRestoreConfirmationDialogOpen ] =
    useState(false);

  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Filters
  const [ filterName, setFilterName ] = useState("");
  const [ filterPending, setFilterPending ] = useState(false);
  const [ filterFilial, setFilterFilial ] = useState<string>("all");

  const handleOpenDetails = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setIsDetailsOpen(true);
  };

  const handleEditVolunteer = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setIsEditOpen(true);
  };

  const handleRestoreVolunteer = (volunteer: Volunteer) => {
    setVolunteerToRestore(volunteer);
    setIsRestoreConfirmationDialogOpen(true);
  };

  const confirmRestoreVolunteer = async () => {
    if (!volunteerToRestore) return;
    const targetId = volunteerToRestore.volunteerId;

    setIsRestoring(true);
    try {
      const response = await UpdateVolunteer({
        volunteerId: targetId,
        body: {
          isVisible: true,
        },
      });

      if (
        response.statusCode === 200 ||
        response.statusCode === 201 ||
        response.statusCode === 204
      ) {
        toast.success("Modelo restaurado com sucesso.");
        // Invalidate both visibility states to ensure UI updates correctly
        queryClient.invalidateQueries({
          queryKey: [ "get-all-volunteers", true ],
        });
        queryClient.invalidateQueries({
          queryKey: [ "get-all-volunteers", false ],
        });
      } else {
        toast.error(response.message || "Erro ao restaurar modelo.");
      }
    } catch (error) {
      toast.error("Erro ao restaurar modelo.");
    } finally {
      setIsRestoring(false);
      setIsRestoreConfirmationDialogOpen(false);
      if (volunteerToRestore?.volunteerId === targetId) {
        setVolunteerToRestore(null);
      }
    }
  };

  const handleDeleteVolunteer = async () => {
    if (!volunteerToDelete) return;

    setIsDeleting(true);
    try {
      const response = await DeleteVolunteer(volunteerToDelete.volunteerId);

      if (response.statusCode === 200 || response.statusCode === 204) {
        toast.success("Modelo excluído com sucesso.");
        queryClient.invalidateQueries({
          queryKey: [ "get-all-volunteers", true ],
        });
        queryClient.invalidateQueries({
          queryKey: [ "get-all-volunteers", false ],
        });
      } else {
        toast.error(response.message || "Erro ao excluir modelo.");
      }
    } catch (error) {
      toast.error("Erro ao excluir modelo.");
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmationDialogOpen(false);
      setVolunteerToDelete(null);
    }
  };

  const clearFilters = () => {
    setFilterName("");
    setFilterPending(false);
    setFilterFilial("all");
  };

  const sortedVolunteers = useMemo(() => {
    if (!volunteers) return [];
    let result = [ ...volunteers ];

    // Name Filter
    if (filterName) {
      result = result.filter((v) =>
        v.name.toLowerCase().includes(filterName.toLowerCase()),
      );
    }

    // Pending Payment Filter
    if (filterPending) {
      const volunteersWithPending = new Set<string>();
      allTrainings.forEach((training) => {
        training.TrainingPayment?.forEach((p) => {
          const isPending =
            p.paymentMode === "AVista"
              ? p.paymentStatus === "Pendente" ||
                p.firstPaymentStatus === "Pendente"
              : p.paymentStatus === "Pendente" ||
                p.paymentStatus === "Parcial" ||
                p.firstPaymentStatus === "Pendente" ||
                p.secondPaymentStatus === "Pendente";

          if (isPending && p.payerType === "VOLUNTEER") {
            if (p.volunteerId) volunteersWithPending.add(p.volunteerId);
            else if (training.volunteerId)
              volunteersWithPending.add(training.volunteerId);
          }
        });
      });
      result = result.filter((v) => volunteersWithPending.has(v.volunteerId));
    }

    // Filial Filter
    if (filterFilial && filterFilial !== "all") {
      const volunteersInFilial = new Set<string>();
      allTrainings.forEach((training) => {
        if (training.sourceFilialId === filterFilial) {
          // Check all volunteers in this training
          training.Volunteers?.forEach((v) =>
            volunteersInFilial.add(v.volunteerId),
          );
          // Fallback to legacy single volunteerId
          if (training.volunteerId)
            volunteersInFilial.add(training.volunteerId);
        }
      });
      result = result.filter((v) => volunteersInFilial.has(v.volunteerId));
    }

    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [ volunteers, filterName, filterPending, filterFilial, allTrainings ]);

  // Paginação local (a listagem de modelos vem completa do servidor).
  const [ pagination, setPagination ] = useState({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
  });

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [ filterName, filterPending, filterFilial, isVisible ]);

  const totalVolunteers = sortedVolunteers.length;
  const totalPagesCount = Math.max(
    1,
    Math.ceil(totalVolunteers / pagination.limit),
  );
  const currentPage = Math.min(pagination.page, totalPagesCount);
  const pagedVolunteers = sortedVolunteers.slice(
    (currentPage - 1) * pagination.limit,
    currentPage * pagination.limit,
  );

  const handleToggleDialog = (open: boolean, data: unknown) => {
    if (open && data) {
      handleOpenDetails(data as Volunteer);
    } else {
      setIsDetailsOpen(open);
    }
  };

  return (
    <>
      {/* Filters Toolbar */}
      <div className="bg-muted/30 p-4 rounded-lg border mb-4 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
          <Filter className="h-4 w-4" />
          Filtros
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="space-y-1 w-full sm:w-1/3">
            <Label className="text-xs">Nome do Modelo</Label>
            <Input
              placeholder="Buscar por nome..."
              value={ filterName }
              onChange={ (e) => setFilterName(e.target.value) }
              className="h-9 bg-background"
            />
          </div>
          <div className="space-y-1 w-full sm:w-[200px]">
            <Label className="text-xs">Filial</Label>
            <Select value={ filterFilial } onValueChange={ setFilterFilial }>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {filials?.map((filial) => (
                  <SelectItem key={ filial.filialId } value={ filial.filialId }>
                    {filial.filialName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2 border p-2 rounded-md h-9 bg-background px-3">
            <Switch
              id="pending-volunteer"
              checked={ filterPending }
              onCheckedChange={ setFilterPending }
            />
            <Label
              htmlFor="pending-volunteer"
              className="text-sm cursor-pointer whitespace-nowrap"
            >
              Com Pagamento Pendente
            </Label>
          </div>
          <div className="flex-1 flex flex-col sm:flex-row justify-end items-end gap-4">
            {(user?.role === USER_ROLES.MASTER ||
              user?.role === USER_ROLES.ADMIN) && (
              <div className="flex items-center space-x-2 border p-2 rounded-md h-9 bg-background px-3">
                <Switch
                  id="show-deleted-volunteers"
                  checked={ !isVisible }
                  onCheckedChange={ (checked) => setIsVisible(!checked) }
                />
                <Label
                  htmlFor="show-deleted-volunteers"
                  className="text-sm cursor-pointer whitespace-nowrap"
                >
                  Ver Excluídos
                </Label>
              </div>
            )}
            {(filterName || filterPending || filterFilial !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={ clearFilters }
                className="text-muted-foreground h-9"
              >
                <X className="h-3 w-3 mr-1" /> Limpar
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="border rounded-lg w-full overflow-x-auto hidden md:block">
        <table className="min-w-[800px] w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium">Nome</th>
              <th className="text-left p-3 font-medium">Filiais</th>
              <th className="text-left p-3 font-medium">CPF</th>
              <th className="text-center p-3 font-medium">Telefone</th>
              <th className="text-center p-3 font-medium">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {sortedVolunteers.length === 0 && (
              <tr>
                <td className="text-center p-4" colSpan={ 5 }>
                  {volunteers ? "Nenhum modelo encontrado." : "Carregando..."}
                </td>
              </tr>
            )}
            {pagedVolunteers.map((volunteer) => {
              return (
                <tr
                  key={ volunteer.volunteerId }
                  className="border-t hover:bg-muted/50"
                  onDoubleClick={ () => handleOpenDetails(volunteer) }
                >
                  <td className="p-3 text-sm font-medium">{volunteer.name}</td>
                  <td className="p-3 text-sm">
                    {volunteer.SourceFilial?.filialName}
                  </td>
                  <td className="p-3 text-sm">{volunteer.documentNumber}</td>
                  <td className="p-3 text-center text-sm">
                    {volunteer.cellphone}
                  </td>
                  <td className="p-3 flex justify-center items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={ () => handleOpenDetails(volunteer) }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {isVisible && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Editar"
                        onClick={ (e) => {
                          e.stopPropagation();
                          handleEditVolunteer(volunteer);
                        } }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {user?.role === USER_ROLES.MASTER && (
                      <>
                        {!isVisible ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Restaurar"
                            onClick={ (e) => {
                              e.stopPropagation();
                              handleRestoreVolunteer(volunteer);
                            } }
                            disabled={ isRestoring }
                          >
                            <RefreshCcw className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={ (e) => {
                              e.stopPropagation();
                              setVolunteerToDelete(volunteer);
                              setIsDeleteConfirmationDialogOpen(true);
                            } }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {pagedVolunteers.map((volunteer) => {
          const volunteerFilials = Array.from(
            new Set(
              allTrainings
                .filter((t) => t.volunteerId === volunteer.volunteerId)
                .map((t) => t.SourceFilial?.filialName)
                .filter(Boolean),
            ),
          ).join(", ");
          return (
            <ResponsiveCard
              key={ volunteer.volunteerId }
              cardData={ {
                id: volunteer.volunteerId,
                title: volunteer.name,
                description: "Paciente Modelo",
                items: [
                  {
                    itemLabel: "Filiais: ",
                    itemInfo: volunteerFilials || "N/A",
                  },
                  {
                    itemLabel: "CPF: ",
                    itemInfo: volunteer.documentNumber || "N/A",
                  },
                  { itemLabel: "Tel: ", itemInfo: volunteer.cellphone },
                ],
              } }
              rawData={ volunteer }
              handleToggleDialog={ handleToggleDialog }
            />
          );
        })}
        {sortedVolunteers.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            {volunteers ? "Nenhum modelo encontrado." : "Carregando..."}
          </p>
        )}
      </div>

      <ListPagination
        page={ currentPage }
        limit={ pagination.limit }
        totalItems={ totalVolunteers }
        onPageChange={ (page) => setPagination((prev) => ({ ...prev, page })) }
        onLimitChange={ (limit) => setPagination({ page: 1, limit }) }
        itemLabel="modelo(s)"
      />

      <VolunteerDetailsDialog
        isOpen={ isDetailsOpen }
        setIsOpen={ setIsDetailsOpen }
        volunteer={ selectedVolunteer }
        allTrainings={ allTrainings }
        onEdit={ () => {
          setIsDetailsOpen(false);
          setIsEditOpen(true);
        } }
      />

      <UpdateVolunteerDialog
        isOpen={ isEditOpen }
        setIsOpen={ setIsEditOpen }
        selectedVolunteer={ selectedVolunteer }
      />

      <DeleteConfirmationDialog
        isOpen={ isDeleteConfirmationDialogOpen }
        onOpenChange={ setIsDeleteConfirmationDialogOpen }
        onConfirm={ handleDeleteVolunteer }
        title="Confirmar Exclusão"
        description="Tem certeza que deseja excluir o modelo"
        itemName={ volunteerToDelete?.name }
        isDeleting={ isDeleting }
      />

      <RestoreConfirmationDialog
        isOpen={ isRestoreConfirmationDialogOpen }
        onOpenChange={ (open) => {
          setIsRestoreConfirmationDialogOpen(open);
          if (!open) setVolunteerToRestore(null);
        } }
        onConfirm={ confirmRestoreVolunteer }
        isRestoring={ isRestoring }
        title="Confirmar Restauração"
        description="Tem certeza que deseja restaurar o modelo"
        itemName={ volunteerToRestore?.name }
      />
    </>
  );
}
