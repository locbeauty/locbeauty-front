import { apiRequest } from "@/lib/api";
import { CreateGoalDataWithMoneyInCents } from "@/lib/zod/CreateGoalValidation";
import { Goal } from "@/utils/@types/goals";

export async function GetAllGoals({
  filialId,
  isVisible,
}: {
  filialId?: string;
  isVisible?: string;
}): Promise<Goal[]> {
  const queryParams: Record<string, string> = {};
  if (filialId) queryParams.filialId = filialId;
  if (isVisible) queryParams.isVisible = isVisible;

  const response = await apiRequest<Goal[]>({
    endpoint: "goals",
    queryParams,
  });

  if (!response.data) return [];

  return response.data;
}

export async function CreateGoal(body: CreateGoalDataWithMoneyInCents) {
  const response = await apiRequest({
    endpoint: "goals/create",
    method: "POST",
    body,
  });

  return response;
}

export async function DeleteGoal(goalId: string) {
  const response = await apiRequest({
    endpoint: `goals/${goalId}`,
    method: "DELETE",
  });
  return response;
}
