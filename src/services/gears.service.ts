import { apiRequest } from "@/lib/api";
import { CreateTrainingDataType } from "@/lib/zod/CreateTrainingValidation";
import { Gear } from "@/utils/@types/gears";
import { Training } from "@/utils/@types/training";

export async function GetAllGears({
  filialId,
  filialIds,
  isVisible,
}: {
  filialId?: string | undefined;
  /** Restringe às filiais informadas (o backend aceita o param repetido). */
  filialIds?: string[];
  isVisible?: string;
}) {
  const queryParams: Record<string, string | string[]> = {};
  if (filialIds && filialIds.length > 0) {
    queryParams.filialIds = filialIds;
  } else if (filialId) {
    queryParams.filialIds = filialId;
  }
  if (isVisible) queryParams.isVisible = isVisible;

  const response = await apiRequest<Gear[]>({
    endpoint: "gears",
    queryParams,
  });

  return response;
}

export async function DeleteGear(gearId: string) {
  const response = await apiRequest({
    endpoint: `gears/${gearId}`,
    method: "DELETE",
  });
  return response;
}
export async function UpdateGear({
  gearId,
  data,
}: {
  gearId: string;
  data: Partial<Gear>;
}) {
  const response = await apiRequest<{
    message: string;
    gear: Gear;
  }>({
    endpoint: `gears/update?gearId=${gearId}`,
    method: "POST",
    body: data,
  });
  return response;
}
