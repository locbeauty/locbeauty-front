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
} from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { UpdateCustomerDialog } from "../update/UpdateCustomerDialog";
import { CustomerDetailsDialog } from "./CustomerDetailsDialog";
import { Button } from "@/components/ui/button";
import { Customer } from "@/utils/@types/customer";
import { format } from "date-fns";
import { fetchWithToken } from "@/utils/fetchWithToken";
import { useQuery } from "@tanstack/react-query";
import {
  GetAllCustomers,
  GetAllCustomersFilters,
} from "@/services/customers.service";
import { ApiResponse } from "@/lib/api";
import { Can } from "@/components/auth/Can";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

export function CustomersTable() {
  const [ pagination, setPagination ] = useState({ page: 1, limit: 10 });
  const [ filters, setFilters ] = useState<GetAllCustomersFilters>({
    name: "",
    email: "",
    document: "",
    phone: "",
    filialId: "",
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
    null
  );

  const [ isCustomerDetailsDialogOpen, setIsCustomerDetailsDialogOpen ] =
    useState(false);

  const handleToggleUpdateCustomerDialog = (
    openStatus: boolean,
    customer: Customer | null
  ) => {
    if (openStatus) {
      setSelectedCustomer(customer);
    }

    setIsUpdateCustomerDialogOpen(openStatus);
  };

  const handleToggleCustomerDetailsDialog = (
    openStatus: boolean,
    customer: Customer | null
  ) => {
    setSelectedCustomer(customer);
    setIsCustomerDetailsDialogOpen(openStatus);
  };

  return (
    <>
      <div className="flex flex-col gap-4 mb-4 md:flex-row">
        <Input
          placeholder="Filtrar por Nome"
          value={ filters.name }
          onChange={ (e) => setFilters({ ...filters, name: e.target.value }) }
          className="max-w-xs"
        />
        <Input
          placeholder="Filtrar por Email"
          value={ filters.email }
          onChange={ (e) => setFilters({ ...filters, email: e.target.value }) }
          className="max-w-xs"
        />
        <Input
          placeholder="Filtrar por Documento"
          value={ filters.document }
          onChange={ (e) => setFilters({ ...filters, document: e.target.value }) }
          className="max-w-xs"
        />
        <FilialFilter
          value={ filters.filialId || "" }
          onChange={ (value) =>
            setFilters({ ...filters, filialId: value === "ALL" ? "" : value })
          }
        />
        {(filters.name ||
          filters.email ||
          filters.document ||
          filters.filialId) && (
          <Button
            variant="ghost"
            onClick={ () =>
              setFilters({
                name: "",
                email: "",
                document: "",
                phone: "",
                filialId: "",
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
              <TableHead>Documento</TableHead>
              <TableHead className="w-[300px]">Email</TableHead>
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
                    <TableCell className="p-3 text-sm">
                      {customer.documentNumber || "Não informa"}
                    </TableCell>
                    <TableCell className="p-3 text-sm">
                      <div>
                        {customer.email}
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
                        {customer.cellphone}
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
                pagination.page - Math.floor(MAX_VISIBLE_PAGES / 2)
              );
              const endPage = Math.min(
                totalPages,
                startPage + MAX_VISIBLE_PAGES - 1
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
                  </Button>
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
                        itemInfo: customer.documentNumber || "Não informa",
                      },
                      {
                        itemLabel: "Email",
                        itemInfo: (
                          <div className="flex flex-col items-end">
                            <div>
                              <span>{customer.email || "Não informado"}</span>
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
                              <span>
                                {customer.cellphone || "Não informado"}
                              </span>
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
    </>
  );
}
