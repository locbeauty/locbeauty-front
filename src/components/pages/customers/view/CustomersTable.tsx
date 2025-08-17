"use client";
import { CustomerStatusBadge } from "@/components/shared/CustomerStatusBadge";
import { ResponsiveCard } from "@/components/shared/ResponsiveCard";
import { Eye, Pencil } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { UpdateCustomerDialog } from "../update/UpdateCustomerDialog";
import { CustomerDetailsDialog } from "./CustomerDetailsDialog";
import { Button } from "@/components/ui/button";
import { Customer } from "@/utils/@types/customer";
import { format } from "date-fns";
import { fetchWithToken } from "@/utils/fetchWithToken";

export function CustomersTable() {
    const [ customers, setCustomers ] = useState<Customer[] | null>(null);

    const [ isUpdateCustomerDialogOpen, setIsUpdateCustomerDialogOpen ] =
    useState(false);
    const [ selectedCustomer, setSelectedCustomer ] = useState<Customer | null>(
        null
    );

    const [ isCustomerDetailsDialogOpen, setIsCustomerDetailsDialogOpen ] =
    useState(false);

    useEffect(() => {
        async function handleGetAllCustomers() {
            const response = await fetchWithToken(`${process.env.NEXT_PUBLIC_SERVER_URL}/customers`, {
                credentials: "include",
            });
            const { data }: { data: Customer[] } = await response.json();
            setCustomers(data);
        }
        handleGetAllCustomers();
    }, []);

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
            <div className="border rounded-lg max-h-[70vh] w-full overflow-x-auto hidden md:block">
                <table className="min-w-[800px] w-full">
                    <thead className="bg-muted">
                        <tr>
                            <th className="text-left p-3 font-medium">Nome</th>
                            <th className="text-center p-3 font-medium">CPF/CNPJ</th>
                            <th className="text-center p-3 font-medium">Email</th>
                            <th className="text-center p-3 font-medium">Telefone</th>
                            <th className="text-center p-3 font-medium">Status</th>
                            <th className="text-center p-3 font-medium">Último Registro</th>
                            <th className="text-center p-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers?.length === 0 && (
                            <tr>
                                <td className="text-center p-4" colSpan={ 8 }>
                  Nada a mostrar por aqui.
                                </td>
                            </tr>
                        )}
                        {customers ? (
                            customers.map((customer) => (
                                <tr
                                    key={ customer.customerId }
                                    className="border-t hover:bg-muted/50"
                                >
                                    <td className="p-3">
                                        {customer.fullname || customer.companyName}
                                    </td>
                                    <td className="p-3 text-center">{customer.documentNumber}</td>
                                    <td className="p-3 text-center">{customer.email}</td>
                                    <td className="p-3 text-center">{customer.cellphone}</td>
                                    <td className="p-3 text-center">
                                        <CustomerStatusBadge status={ customer.customerStatus } />
                                    </td>
                                    <td className="p-3 text-center">
                                        {customer.lastBooking
                                            ? format(new Date(customer.lastBooking), "dd/MM/yyyy")
                                            : "Não informado"}
                                    </td>
                                    <td className="p-3 flex justify-center items-center gap-4">
                                        <Button
                                            onClick={ () =>
                                                handleToggleCustomerDetailsDialog(true, customer)
                                            }
                                        >
                                            <Eye />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={ () =>
                                                handleToggleUpdateCustomerDialog(true, customer)
                                            }
                                        >
                                            <Pencil />
                                        </Button>
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

            {customers &&
        customers.map((customer) => (
            <Fragment key={ customer.customerId }>
                <ResponsiveCard
                    cardData={ {
                        id: customer.customerId,
                        title: customer.fullname || customer.companyName || "",
                        description: "",
                        items: [
                            {
                                itemLabel: "Email: ",
                                itemInfo: customer.email || "Não informado",
                            },
                            {
                                itemLabel: "Telefone: ",
                                itemInfo: customer.cellphone || "Não informado",
                            },
                            { itemLabel: "Status: ", itemInfo: customer.customerStatus },
                            {
                                itemLabel: "Ultimo registro:",
                                itemInfo: customer.lastBooking
                                    ? format(new Date(customer.lastBooking), "dd/MM/yyyy")
                                    : "Não informado",
                            },
                        ],
                    } }
                    rawData={ customer }
                    handleToggleDialog={ handleToggleCustomerDetailsDialog }
                />
            </Fragment>
        ))}

            {!customers || customers.length === 0 && (
                <h1 className="w-full text-center">Nada a mostrar aqui</h1>
            )}

            <CustomerDetailsDialog
                selectedCustomer={ selectedCustomer }
                handleToggleUpdateCustomerDialog={ handleToggleUpdateCustomerDialog }
                handleToggleCustomerDetailsDialog={ handleToggleCustomerDetailsDialog }
                isCustomerDetailsModalOpen={ isCustomerDetailsDialogOpen }
            />

            <UpdateCustomerDialog
                isUpdateCustomerDialogOpen={ isUpdateCustomerDialogOpen }
                selectedCustomer={ selectedCustomer! }
                setSelectedCustomer={ setSelectedCustomer }
                handleToggleUpdateCustomerDialog={ handleToggleUpdateCustomerDialog }
            />
        </>
    );
}
