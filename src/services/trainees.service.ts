import { apiRequest } from "@/lib/api";
import {
  CreateCustomerFormSchemaType,
  createCustomerFormSchema,
} from "@/lib/zod/CreateCustomerValidation";
import { UpdateCustomerFormSchemaType } from "@/lib/zod/UpdateCustomerValidation";
import { Customer } from "@/utils/@types/customer";

export async function GetAllTrainees(queryParams?: Record<string, string>) {
  // Add isTrainee=true to queryParams
  const params = { ...queryParams, isTrainee: "true" };
  const response = await apiRequest<{ items: Customer[]; total: number }>({
    endpoint: "customers",
    queryParams: params,
  });

  // Transform to match old signature: data should be Customer[]
  return {
    ...response,
    data: response.data?.items || [],
  };
}

export async function CreateTrainee(body: CreateCustomerFormSchemaType) {
  const response = await apiRequest({
    endpoint: "customers/create",
    method: "POST",
    body,
  });

  return response;
}

export async function DeleteTrainee(traineeId: string) {
  const response = await apiRequest({
    endpoint: `customers/${traineeId}`,
    method: "DELETE",
  });
  return response;
}

export type UpdateTraineeBody = UpdateCustomerFormSchemaType & {
  customerId: string;
};

export async function UpdateTrainee(body: UpdateTraineeBody) {
  const response = await apiRequest({
    endpoint: "customers/update",
    method: "POST",
    body,
  });

  return response;
}
