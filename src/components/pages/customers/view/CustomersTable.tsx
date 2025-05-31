"use client";
import { CustomerStatusBadge } from "@/components/shared/CustomerStatusBadge";
import { ResponsiveCard } from "@/components/shared/ResponsiveCard";
import { Customer, mockCustomers } from "@/utils/mocks/customers";
import { Eye, Pencil } from "lucide-react";
import { Fragment, useState } from "react";
import { UpdateCustomerDialog } from "../update/UpdateCustomerDialog";
import { CustomerDetailsDialog } from "./CustomerDetailsDialog";
import { Button } from "@/components/ui/button";

export function CustomersTable() {
    const [ customers ] = useState<Customer[]>(mockCustomers);

    const [ isUpdateCustomerDialogOpen, setIsUpdateCustomerDialogOpen ] = useState(false);
    const [ selectedCustomer, setSelectedCustomer ] = useState<Customer | null>(null);

    const [ isCustomerDetailsDialogOpen, setIsCustomerDetailsDialogOpen ] = useState(false);

    const handleToggleUpdateCustomerDialog = (openStatus: boolean, customer: Customer | null) => {
        if(openStatus) {
            setSelectedCustomer(customer);
        }

        setIsUpdateCustomerDialogOpen(openStatus);
    };

    const handleToggleCustomerDetailsDialog = (openStatus: boolean, customer: Customer | null) => {
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
                            <th className="text-center p-3 font-medium">Tipo</th>
                            <th className="text-center p-3 font-medium">Email</th>
                            <th className="text-center p-3 font-medium">Telefone</th>
                            <th className="text-center p-3 font-medium">Status</th>
                            <th className="text-center p-3 font-medium">Último Registro</th>
                            <th className="text-center p-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            customers.map(customer => (

                                <tr key={ customer.customerId } className="border-t hover:bg-muted/50">
                                    <td className="p-3">{customer.fullname || customer.companyName}</td>
                                    <td className="p-3 text-center">{customer.personType === "PF" ? customer.CPF : customer.CNPJ}</td>
                                    <td className="p-3 text-center">{customer.personType}</td>
                                    <td className="p-3 text-center">{customer.email}</td>
                                    <td className="p-3 text-center">{customer.cellphone}</td>
                                    <td className="p-3 text-center">
                                        <CustomerStatusBadge status={ customer.status } />
                                    </td>
                                    <td className="p-3 text-center">{customer.lastRecord.toLocaleDateString()}</td>
                                    <td className="p-3 flex justify-center items-center gap-4">
                                        <Button onClick={ () => handleToggleCustomerDetailsDialog(true, customer) }>
                                            <Eye />
                                        </Button>
                                        <Button variant="outline" onClick={ () => handleToggleUpdateCustomerDialog(true, customer) }>
                                            <Pencil />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>

            {customers.map((customer) => (
                <Fragment key={ customer.customerId }>
                    <ResponsiveCard
                        cardData={ {
                            id: customer.customerId,
                            title: customer.fullname || customer.companyName || "",
                            description: "",
                            items: [
                                { itemLabel: "Email: ", itemInfo: customer.email },
                                {
                                    itemLabel: "Telefone: ",
                                    itemInfo: customer.cellphone,
                                },
                                { itemLabel: "Status: ", itemInfo: customer.status },
                                {
                                    itemLabel: "Ultimo registro:",
                                    itemInfo: customer.lastRecord.toLocaleDateString(),
                                },
                            ],
                        } }
                        rawData={ customer }
                        handleToggleDialog={ handleToggleCustomerDetailsDialog }
                    />
                </Fragment>
            ))}

            <CustomerDetailsDialog
                selectedCustomer={ selectedCustomer }
                handleToggleUpdateCustomerDialog={ handleToggleUpdateCustomerDialog }
                handleToggleCustomerDetailsDialog={ handleToggleCustomerDetailsDialog }
                isCustomerDetailsModalOpen={ isCustomerDetailsDialogOpen } />

            <UpdateCustomerDialog
                isUpdateCustomerDialogOpen={ isUpdateCustomerDialogOpen }
                selectedCustomer={ selectedCustomer! }
                setSelectedCustomer={ setSelectedCustomer }
                handleToggleUpdateCustomerDialog={ handleToggleUpdateCustomerDialog }
            />

        </>
    );
}