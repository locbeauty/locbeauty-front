"use client";
import { ResponsiveCard } from "@/components/shared/ResponsiveCard";
import { Button } from "@/components/ui/button";
import { Employee } from "@/utils/@types/employee";
import {
  Eye,
  Pencil,
  ChevronLeft,
  ChevronsLeft,
  Trash2,
  RefreshCcw,
} from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { UpdateEmployeeDialog } from "../update/UpdateEmployeeDialog";
import { EmployeeDetailsDialog } from "./EmployeeDetailsDialog";
import { fetchWithToken } from "@/utils/fetchWithToken";
import { Can } from "@/components/auth/Can";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { useAuth } from "@/contexts/auth-provider";
import {
  DeleteEmployee,
  UpdateEmployee,
  HardDeleteEmployee,
} from "@/services/employees.service";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";
import { RestoreConfirmationDialog } from "@/components/shared/RestoreConfirmationDialog";
import { USER_ROLES } from "@/utils/constants";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface EmployeesTableProps {
  searchName?: string;
  filialId?: string;
}

export function EmployeesTable({ searchName, filialId }: EmployeesTableProps) {
  const { user } = useAuth();
  const [ isUpdateEmployeeDialogOpen, setIsUpdateEmployeeDialogOpen ] =
    useState(false);
  const [ allEmployees, setAllEmployees ] = useState<Employee[] | null>(null);
  const [ totalEmployees, setTotalEmployees ] = useState(0);
  const [ pagination, setPagination ] = useState({ page: 1, limit: 10 });
  const [ selectedEmployee, setSelectedEmployee ] = useState<Employee | null>(
    null,
  );
  const [ isDeleting, setIsDeleting ] = useState(false);
  const [ isDeleteConfirmationDialogOpen, setIsDeleteConfirmationDialogOpen ] =
    useState(false);
  const [ employeeToDelete, setEmployeeToDelete ] = useState<Employee | null>(
    null,
  );
  const [ employeeToRestore, setEmployeeToRestore ] = useState<Employee | null>(
    null,
  );
  const [ refreshCounter, setRefreshCounter ] = useState(0);
  const [ isRestoring, setIsRestoring ] = useState(false);
  const [ isRestoreConfirmationDialogOpen, setIsRestoreConfirmationDialogOpen ] =
    useState(false);

  const [ isEmployeeDetailsDialogOpen, setIsEmployeeDetailsDialogOpen ] =
    useState(false);
  const [ isHardDeleting, setIsHardDeleting ] = useState(false);
  const [
    isHardDeleteConfirmationDialogOpen,
    setIsHardDeleteConfirmationDialogOpen,
  ] = useState(false);
  const [ employeeToHardDelete, setEmployeeToHardDelete ] =
    useState<Employee | null>(null);

  const [ isVisible, setIsVisible ] = useState<boolean>(false);

  const totalPages = Math.ceil(totalEmployees / pagination.limit);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleToggleUpdateEmployeeDialog = (
    openStatus: boolean,
    employee: Employee | null,
  ) => {
    if (openStatus) {
      setSelectedEmployee(employee);
    }

    setIsUpdateEmployeeDialogOpen(openStatus);
  };

  function handleToggleEmployeeDetailsDialog(
    openStatus: boolean,
    employee: Employee | null,
  ) {
    setSelectedEmployee(employee);
    setIsEmployeeDetailsDialogOpen(openStatus);
  }

  function handleEmployeeUpdated(updatedEmployee: Employee) {
    setAllEmployees((prev) => {
      if (!prev) return null;
      return prev.map((emp) =>
        emp.employeeId === updatedEmployee.employeeId ? updatedEmployee : emp,
      );
    });
  }

  async function handleDeleteEmployee() {
    if (!employeeToDelete) return;

    setIsDeleting(true);
    try {
      const response = await DeleteEmployee(employeeToDelete.employeeId);

      if (response.statusCode === 200 || response.statusCode === 204) {
        toast.success("Funcionário excluído com sucesso.");
        setAllEmployees(
          (prev) =>
            prev?.filter((e) => e.employeeId !== employeeToDelete.employeeId) ??
            null,
        );
      } else {
        toast.error(response.message || "Erro ao excluir funcionário.");
      }
    } catch (error) {
      toast.error("Erro ao excluir funcionário.");
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmationDialogOpen(false);
      setEmployeeToDelete(null);
    }
  }

  const handleRestoreEmployee = (employee: Employee) => {
    setEmployeeToRestore(employee);
    setIsRestoreConfirmationDialogOpen(true);
  };

  const confirmRestoreEmployee = async () => {
    if (!employeeToRestore) return;
    const targetId = employeeToRestore.employeeId;

    setIsRestoring(true);
    try {
      const response = await UpdateEmployee({
        employeeId: targetId,
        data: { isVisible: true },
      });

      if (
        response.statusCode === 200 ||
        response.statusCode === 201 ||
        response.statusCode === 204
      ) {
        toast.success("Funcionário restaurado com sucesso.");
        setAllEmployees((prev) => {
          if (!prev) return null;
          return prev.filter((e) => String(e.employeeId) !== String(targetId));
        });
      } else {
        toast.error(response.message || "Erro ao restaurar funcionário.");
      }
    } catch (error) {
      toast.error("Erro ao restaurar funcionário.");
    } finally {
      setIsRestoring(false);
      setIsRestoreConfirmationDialogOpen(false);
      if (employeeToRestore?.employeeId === targetId) {
        setEmployeeToRestore(null);
      }
    }
  };

  async function handleHardDeleteEmployee() {
    if (!employeeToHardDelete) return;

    setIsHardDeleting(true);
    try {
      const response = await HardDeleteEmployee(
        employeeToHardDelete.employeeId,
      );

      if (response.statusCode === 200 || response.statusCode === 204) {
        toast.success("Funcionário excluído definitivamente.");
        setAllEmployees(
          (prev) =>
            prev?.filter(
              (e) => e.employeeId !== employeeToHardDelete.employeeId,
            ) ?? null,
        );
      } else {
        toast.error(
          response.message || "Erro ao excluir funcionário definitivamente.",
        );
      }
    } catch (error) {
      toast.error("Erro ao excluir funcionário definitivamente.");
    } finally {
      setIsHardDeleting(false);
      setIsHardDeleteConfirmationDialogOpen(false);
      setEmployeeToHardDelete(null);
    }
  }

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [ searchName, filialId, isVisible ]);

  useEffect(() => {
    async function getEmployees() {
      const queryParams = new URLSearchParams();

      if (searchName) {
        queryParams.append("name", searchName);
      }

      if (filialId && filialId !== "Todas") {
        queryParams.append("filialId", filialId);
      }

      if (isVisible) {
        queryParams.append("isVisible", "false");
      }

      queryParams.append("page", pagination.page.toString());
      queryParams.append("limit", pagination.limit.toString());
      queryParams.append("excludeMaster", "true");

      const response = await fetchWithToken(
        `${
          process.env.NEXT_PUBLIC_SERVER_URL
        }/employees?${queryParams.toString()}`,
        {
          credentials: "include",
          cache: "no-store",
        },
      );

      const jsonResponse = await response.json();
      const { data } = jsonResponse;

      if (response.ok && data) {
        if (data.items) {
          setAllEmployees(data.items);
          setTotalEmployees(data.total);
        } else {
          // Fallback for safety or old cache
          setAllEmployees(data);
          setTotalEmployees(data.length || 0);
        }
      } else {
        console.error("Failed to fetch employees:", jsonResponse);
        toast.error("Erro ao buscar funcionários.");
        setAllEmployees([]);
      }
    }
    getEmployees();
  }, [ searchName, filialId, pagination, refreshCounter, isVisible ]);

  return (
    <>
      {(user?.role === USER_ROLES.MASTER ||
        user?.role === USER_ROLES.ADMIN) && (
        <div className="flex justify-end mb-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="view-deleted-employees"
              checked={ isVisible }
              onCheckedChange={ setIsVisible }
            />
            <Label htmlFor="view-deleted-employees">Ver Excluídos</Label>
          </div>
        </div>
      )}
      <div className="border rounded-lg max-h-[70vh] lg:w-full w-[89vw] overflow-x-auto md:block hidden ">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium">Nome</th>
              <th className="text-center p-3 font-medium">Cargo</th>
              <th className="text-center p-3 font-medium">Filial</th>
              <th className="text-center p-3 font-medium">Telefone</th>
              <th className="text-center p-3 font-medium">Email</th>
              <th className="text-center p-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {allEmployees?.length === 0 && (
              <tr>
                <td className="text-center p-4" colSpan={ 6 }>
                  Nada a mostrar por aqui.
                </td>
              </tr>
            )}
            {allEmployees ? (
              allEmployees
                .filter(
                  (employee) =>
                    employee.employeeId !== (user?.employeeId || user?.sub),
                )
                .map((employee) => (
                  <tr
                    key={ employee.employeeId }
                    className="border-t hover:bg-muted/50"
                  >
                    <td className="p-3 text-sm">{employee.fullname}</td>
                    <td className="p-3 text-center text-sm">{employee.role}</td>
                    <td className="p-3 text-center text-sm">
                      {employee.SourceFilial.filialName}
                    </td>
                    <td className="p-3 text-center text-sm">
                      {employee.cellphone ?? "-"}
                    </td>
                    <td className="p-3 text-center text-sm">
                      {employee.email ?? "-"}
                    </td>
                    <td className="p-3 flex justify-center items-center gap-4">
                      <Can module={ SYSTEM_MODULES.EMPLOYEES } action="canView">
                        <Button
                          onClick={ () =>
                            handleToggleEmployeeDetailsDialog(true, employee)
                          }
                        >
                          <Eye />
                        </Button>
                      </Can>
                      <Can module={ SYSTEM_MODULES.EMPLOYEES } action="canEdit">
                        <Button
                          variant="outline"
                          onClick={ () =>
                            handleToggleUpdateEmployeeDialog(true, employee)
                          }
                        >
                          <Pencil />
                        </Button>
                      </Can>
                      {user?.role === USER_ROLES.MASTER &&
                        (isVisible ? (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              className="text-green-600 hover:bg-green-50"
                              onClick={ () => handleRestoreEmployee(employee) }
                              disabled={ isRestoring }
                              title="Restaurar"
                            >
                              <RefreshCcw className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={ () => {
                                setEmployeeToHardDelete(employee);
                                setIsHardDeleteConfirmationDialogOpen(true);
                              } }
                              disabled={ isHardDeleting }
                              title="Excluir Definitivamente"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={ () => {
                              setEmployeeToDelete(employee);
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

      {/* Pagination Controls */}
      <div className="flex items-center justify-end space-x-2 py-4 hidden md:flex">
        <div className="flex-1 text-sm text-muted-foreground">
          {totalEmployees} funcionário(s) encontrado(s)
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
            disabled={ pagination.page === totalPages || totalPages === 0 }
          >
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={ () => handlePageChange(totalPages) }
            disabled={ pagination.page === totalPages || totalPages === 0 }
          >
            <ChevronsLeft className="h-4 w-4 rotate-180" />
          </Button>
        </div>
      </div>

      <div className="md:hidden flex flex-col gap-4">
        {allEmployees
          ?.filter(
            (employee) =>
              employee.employeeId !== (user?.employeeId || user?.sub),
          )
          .map((employee) => (
            <Fragment key={ employee.employeeId }>
              <ResponsiveCard
                cardData={ {
                  id: employee.employeeId,
                  title: employee.fullname,
                  description: "",
                  items: [
                    { itemLabel: "Função: ", itemInfo: employee.role },
                    { itemLabel: "Email: ", itemInfo: employee.email ?? "-" },
                    {
                      itemLabel: "Telefone: ",
                      itemInfo: employee.cellphone ?? "-",
                    },
                  ],
                } }
                rawData={ employee }
                handleToggleDialog={ handleToggleEmployeeDetailsDialog }
              />
            </Fragment>
          ))}
      </div>

      {/* Pagination Controls Mobile */}
      <div className="flex flex-col items-center justify-center space-y-4 py-4 md:hidden">
        <div className="text-sm text-muted-foreground w-full text-center">
          {totalEmployees} funcionário(s) encontrado(s)
        </div>
        <div className="flex items-center justify-center space-x-2 w-full">
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
              const MAX_VISIBLE_PAGES = 3; // Smaller for mobile
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
            disabled={ pagination.page === totalPages || totalPages === 0 }
          >
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={ () => handlePageChange(totalPages) }
            disabled={ pagination.page === totalPages || totalPages === 0 }
          >
            <ChevronsLeft className="h-4 w-4 rotate-180" />
          </Button>
        </div>
      </div>

      <EmployeeDetailsDialog
        selectedEmployee={ selectedEmployee }
        handleToggleUpdateEmployeeDialog={ handleToggleUpdateEmployeeDialog }
        handleToggleEmployeeDetailsDialog={ handleToggleEmployeeDetailsDialog }
        isEmployeeDetailsModalOpen={ isEmployeeDetailsDialogOpen }
        handleRestoreEmployee={ handleRestoreEmployee }
        handleHardDeleteEmployee={ (employee) => {
          setEmployeeToHardDelete(employee);
          setIsHardDeleteConfirmationDialogOpen(true);
        } }
        isRestoring={ isRestoring }
        isHardDeleting={ isHardDeleting }
      />

      <UpdateEmployeeDialog
        isUpdateEmployeeDialogOpen={ isUpdateEmployeeDialogOpen }
        selectedEmployee={ selectedEmployee! }
        setSelectedEmployee={ setSelectedEmployee }
        handleToggleUpdateEmployeeDialog={ handleToggleUpdateEmployeeDialog }
        onEmployeeUpdated={ handleEmployeeUpdated }
      />

      <DeleteConfirmationDialog
        isOpen={ isDeleteConfirmationDialogOpen }
        onOpenChange={ setIsDeleteConfirmationDialogOpen }
        onConfirm={ handleDeleteEmployee }
        title="Confirmar Exclusão"
        description="Tem certeza que deseja excluir o funcionário"
        itemName={ employeeToDelete?.fullname }
        isDeleting={ isDeleting }
      />

      <RestoreConfirmationDialog
        isOpen={ isRestoreConfirmationDialogOpen }
        onOpenChange={ setIsRestoreConfirmationDialogOpen }
        onConfirm={ confirmRestoreEmployee }
        title="Confirmar Restauração"
        description="Tem certeza que deseja restaurar o funcionário"
        itemName={ employeeToRestore?.fullname }
        isRestoring={ isRestoring }
      />

      <DeleteConfirmationDialog
        isOpen={ isHardDeleteConfirmationDialogOpen }
        onOpenChange={ setIsHardDeleteConfirmationDialogOpen }
        onConfirm={ handleHardDeleteEmployee }
        title="Confirmar Exclusão Definitiva"
        description="Tem certeza que deseja excluir definitivamente o funcionário? Esta ação irá anonimizar os dados e não poderá ser desfeita."
        itemName={ employeeToHardDelete?.fullname }
        isDeleting={ isHardDeleting }
      />
    </>
  );
}
