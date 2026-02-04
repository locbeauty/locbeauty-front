import { apiRequest } from "@/lib/api";
import { CreateCustomerFormSchemaType } from "@/lib/zod/CreateCustomerValidation";
import { UpdateCustomerFormSchemaType } from "@/lib/zod/UpdateCustomerValidation";
import { Customer } from "@/utils/@types/customer";

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

  const response = await apiRequest<{ items: Customer[]; total: number }>({
    endpoint: "customers",
    queryParams,
  });
  return response;
}

export async function ImportCustomers(formData: FormData) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/customers/import`,
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
