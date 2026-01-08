import { apiRequest } from "@/lib/api";
import { Filial } from "@/utils/@types/filials";

export async function findAllFilials() {
    const response = await apiRequest<Filial[]>({ endpoint: "filials" });
    if (response.statusCode !== 200) throw new Error(response.message);
    return response.data!;
}
