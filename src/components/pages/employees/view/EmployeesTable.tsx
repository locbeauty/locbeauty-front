"use client";
import { ResponsiveCard } from "@/components/shared/ResponsiveCard";
import { Button } from "@/components/ui/button";
import { Employee } from "@/utils/@types/employee";
import { Eye, Pencil } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { UpdateEmployeeDialog } from "../update/UpdateEmployeeDialog";
import { EmployeeDetailsDialog } from "./EmployeeDetailsDialog";
import { fetchWithToken } from "@/utils/fetchWithToken";
import { Can } from "@/components/auth/Can";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { useAuth } from "@/contexts/auth-provider";

export function EmployeesTable() {
    const { user } = useAuth();
    const [ isUpdateEmployeeDialogOpen, setIsUpdateEmployeeDialogOpen ] =
    useState(false);
    const [ allEmployees, setAllEmployees ] = useState<Employee[] | null>(null);
    const [ selectedEmployee, setSelectedEmployee ] = useState<Employee | null>(
        null
    );

    const [ isEmployeeDetailsDialogOpen, setIsEmployeeDetailsDialogOpen ] =
    useState(false);

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
        async function getEmployees() {
            const response = await fetchWithToken(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/employees`,
                {
                    credentials: "include",
                }
            );

            const { data } = await response.json();

            setAllEmployees(data);
        }
        getEmployees();
    }, []);

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
