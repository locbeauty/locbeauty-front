import { apiRequest } from "@/lib/api";
import { CreateTraineeFormDataType } from "@/lib/zod/CreateTraineeValidation";
import { Trainee } from "@/utils/@types/trainee";

export async function GetAllTrainees() {
    const response = await apiRequest<Trainee[]>({ endpoint: "trainees" });
    return response;
}
export async function CreateTrainee(body: CreateTraineeFormDataType) {
    const response = await apiRequest({
        endpoint: "trainees/create",
        method: "POST",
        body,
    });

    return response;
}

// export async function UpdateCustomer({ body, queryParams }: {body: UpdateCustomerFormSchemaType, queryParams?: Record<string, string>}) {
//     const response = await apiRequest<Customer[]>({ endpoint: "customers/update", method: "POST", body, queryParams });

//     return response;
// }
