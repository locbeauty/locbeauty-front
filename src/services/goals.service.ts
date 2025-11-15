import { apiRequest, ApiResponse } from "@/lib/api";
import { CreateCheckoutValidationWithMoneyInCents } from "@/lib/zod/CreateBookingValidation";
import { CreateGoalDataType, CreateGoalDataWithMoneyInCents } from "@/lib/zod/CreateGoalValidation";
import { CreateTrainingDataType } from "@/lib/zod/CreateTrainingValidation";
import { Gear } from "@/utils/@types/gears";
import { Goal } from "@/utils/@types/goals";
import { Training } from "@/utils/@types/training";

// export async function GetAllGoals({ filialId }: {filialId?: string | undefined}) {
//     const response = await apiRequest<Goal[]>({ endpoint: "goals", queryParams: filialId ? { filialId } : {}  });
//     return response.data;
// }
export async function GetAllGoals({ filialId }: { filialId?: string }): Promise<Goal[]> {
    const response = await apiRequest<Goal[]>({
        endpoint: "goals",
        queryParams: filialId ? { filialId } : {},
    });

    if(!response.data) return [];

    return response.data;
}

export async function CreateGoal(body: CreateGoalDataWithMoneyInCents) {
    const response = await apiRequest({ endpoint: "goals/create", method: "POST", body });

    return response;
}

// export async function UpdateCustomer({ body, queryParams }: {body: UpdateCustomerFormSchemaType, queryParams?: Record<string, string>}) {
//     const response = await apiRequest<Customer[]>({ endpoint: "customers/update", method: "POST", body, queryParams });

//     return response;
// }

