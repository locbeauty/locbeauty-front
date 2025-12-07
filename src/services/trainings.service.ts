import { apiRequest } from "@/lib/api";
import { CreateTrainingDataType, CreateTrainingBackendPayload } from "@/lib/zod/CreateTrainingValidation";
import { Training } from "@/utils/@types/training";

export async function GetAllTrainings() {
    const response = await apiRequest<Training[]>({ endpoint: "trainings" });
    return response;
}
export async function CreateTraining(body: CreateTrainingBackendPayload) {
    const response = await apiRequest({ endpoint: "trainings/create", method: "POST", body });

    return response;
}

// export async function UpdateTraining({ body, queryParams }: {body: UpdateCustomerFormSchemaType, queryParams?: Record<string, string>}) {
//     const response = await apiRequest<Training[]>({ endpoint: "customers/update", method: "POST", body, queryParams });

//     return response;
// }

