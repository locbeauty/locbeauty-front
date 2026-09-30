import { apiRequest } from "@/lib/api";
import { CreateGoalDataWithMoneyInCents } from "@/lib/zod/CreateGoalValidation";
import { Goal } from "@/utils/@types/goals";

export async function GetAllGoals({
  isVisible,
}: {
  isVisible?: string;
}): Promise<Goal[]> {
  const queryParams: Record<string, string> = {};
  if (isVisible) queryParams.isVisible = isVisible;

  const response = await apiRequest<Goal[]>({
    endpoint: "goals",
    queryParams,
  });

  // Lança em vez de devolver []: o react-query guardaria a lista vazia como
  // sucesso e apagaria as metas já carregadas.
  if (response.statusCode !== 200) throw new Error(response.message);

  return response.data ?? [];
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
