"use client";
import { ResponsiveCard } from "@/components/shared/ResponsiveCard";
import { Button } from "@/components/ui/button";
import { Employee } from "@/utils/@types/employees";
import { Eye, Pencil } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { UpdateEmployeeDialog } from "../update/UpdateEmployeeDialog";
import { EmployeeDetailsDialog } from "./EmployeeDetailsDialog";

export function EmployeesTable() {

    const [ isUpdateEmployeeDialogOpen, setIsUpdateEmployeeDialogOpen ] = useState(false);
    const [ allEmployees, setAllEmployees ] = useState<Employee[]>();
    const [ selectedEmployee, setSelectedEmployee ] = useState<Employee | null>(null);

    const [ isEmployeeDetailsDialogOpen, setIsEmployeeDetailsDialogOpen ] = useState(false);

    const handleToggleUpdateEmployeeDialog = (openStatus: boolean, employee: Employee | null) => {
        if(openStatus) {
            setSelectedEmployee(employee);
        }

        setIsUpdateEmployeeDialogOpen(openStatus);
    };

    function handleToggleEmployeeDetailsDialog(openStatus: boolean, employee: Employee | null) {
        setSelectedEmployee(employee);
        setIsEmployeeDetailsDialogOpen(openStatus);
    }

    useEffect(() => {
        async function getEmployees() {
            const response = await fetch("http://localhost:3333/api/employees", { credentials: "include" });

            const { data } = await response.json();
            console.log("data: ", data);
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
                            <th className="text-center p-3 font-medium">Regional</th>
                            <th className="text-center p-3 font-medium">Telefone</th>
                            <th className="text-center p-3 font-medium">Email</th>
                            <th className="text-center p-3 font-medium">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            allEmployees?.map(employee => (

                                <tr key={ employee.employeeId } className="border-t hover:bg-muted/50">
                                    <td className="p-3">{employee.fullname}</td>
                                    <td className="p-3">{employee.documentNumber}</td>
                                    <td className="p-3 text-center">{employee.role}</td>
                                    <td className="p-3 text-center">{employee.sourceRegionalId}</td>
                                    <td className="p-3 text-center">{employee.cellphone ?? "-"}</td>
                                    <td className="p-3 text-center">{employee.email ?? "-"}</td>
                                    <td className="p-3 flex justify-center items-center gap-4">
                                        <Button
                                            onClick={ () =>
                                                handleToggleEmployeeDetailsDialog(true, employee)
                                            }
                                        >
                                            <Eye />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={ () =>
                                                handleToggleUpdateEmployeeDialog(true, employee)
                                            }
                                        >
                                            <Pencil />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
            {allEmployees?.map((employee) => (
                <Fragment key={ employee.employeeId }>
                    <ResponsiveCard
                        cardData={ {
                            id: employee.employeeId,
                            title: employee.fullname,
                            description: "",
                            items: [
                                { itemLabel: "Função: ", itemInfo: employee.role },
                                { itemLabel: "Email: ", itemInfo: employee.email },
                                {
                                    itemLabel: "Telefone: ",
                                    itemInfo: employee.cellphone,
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
                isEmployeeDetailsModalOpen={ isEmployeeDetailsDialogOpen } />

            <UpdateEmployeeDialog
                isUpdateEmployeeDialogOpen={ isUpdateEmployeeDialogOpen }
                selectedEmployee={ selectedEmployee! }
                setSelectedEmployee={ setSelectedEmployee }
                handleToggleUpdateEmployeeDialog={ handleToggleUpdateEmployeeDialog }
            />
        </>
    );
}