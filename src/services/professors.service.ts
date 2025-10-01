import { apiRequest } from "@/lib/api";
import { CreateProfessorFormDataType } from "@/lib/zod/CreateProfessorValidation";
import { Professor } from "@/utils/@types/professor";

export async function GetAllProfessors() {
    const response = await apiRequest<Professor[]>({ endpoint: "professors" });
    return response;
}
export async function CreateProfessor(body: CreateProfessorFormDataType) {
    const response = await apiRequest({ endpoint: "professors/create", method: "POST", body });

    return response;
}

// export async function UpdateCustomer({ body, queryParams }: {body: UpdateCustomerFormSchemaType, queryParams?: Record<string, string>}) {
//     const response = await apiRequest<Customer[]>({ endpoint: "customers/update", method: "POST", body, queryParams });

//     return response;
// }

