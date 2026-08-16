import { apiRequest } from "@/lib/api";
import { CreateCustomerFormSchemaType } from "@/lib/zod/CreateCustomerValidation";
import { UpdateCustomerFormSchemaType } from "@/lib/zod/UpdateCustomerValidation";
import { Customer } from "@/utils/@types/customer";
import { CustomerSegment } from "@/utils/customer-segments";

export async function CreateCustomer(body: CreateCustomerFormSchemaType) {
  const response = await apiRequest({
    endpoint: "customers/create",
    method: "POST",
    body,
  });

  return response;
}

export async function UpdateCustomer({
  body,
  queryParams,
}: {
  body: UpdateCustomerFormSchemaType;
  queryParams?: Record<string, string>;
}) {
  const response = await apiRequest<Customer[]>({
    endpoint: "customers/update",
    method: "POST",
    body,
    queryParams,
  });

  return response;
}

/**
 * Promove um cliente já existente a aluno (isTrainee=true), preservando o papel
 * de cliente (isCustomer permanece como está). Usado após o usuário confirmar a
 * conversão quando um CPF/CNPJ já cadastrado é inscrito como aluno.
 */
export async function PromoteCustomerToTrainee({
  customerId,
  birthdate,
}: {
  customerId: string;
  birthdate?: Date | null;
}) {
  const response = await apiRequest({
    endpoint: "customers/update",
    method: "POST",
    queryParams: { customerId },
    body: {
      isTrainee: true,
      ...(birthdate ? { birthdate } : {}),
    },
  });

  return response;
}

export interface GetAllCustomersFilters {
  name?: string;
  email?: string;
  document?: string;
  phone?: string;
  filialId?: string;
  isVisible?: string;
  status?: "Ativo" | "Inativo" | "Inadimplente" | "Bloqueado";
  isTrainee?: boolean;
  includeAllTrainees?: boolean;
  /** Segmento de acompanhamento (novos do mês, sem retorno etc.). */
  segment?: CustomerSegment;
  /** Mês de referência do segmento, 1-12. Sem ele, vale o mês corrente. */
  referenceMonth?: number;
  /** Ano de referência do segmento. Sem ele, vale o ano corrente. */
  referenceYear?: number;
}

export async function GetAllCustomers(
  filters?: GetAllCustomersFilters,
  pagination?: { page: number; limit: number },
) {
  const queryParams: Record<string, string> = {
    ...(filters as unknown as Record<string, string>),
    ...(pagination
      ? { page: String(pagination.page), limit: String(pagination.limit) }
      : {}),
  };

  if (filters?.isTrainee !== undefined) {
    queryParams.isTrainee = String(filters.isTrainee);
  }

  if (filters?.referenceMonth !== undefined) {
    queryParams.referenceMonth = String(filters.referenceMonth);
  }

  if (filters?.referenceYear !== undefined) {
    queryParams.referenceYear = String(filters.referenceYear);
  }

  const response = await apiRequest<{ items: Customer[]; total: number }>({
    endpoint: "customers",
    queryParams,
  });
  return response;
}

export interface ImportCustomersResult {
  successCount?: number;
  failedCount?: number;
  skippedCount?: number;
  skipped?: string[];
  errors?: string[];
  validCount?: number;
  dryRun?: boolean;
  batchId?: string;
  message?: string;
  statusCode?: number;
}

export async function ImportCustomers(
  formData: FormData,
): Promise<ImportCustomersResult> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/customers/import`,
      {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      },
    );

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Network error:", err);
    return { statusCode: 0, message: "Network error" };
  }
}

export async function DeleteCustomer(customerId: string) {
  const response = await apiRequest({
    endpoint: `customers/${customerId}`,
    method: "DELETE",
  });
  return response;
}
export async function HardDeleteCustomer(customerId: string) {
  const response = await apiRequest({
    endpoint: `customers/${customerId}/hard`,
    method: "DELETE",
  });
  return response;
}
