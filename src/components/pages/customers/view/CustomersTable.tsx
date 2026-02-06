"use client";
import { CustomerStatusBadge } from "@/components/shared/CustomerStatusBadge";
import { FilialFilter } from "./FilialFilter";
import { ResponsiveCard } from "@/components/shared/ResponsiveCard";
import {
  Eye,
  Pencil,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Trash2,
  RefreshCcw,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Fragment, useEffect, useState } from "react";
import { UpdateCustomerDialog } from "../update/UpdateCustomerDialog";
import { CustomerDetailsDialog } from "./CustomerDetailsDialog";
import { Button } from "@/components/ui/button";
import { Customer } from "@/utils/@types/customer";
import { format } from "date-fns";
import { fetchWithToken } from "@/utils/fetchWithToken";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  GetAllCustomers,
  GetAllCustomersFilters,
  UpdateCustomer,
  DeleteCustomer,
  HardDeleteCustomer,
} from "@/services/customers.service";
import { ApiResponse } from "@/lib/api";
import { Can } from "@/components/auth/Can";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { Input } from "@/components/ui/input";
import DocumentInput from "@/components/shared/DocumentInput";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/auth-provider";
import { USER_ROLES } from "@/utils/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RestoreConfirmationDialog } from "@/components/shared/RestoreConfirmationDialog";
import { toast } from "sonner";

