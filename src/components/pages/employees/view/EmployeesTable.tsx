"use client";
import { ResponsiveCard } from "@/components/shared/ResponsiveCard";
import { Button } from "@/components/ui/button";
import { Employee } from "@/utils/@types/employee";
import { Eye, Pencil , ChevronLeft, ChevronsLeft } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { UpdateEmployeeDialog } from "../update/UpdateEmployeeDialog";
import { EmployeeDetailsDialog } from "./EmployeeDetailsDialog";
import { fetchWithToken } from "@/utils/fetchWithToken";
import { Can } from "@/components/auth/Can";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { useAuth } from "@/contexts/auth-provider";

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
    null
  );

  const [ isEmployeeDetailsDialogOpen, setIsEmployeeDetailsDialogOpen ] =
    useState(false);

  const totalPages = Math.ceil(totalEmployees / pagination.limit);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleToggleUpdateEmployeeDialog = (
    openStatus: boolean,
    employee: Employee | null
  ) => {
    if (openStatus) {
      setSelectedEmployee(employee);
    }

    setIsUpdateEmployeeDialogOpen(openStatus);
  };

  function handleToggleEmployeeDetailsDialog(
    openStatus: boolean,
    employee: Employee | null
  ) {
    setSelectedEmployee(employee);
    setIsEmployeeDetailsDialogOpen(openStatus);
  }

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [ searchName, filialId ]);

  useEffect(() => {
    async function getEmployees() {
      const queryParams = new URLSearchParams();

      if (searchName) {
        queryParams.append("name", searchName);
      }

      if (filialId && filialId !== "Todas") {
        queryParams.append("filialId", filialId);
      }

      queryParams.append("page", pagination.page.toString());
      queryParams.append("limit", pagination.limit.toString());

      const response = await fetchWithToken(
        `${
          process.env.NEXT_PUBLIC_SERVER_URL
        }/employees?${queryParams.toString()}`,
        {
          credentials: "include",
        }
      );

      const { data } = await response.json();

      if (data.items) {
        setAllEmployees(data.items);
        setTotalEmployees(data.total);
      } else {
        // Fallback for safety or old cache
        setAllEmployees(data);
        setTotalEmployees(data.length || 0);
      }
    }
    getEmployees();
  }, [ searchName, filialId, pagination ]);

  return (
    <>
      <div className="border rounded-lg max-h-[70vh] lg:w-full w-[89vw] overflow-x-auto md:block hidden ">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium">Nome</th>
              <th className="text-left p-3 font-medium">CPF</th>
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
                <td className="text-center p-4" colSpan={ 8 }>
                  Nada a mostrar por aqui.
                </td>
              </tr>
            )}
            {allEmployees ? (
              allEmployees
                .filter((employee) => employee.employeeId !== user?.sub)
                .map((employee) => (
                  <tr
                    key={ employee.employeeId }
                    className="border-t hover:bg-muted/50"
                  >
                    <td className="p-3 text-sm">{employee.fullname}</td>
                    <td className="p-3 text-sm">{employee.documentNumber}</td>
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

      {allEmployees
        ?.filter((employee) => employee.employeeId !== user?.sub)
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
      />

      <UpdateEmployeeDialog
        isUpdateEmployeeDialogOpen={ isUpdateEmployeeDialogOpen }
        selectedEmployee={ selectedEmployee! }
        setSelectedEmployee={ setSelectedEmployee }
        handleToggleUpdateEmployeeDialog={ handleToggleUpdateEmployeeDialog }
      />
    </>
  );
}
