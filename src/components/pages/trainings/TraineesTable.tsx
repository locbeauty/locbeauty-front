"use client";

import { useMemo, useState } from "react";
import { Eye, Filter, X, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-provider";
import { useQueryClient } from "@tanstack/react-query";
import { DeleteTrainee } from "@/services/trainees.service";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";
import { USER_ROLES } from "@/utils/constants";
import { toast } from "sonner";

import { Customer } from "@/utils/@types/customer";
import { Training } from "@/utils/@types/training";
import { Filial } from "@/utils/@types/filials";
import { Button } from "@/components/ui/button";
import { ResponsiveCard } from "@/components/shared/ResponsiveCard";
import { CustomerDetailsDialog } from "@/components/pages/customers/view/CustomerDetailsDialog";
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

interface TraineesTableProps {
  trainees: Customer[] | undefined;
  allTrainings: Training[];
  filials?: Filial[];
  onViewDetails?: (trainee: Customer) => void;
}

export function TraineesTable({
  trainees,
  allTrainings,
  filials,
  onViewDetails,
}: TraineesTableProps) {
  const [ selectedTrainee, setSelectedTrainee ] = useState<Customer | null>(null);
  const [ isDetailsOpen, setIsDetailsOpen ] = useState(false);
  const [ isDeleting, setIsDeleting ] = useState(false);
  const [ isDeleteConfirmationDialogOpen, setIsDeleteConfirmationDialogOpen ] =
    useState(false);
  const [ traineeToDelete, setTraineeToDelete ] = useState<Customer | null>(null);

  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Filters
  const [ filterName, setFilterName ] = useState("");
  const [ filterPending, setFilterPending ] = useState(false);
  const [ filterFilial, setFilterFilial ] = useState<string>("all");

  const handleOpenDetails = (trainee: Customer) => {
    setSelectedTrainee(trainee);
    setIsDetailsOpen(true);
    if (onViewDetails) {
      onViewDetails(trainee);
    }
  };

  const handleDeleteTrainee = async () => {
    if (!traineeToDelete) return;

    setIsDeleting(true);
    try {
      const response = await DeleteTrainee(traineeToDelete.customerId);

      if (response.statusCode === 200 || response.statusCode === 204) {
        toast.success("Aluno excluído com sucesso.");
        queryClient.invalidateQueries({ queryKey: [ "get-all-trainees" ] });
      } else {
        toast.error(response.message || "Erro ao excluir aluno.");
      }
    } catch (error) {
      toast.error("Erro ao excluir aluno.");
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmationDialogOpen(false);
      setTraineeToDelete(null);
    }
  };

  const clearFilters = () => {
    setFilterName("");
    setFilterPending(false);
    setFilterFilial("all");
  };

  const sortedTrainees = useMemo(() => {
    if (!trainees) return [];
    let result = [ ...trainees ];

    // Name Filter
    if (filterName) {
      result = result.filter((t) =>
        t.fullname.toLowerCase().includes(filterName.toLowerCase()),
      );
    }

    // Pending Payment Filter
    if (filterPending) {
      const traineesWithPending = new Set<string>();
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

          if (isPending && p.payerType === "TRAINEE") {
            if (p.customerId) traineesWithPending.add(p.customerId);
          }
        });
      });

      result = result.filter((t) => traineesWithPending.has(t.customerId));
    }

    // Filial Filter
    if (filterFilial && filterFilial !== "all") {
      const traineesInFilial = new Set<string>();
      allTrainings.forEach((training) => {
        if (training.sourceFilialId === filterFilial) {
          // Check all trainees in this training
          training.Trainees?.forEach((t) => traineesInFilial.add(t.customerId));
        }
      });
      result = result.filter((t) => traineesInFilial.has(t.customerId));
    }

    return result.sort((a, b) => a.fullname.localeCompare(b.fullname));
  }, [ trainees, filterName, filterPending, filterFilial, allTrainings ]);

  const handleToggleDialog = (open: boolean, data: unknown) => {
    if (open && data) {
      handleOpenDetails(data as Customer);
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
            <Label className="text-xs">Nome do Aluno</Label>
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
              id="pending-trainee"
              checked={ filterPending }
              onCheckedChange={ setFilterPending }
            />
            <Label
              htmlFor="pending-trainee"
              className="text-sm cursor-pointer whitespace-nowrap"
            >
              Com Pagamento Pendente
            </Label>
          </div>
          <div className="flex-1 flex justify-end">
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
              <th className="text-left p-3 font-medium">CPF / CNPJ</th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-center p-3 font-medium">Telefone</th>
              <th className="text-center p-3 font-medium">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {sortedTrainees.length === 0 && (
              <tr>
                <td className="text-center p-4" colSpan={ 6 }>
                  {trainees ? "Nenhum aluno encontrado." : "Carregando..."}
                </td>
              </tr>
            )}
            {sortedTrainees.map((trainee) => {
              return (
                <tr
                  key={ trainee.customerId }
                  className="border-t hover:bg-muted/50"
                >
                  <td className="p-3 text-sm font-medium">
                    {trainee.fullname}
                  </td>
                  <td className="p-3 text-sm">
                    {trainee.SourceFilial?.filialName}
                  </td>
                  <td className="p-3 text-sm">
                    {trainee.cpf || trainee.cnpj || "--"}
                  </td>
                  <td className="p-3 text-sm">{trainee.email || "--"}</td>
                  <td className="p-3 text-center text-sm">
                    {trainee.cellphone || "--"}
                  </td>
                  <td className="p-3 flex justify-center items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={ () => handleOpenDetails(trainee) }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {user?.role === USER_ROLES.MASTER && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={ () => {
                          setTraineeToDelete(trainee);
                          setIsDeleteConfirmationDialogOpen(true);
                        } }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
        {sortedTrainees.map((trainee) => {
          const traineeFilials = Array.from(
            new Set(
              allTrainings
                .filter((t) =>
                  t.Trainees?.some(
                    (tr) => tr.customerId === trainee.customerId,
                  ),
                )
                .map((t) => t.SourceFilial?.filialName)
                .filter(Boolean),
            ),
          ).join(", ");
          return (
            <ResponsiveCard
              key={ trainee.customerId }
              cardData={ {
                id: trainee.customerId,
                title: trainee.fullname,
                description: "Aluno",
                items: [
                  {
                    itemLabel: "Filiais: ",
                    itemInfo: traineeFilials || "N/A",
                  },
                  {
                    itemLabel: "Documento: ",
                    itemInfo: trainee.cpf || trainee.cnpj || "--",
                  },
                  { itemLabel: "Tel: ", itemInfo: trainee.cellphone || "--" },
                ],
              } }
              rawData={ trainee }
              handleToggleDialog={ handleToggleDialog }
            />
          );
        })}
        {sortedTrainees.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            {trainees ? "Nenhum aluno encontrado." : "Carregando..."}
          </p>
        )}
      </div>

      <CustomerDetailsDialog
        isCustomerDetailsModalOpen={ isDetailsOpen }
        handleToggleCustomerDetailsDialog={ (open) => setIsDetailsOpen(open) }
        handleToggleUpdateCustomerDialog={ () => {} }
        selectedCustomer={ selectedTrainee }
      />

      <DeleteConfirmationDialog
        isOpen={ isDeleteConfirmationDialogOpen }
        onOpenChange={ setIsDeleteConfirmationDialogOpen }
        onConfirm={ handleDeleteTrainee }
        title="Confirmar Exclusão"
        description="Tem certeza que deseja excluir o aluno"
        itemName={ traineeToDelete?.fullname }
        isDeleting={ isDeleting }
      />
    </>
  );
}
