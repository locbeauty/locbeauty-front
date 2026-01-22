import { UpdateTrainingPayload } from "@/components/pages/trainings/TrainingPaymentMethodDialog";
import { apiRequest } from "@/lib/api";
import { CreateTrainingDataType, CreateTrainingBackendPayload } from "@/lib/zod/CreateTrainingValidation";
import { UpdateCustomerFormSchemaType } from "@/lib/zod/UpdateCustomerValidation";
import { Training } from "@/utils/@types/training";

interface UpdateTrainingRequest {
    trainingId: string;
    body: UpdateTrainingPayload;
}

export async function GetAllTrainings() {
  const response = await apiRequest<Training[]>({ endpoint: "trainings" });
  return response;
}
export async function CreateTraining(body: CreateTrainingBackendPayload) {
  const response = await apiRequest({ endpoint: "trainings/create", method: "POST", body });

  return response;
}

export async function UpdateTraining({ trainingId, body }: UpdateTrainingRequest) {
  // O Controller espera o ID nos params (URL), ex: /trainings/cl123...
  const response = await apiRequest<Training>({
    endpoint: `trainings/update/${trainingId}`,
    method: "POST", // Mudamos para PUT para bater com a semântica de Update
    body
  });

  return response;
}