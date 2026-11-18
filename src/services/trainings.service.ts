import { UpdateTrainingPayload } from "@/components/pages/trainings/TrainingPaymentMethodDialog";
import { apiRequest } from "@/lib/api";
import { CreateTrainingBackendPayload } from "@/lib/zod/CreateTrainingValidation";
import { Training, TrainingValueChange } from "@/utils/@types/training";

interface UpdateTrainingRequest {
  trainingId: string;
  body: Partial<UpdateTrainingPayload>;
}

export async function GetCustomerTrainings(customerId: string) {
  const response = await apiRequest<Training[]>({
    endpoint: "trainings/customer",
    queryParams: { customerId },
  });
  return response;
}

export async function GetTrainingById(trainingId: string) {
  const response = await apiRequest<Training>({
    endpoint: `trainings/${trainingId}`,
  });
  return response;
}

export async function GetAllTrainings(
  isVisible?: string,
  filialId?: string,
  /** Várias filiais (filtro da agenda); o servidor inclui as vinculadas. */
  filialIds?: string[],
) {
  const queryParams: Record<string, string | string[]> = {};
  if (isVisible) queryParams.isVisible = isVisible;
  if (filialIds && filialIds.length > 0) queryParams.filialIds = filialIds;
  else if (filialId) queryParams.filialID = filialId;

  const response = await apiRequest<Training[]>({
    endpoint: "trainings",
    queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  });
  return response;
}
export async function CreateTraining(body: CreateTrainingBackendPayload) {
  const response = await apiRequest({
    endpoint: "trainings/create",
    method: "POST",
    body,
  });

  return response;
}

export async function UpdateTraining({
  trainingId,
  body,
}: UpdateTrainingRequest) {
  // O Controller espera o ID nos params (URL), ex: /trainings/cl123...
  const response = await apiRequest<Training>({
    endpoint: `trainings/update/${trainingId}`,
    method: "POST", // Mudamos para PUT para bater com a semântica de Update
    body,
  });

  return response;
}

export async function GetTrainingValueChanges(trainingId: string) {
  return apiRequest<TrainingValueChange[]>({
    endpoint: `trainings/${trainingId}/value-changes`,
  });
}

export async function DeleteTraining(trainingId: string) {
  const response = await apiRequest({
    endpoint: `trainings/${trainingId}`,
    method: "DELETE",
  });
  return response;
}
