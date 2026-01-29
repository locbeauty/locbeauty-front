import { apiRequest } from "@/lib/api";
import { CreateTraineeFormDataType } from "@/lib/zod/CreateTraineeValidation";
import { Trainee } from "@/utils/@types/trainee";

export async function GetAllTrainees(queryParams?: Record<string, string>) {
  const response = await apiRequest<Trainee[]>({
    endpoint: "trainees",
    queryParams,
  });
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

export async function DeleteTrainee(traineeId: string) {
  const response = await apiRequest({
    endpoint: `trainees/${traineeId}`,
    method: "DELETE",
  });
  return response;
}