export function CustomersTable() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [ isDeleting, setIsDeleting ] = useState(false);
  const [ isDeleteConfirmationDialogOpen, setIsDeleteConfirmationDialogOpen ] =
    useState(false);
  const [ customerToDelete, setCustomerToDelete ] = useState<Customer | null>(
    null,
  );
  const [ isRestoring, setIsRestoring ] = useState(false);
  const [ isRestoreConfirmationDialogOpen, setIsRestoreConfirmationDialogOpen ] =
    useState(false);
  const [ customerToRestore, setCustomerToRestore ] = useState<Customer | null>(
    null,
  );
  const [ isHardDeleting, setIsHardDeleting ] = useState(false);
  const [
    isHardDeleteConfirmationDialogOpen,
    setIsHardDeleteConfirmationDialogOpen,
  ] = useState(false);
  const [ customerToHardDelete, setCustomerToHardDelete ] =
    useState<Customer | null>(null);

  const [ pagination, setPagination ] = useState({ page: 1, limit: 10 });
  const [ filters, setFilters ] = useState<GetAllCustomersFilters>({
    name: "",
    email: "",
    document: "",
    phone: "",
    filialId: "",
    status: undefined,
    isTrainee: undefined,
  });

  const { data, isLoading } = useQuery<
    ApiResponse<{ items: Customer[]; total: number }>,
    Error
  >({
    queryKey: [ "get-all-customers", filters, pagination ],
    queryFn: () => GetAllCustomers(filters, pagination),
    staleTime: 1000 * 60, // 1 minute cache
  });

  const customers = data?.data?.items || [];
  const totalCustomers = data?.data?.total || 0;
  const totalPages = Math.ceil(totalCustomers / pagination.limit);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const [ isUpdateCustomerDialogOpen, setIsUpdateCustomerDialogOpen ] =
    useState(false);
  const [ selectedCustomer, setSelectedCustomer ] = useState<Customer | null>(
    null,
  );

  const [ isCustomerDetailsDialogOpen, setIsCustomerDetailsDialogOpen ] =
    useState(false);

  const handleToggleUpdateCustomerDialog = (
    openStatus: boolean,
    customer: Customer | null,
  ) => {
    if (openStatus) {
      setSelectedCustomer(customer);
    }

    setIsUpdateCustomerDialogOpen(openStatus);
  };

  const handleToggleCustomerDetailsDialog = (
    openStatus: boolean,
    customer: Customer | null,
  ) => {
    setSelectedCustomer(customer);
    setIsCustomerDetailsDialogOpen(openStatus);
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;

    setIsDeleting(true);
    try {
      const response = await DeleteCustomer(customerToDelete.customerId);

      if (response.statusCode === 200 || response.statusCode === 204) {
        toast.success("Cliente excluído com sucesso.");
        queryClient.invalidateQueries({ queryKey: [ "get-all-customers" ] });
      } else {
        toast.error(response.message || "Erro ao excluir cliente.");
      }
    } catch (error) {
      toast.error("Erro ao excluir cliente.");
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmationDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  const handleRestoreCustomer = (customer: Customer) => {
    setCustomerToRestore(customer);
    setIsRestoreConfirmationDialogOpen(true);
  };

  const confirmRestoreCustomer = async () => {
    if (!customerToRestore) return;

    setIsRestoring(true);
    try {
      const response = await UpdateCustomer({
        body: { isVisible: true },
        queryParams: {
          customerId: customerToRestore.customerId,
        },
      });

      if (response.statusCode === 201 || response.statusCode === 200) {
        toast.success("Cliente restaurado com sucesso.");
        queryClient.invalidateQueries({ queryKey: [ "get-all-customers" ] });
        setIsRestoreConfirmationDialogOpen(false);
      } else {
        toast.error(response.message || "Erro ao restaurar cliente.");
      }
    } catch (error) {
      toast.error("Erro ao restaurar cliente.");
    } finally {
      setIsRestoring(false);
      setIsRestoreConfirmationDialogOpen(false);
      setCustomerToRestore(null);
    }
  };

  const handleHardDeleteCustomer = async () => {
    if (!customerToHardDelete) return;

    setIsHardDeleting(true);
    try {
      const response = await HardDeleteCustomer(customerToHardDelete.customerId);

      if (response.statusCode === 204 || response.statusCode === 200) {
        toast.success("Cliente excluído definitivamente.");
        queryClient.invalidateQueries({ queryKey: [ "get-all-customers" ] });
        queryClient.invalidateQueries({ queryKey: [ "get-all-checkouts" ] });
        queryClient.invalidateQueries({ queryKey: [ "get-all-trainings" ] });
      } else {
        toast.error(response.message || "Erro ao excluir cliente.");
      }
    } catch (error) {
      toast.error("Erro ao excluir cliente.");
    } finally {
      setIsHardDeleting(false);
      setIsHardDeleteConfirmationDialogOpen(false);
      setCustomerToHardDelete(null);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 mb-4 md:flex-row items-center">
        <div className="relative flex-1 max-w-xs">
          <Input
            placeholder="Filtrar por Nome"
            value={ filters.name }
            onChange={ (e) => setFilters({ ...filters, name: e.target.value }) }
            className="pr-8 placeholder:text-placeholder"
            name="filter-name"
            autoComplete="off"
          />
          {filters.name && (
            <button
              onClick={ () => setFilters({ ...filters, name: "" }) }
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Input
            placeholder="Filtrar por Email"
            value={ filters.email }
            onChange={ (e) => setFilters({ ...filters, email: e.target.value }) }
            className="pr-8 placeholder:text-placeholder"
            type="text"
            name="filter-email"
            autoComplete="off"
          />
          {filters.email && (
            <button
              onClick={ () => setFilters({ ...filters, email: "" }) }
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="relative flex-1 max-w-xs">
          <DocumentInput
            placeholder="Filtrar por documento"
            value={ filters.document }
            onChange={ (e) =>
              setFilters({ ...filters, document: e.target.value })
            }
            className="pr-8 placeholder:text-placeholder"
            name="filter-document"
          />
          {filters.document && (
            <button
              onClick={ () => setFilters({ ...filters, document: "" }) }
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <FilialFilter
          value={ filters.filialId || "" }
          onChange={ (value) =>
            setFilters({ ...filters, filialId: value === "ALL" ? "" : value })
          }
        />
        <Select
          value={ filters.status || "ALL" }
          onValueChange={ (value) =>
            setFilters({
              ...filters,
              status:
                value === "ALL" ? undefined : (value as "Ativo" | "Inativo" | "Inadimplente" | "Bloqueado"),
            })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos os Status</SelectItem>
            <SelectItem value="Ativo">Ativo</SelectItem>
            <SelectItem value="Inativo">Inativo</SelectItem>
            <SelectItem value="Inadimplente">Inadimplente</SelectItem>
            <SelectItem value="Bloqueado">Bloqueado</SelectItem>
          </SelectContent>
        </Select>
        {(user?.role === USER_ROLES.MASTER ||
          user?.role === USER_ROLES.ADMIN) && (
          <div className="flex items-center space-x-2">
            <Switch
              id="view-deleted"
              checked={ filters.isVisible === "false" }
              onCheckedChange={ (checked: boolean) =>
                setFilters({
                  ...filters,
                  isVisible: checked ? "false" : undefined,
                })
              }
            />
            <Label htmlFor="view-deleted">Ver Excluídos</Label>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <Switch
            id="view-trainees"
            checked={ filters.isTrainee === true }
            onCheckedChange={ (checked: boolean) =>
              setFilters({
                ...filters,
                isTrainee: checked ? true : undefined,
              })
            }
          />
          <Label htmlFor="view-trainees">Alunos</Label>
        </div>
        {(filters.name ||
          filters.email ||
          filters.document ||
          filters.filialId ||
          filters.status ||
          filters.isTrainee ||
          filters.isVisible) && (
          <Button
            variant="ghost"
            onClick={ () =>
              setFilters({
                name: "",
                email: "",
                document: "",
                phone: "",
                filialId: "",
                isVisible: undefined,
                status: undefined,
                isTrainee: undefined,
              })
            }
            className="px-2 lg:px-3"
            title="Limpar filtros"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="w-[300px] text-center">Email</TableHead>
              <TableHead className="text-center">Telefone</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Último Agendamento</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell
                  colSpan={ 8 }
                  className="p-4 text-center text-muted-foreground"
                >
                  Carregando...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={ 8 } className="text-center p-4">
                  Nada a mostrar por aqui.
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              customers.length > 0 &&
              customers
                .sort((a, b) => a.fullname.localeCompare(b.fullname))
                .map((customer) => (
                  <TableRow
                    key={ customer.customerId }
                    className="border-t hover:bg-muted/50"
                  >
                    <TableCell className="p-3 text-sm">
                      {customer.fullname || customer.companyName || "N/A"}
                    </TableCell>
                    {/* <TableCell className="p-3 text-sm">
                      <div className="flex flex-col">
                        {customer.cpf && (
                          <span className="text-xs">CPF: {customer.cpf}</span>
                        )}
                        {customer.cnpj && (
                          <span className="text-xs">CNPJ: {customer.cnpj}</span>
                        )}
                        {!customer.cpf && !customer.cnpj && (
                          <span className="text-muted-foreground">
                            Não informa
                          </span>
                        )}
                      </div>
                    </TableCell> */}
                    <TableCell className="p-3 text-sm text-center">
                      <div>
                        {customer.email || "--"}
                        {customer.emailDescription && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({customer.emailDescription})
                          </span>
                        )}
                      </div>
                      {customer.secondaryEmail && (
                        <div className="text-xs mt-1">
                          {customer.secondaryEmail}
                          {customer.secondaryEmailDescription && (
                            <span className="text-muted-foreground ml-1">
                              ({customer.secondaryEmailDescription})
                            </span>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="p-3 text-center text-sm">
                      <div>
                        {customer.cellphone || "--"}
                        {customer.cellphoneDescription && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({customer.cellphoneDescription})
                          </span>
                        )}
                      </div>
                      {customer.secondaryCellphone && (
                        <div className="text-xs mt-1 text-muted-foreground">
                          {customer.secondaryCellphone}
                          {customer.secondaryCellphoneDescription && (
                            <span className="ml-1">
                              ({customer.secondaryCellphoneDescription})
                            </span>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="p-3 text-center text-sm">
                      <CustomerStatusBadge status={ customer.customerStatus } />
                    </TableCell>
                    <TableCell className="p-3 text-center text-sm">
                      {customer.lastBooking
                        ? new Date(customer.lastBooking).toLocaleDateString()
                        : "Não informado"}
                    </TableCell>
                    <TableCell className="p-3 flex justify-center items-center gap-4">
                      <Can module={ SYSTEM_MODULES.CUSTOMERS } action="canView">
                        <Button
                          onClick={ () =>
                            handleToggleCustomerDetailsDialog(true, customer)
                          }
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Can>
                      <Can module={ SYSTEM_MODULES.CUSTOMERS } action="canEdit">
                        <Button
                          variant="outline"
                          onClick={ () =>
                            handleToggleUpdateCustomerDialog(true, customer)
                          }
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Can>
                      {user?.role === USER_ROLES.MASTER && filters.isVisible !== "false" && (
                        <Button
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={ () => {
                            setCustomerToDelete(customer);
                            setIsDeleteConfirmationDialogOpen(true);
                          } }
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                      {user?.role === USER_ROLES.MASTER && filters.isVisible === "false" && (
                        <Button
                          variant="ghost"
                          className="text-green-600 hover:bg-green-50"
                          onClick={ () => handleRestoreCustomer(customer) }
                          disabled={ isRestoring }
                        >
                          <RefreshCcw className="w-4 h-4" />
                        </Button>
                      )}
                      {user?.role === USER_ROLES.MASTER && filters.isVisible === "false" && (
                        <Button
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={ () => {
                            setCustomerToHardDelete(customer);
                            setIsHardDeleteConfirmationDialogOpen(true);
                          } }
                          disabled={ isHardDeleting }
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {totalCustomers} cliente(s) encontrado(s)
        </div>
        <div className="space-x-2 flex items-center">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={ () => handlePageChange(1) }
            disabled={ pagination.page === 1 }
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={ () => handlePageChange(pagination.page - 1) }
            disabled={ pagination.page === 1 }
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Numbered Pages */}
          <div className="flex items-center gap-1">
            {(() => {
              const MAX_VISIBLE_PAGES = 5;
              const pages = [];
              let startPage = Math.max(
                1,
                pagination.page - Math.floor(MAX_VISIBLE_PAGES / 2),
              );
              const endPage = Math.min(
                totalPages,
                startPage + MAX_VISIBLE_PAGES - 1,
              );

              if (endPage - startPage + 1 < MAX_VISIBLE_PAGES) {
                startPage = Math.max(1, endPage - MAX_VISIBLE_PAGES + 1);
              }

              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <Button
                    key={ i }
                    variant={ pagination.page === i ? "default" : "outline" }
                    size="sm"
                    className="h-8 w-8"
                    onClick={ () => handlePageChange(i) }
                  >
                    {i}
                  </Button>,
                );
              }
              return pages;
            })()}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={ () => handlePageChange(pagination.page + 1) }
            disabled={ pagination.page >= totalPages }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={ () => handlePageChange(totalPages) }
            disabled={ pagination.page >= totalPages }
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="md:hidden flex flex-col gap-4">
        {isLoading ? (
          <div className="text-center p-4 text-muted-foreground">
            Carregando...
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            Nenhum cliente encontrado.
          </div>
        ) : null}

        {!isLoading &&
          customers.length > 0 &&
          customers.map((customer) => (
            <Fragment key={ customer.customerId }>
              <Can module={ SYSTEM_MODULES.CUSTOMERS } action="canView">
                <ResponsiveCard
                  cardData={ {
                    id: customer.customerId,
                    title: customer.fullname || customer.companyName || "",
                    description: "",
                    items: [
                      {
                        itemLabel: "Documento",
                        itemInfo: (
                          <div className="flex flex-col items-end">
                            {customer.cpf && <span>CPF: {customer.cpf}</span>}
                            {customer.cnpj && (
                              <span>CNPJ: {customer.cnpj}</span>
                            )}
                            {!customer.cpf && !customer.cnpj && (
                              <span>Não informa</span>
                            )}
                          </div>
                        ),
                      },
                      {
                        itemLabel: "Email",
                        itemInfo: (
                          <div className="flex flex-col items-end">
                            <div>
                              <span>{customer.email || "--"}</span>
                              {customer.emailDescription && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  ({customer.emailDescription})
                                </span>
                              )}
                            </div>
                            {customer.secondaryEmail && (
                              <div className="text-xs mt-1">
                                {customer.secondaryEmail}
                                {customer.secondaryEmailDescription && (
                                  <span className="text-muted-foreground ml-1">
                                    ({customer.secondaryEmailDescription})
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ),
                      },
                      {
                        itemLabel: "Telefone",
                        itemInfo: (
                          <div className="flex flex-col items-end">
                            <div>
                              <span>{customer.cellphone || "--"}</span>
                              {customer.cellphoneDescription && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  ({customer.cellphoneDescription})
                                </span>
                              )}
                            </div>
                            {customer.secondaryCellphone && (
                              <div className="text-xs mt-1 text-muted-foreground">
                                {customer.secondaryCellphone}
                                {customer.secondaryCellphoneDescription && (
                                  <span className="ml-1">
                                    ({customer.secondaryCellphoneDescription})
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ),
                      },
                      {
                        itemLabel: "Status",
                        itemInfo: (
                          <CustomerStatusBadge
                            status={ customer.customerStatus }
                          />
                        ), // Cast/Hack if itemInfo expects string|number only, checking type def needed
                      },
                      {
                        itemLabel: "Último Agendamento",
                        itemInfo: customer.lastBooking
                          ? new Date(customer.lastBooking).toLocaleDateString()
                          : "Não informado",
                      },
                    ],
                  } }
                  rawData={ customer }
                  handleToggleDialog={ handleToggleCustomerDetailsDialog }
                />
              </Can>
            </Fragment>
          ))}
      </div>

      <CustomerDetailsDialog
        selectedCustomer={ selectedCustomer }
        handleToggleUpdateCustomerDialog={ handleToggleUpdateCustomerDialog }
        handleToggleCustomerDetailsDialog={ handleToggleCustomerDetailsDialog }
        isCustomerDetailsModalOpen={ isCustomerDetailsDialogOpen }
      />

      <UpdateCustomerDialog
        isUpdateCustomerDialogOpen={ isUpdateCustomerDialogOpen }
        selectedCustomer={ selectedCustomer }
        setSelectedCustomer={ setSelectedCustomer }
        handleToggleUpdateCustomerDialog={ handleToggleUpdateCustomerDialog }
      />

      <Dialog
        open={ isDeleteConfirmationDialogOpen }
        onOpenChange={ setIsDeleteConfirmationDialogOpen }
      >
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Confirmar Exclusão
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o cliente{" "}
              <span className="font-bold">
                {customerToDelete?.fullname || customerToDelete?.companyName}
              </span>
              ? Esta ação ocultará o cliente para todos os usuários menos para
              administradores de nível Master.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={ () => setIsDeleteConfirmationDialogOpen(false) }
              disabled={ isDeleting }
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={ handleDeleteCustomer }
              disabled={ isDeleting }
            >
              {isDeleting ? "Excluindo..." : "Confirmar Exclusão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RestoreConfirmationDialog
        isOpen={ isRestoreConfirmationDialogOpen }
        onOpenChange={ setIsRestoreConfirmationDialogOpen }
        onConfirm={ confirmRestoreCustomer }
        title="Confirmar Restauração"
        description="Tem certeza que deseja restaurar o cliente"
        itemName={ (customerToRestore?.fullname || customerToRestore?.companyName) ?? undefined }
        itemId={ customerToRestore?.customerId }
        isRestoring={ isRestoring }
      />

      <Dialog
        open={ isHardDeleteConfirmationDialogOpen }
        onOpenChange={ setIsHardDeleteConfirmationDialogOpen }
      >
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> EXCLUSÃO DEFINITIVA
            </DialogTitle>
            <DialogDescription>
              Esta ação é <span className="font-bold underline">irreversível</span>.
              Tem certeza que deseja excluir permanentemente o cliente{" "}
              <span className="font-bold">
                {customerToHardDelete?.fullname ||
                  customerToHardDelete?.companyName}
              </span>
              ? Todos os dados associados a este cliente serão removidos para sempre.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={ () => setIsHardDeleteConfirmationDialogOpen(false) }
              disabled={ isHardDeleting }
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={ handleHardDeleteCustomer }
              disabled={ isHardDeleting }
            >
              {isHardDeleting ? "Excluindo..." : "Confirmar Exclusão Definitiva"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
