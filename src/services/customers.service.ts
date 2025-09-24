import { apiRequest } from "@/lib/api";
import { CreateCustomerFormSchemaType } from "@/lib/zod/CreateCustomerValidation";
import { UpdateCustomerFormSchemaType } from "@/lib/zod/UpdateCustomerValidation";
import { Customer } from "@/utils/@types/customer";

export async function CreateCustomer(body: CreateCustomerFormSchemaType) {
    const response = await apiRequest({ endpoint: "customers/create", method: "POST", body });

    return response;
}

export async function UpdateCustomer({ body, queryParams }: {body: UpdateCustomerFormSchemaType, queryParams?: Record<string, string>}) {
    const response = await apiRequest<Customer[]>({ endpoint: "customers/update", method: "POST", body, queryParams });

    return response;
}

export async function GetAllCustomers() {
    const response = await apiRequest<Customer[]>({ endpoint: "customers" });
    return response;
}
