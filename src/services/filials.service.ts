import { apiRequest } from "@/lib/api";
import { Filial, FilialStats } from "@/utils/@types/filials";

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
  const response = await apiRequest<void>({
    endpoint: `filials/${filialId}`,
    method: "DELETE",
  });
  return response;
}

export async function UpdateFilial({
  filialId,
  data,
}: {
  filialId: string;
  data: Partial<Filial>;
}) {
  const response = await apiRequest<{
    message: string;
    filial: Filial;
  }>({
    endpoint: `filials/update/${filialId}`,
    method: "POST",
    body: data,
  });
  return response;
}

export async function getFilialStats(filialId: string) {
  const response = await apiRequest<FilialStats>({
    endpoint: `filials/${filialId}/stats`,
  });
  if (response.statusCode !== 200) throw new Error(response.message);
  return response.data!;
}
