import { apiRequest } from "@/lib/api";
import { CreateTrainingDataType } from "@/lib/zod/CreateTrainingValidation";
import { Gear } from "@/utils/@types/gears";
import { Training } from "@/utils/@types/training";

export async function GetAllGears({
  filialId,
}: {
  filialId?: string | undefined;
}) {
  const response = await apiRequest<Gear[]>({
    endpoint: "gears",
    queryParams: filialId ? { filialIds: filialId } : {},
  });

  return response;
}
