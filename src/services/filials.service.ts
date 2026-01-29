import { apiRequest } from "@/lib/api";
import { Filial } from "@/utils/@types/filials";

export async function findAllFilials(isVisible?: string) {
  const queryParams = isVisible ? { isVisible } : undefined;
  const response = await apiRequest<Filial[]>({
    endpoint: "filials",
    queryParams,
  });
  if (response.statusCode !== 200) throw new Error(response.message);
  return response.data!;
}

export async function DeleteFilial(filialId: string) {
  const response = await apiRequest({
    endpoint: `filials/${filialId}`,
    method: "DELETE",
  });
  return response;
}
