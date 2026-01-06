import { apiRequest } from "@/lib/api";
import { CreateGoalDataWithMoneyInCents } from "@/lib/zod/CreateGoalValidation";
import { Goal } from "@/utils/@types/goals";

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

