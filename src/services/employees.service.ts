import { apiRequest, ApiResponse } from "@/lib/api";
import { CreateCustomerFormSchemaType } from "@/lib/zod/CreateCustomerValidation";
import { UpdateCustomerFormSchemaType } from "@/lib/zod/UpdateCustomerValidation";
import { Customer } from "@/utils/@types/customer";
import { Employee } from "@/utils/@types/employee";
import { ROLES } from "@/utils/@types/roles";

// export async function CreateCustomer(body: CreateCustomerFormSchemaType) {
//     const response = await apiRequest({ endpoint: "customers/create", method: "POST", body });

//     return response;
// }

// export async function UpdateCustomer({ body, queryParams }: {body: UpdateCustomerFormSchemaType, queryParams?: Record<string, string>}) {
//     const response = await apiRequest<Customer[]>({ endpoint: "customers/update", method: "POST", body, queryParams });

//     return response;
// }

export async function GetAllEmployees({
  employeeRole,
  filialId,
  page,
  limit,
  isVisible,
}: {
  employeeRole?: ROLES | undefined;
  filialId?: string;
  page?: number;
  limit?: number;
  isVisible?: string;
}) {
  const queryParams: Record<string, string> = {};

  if (employeeRole) queryParams.employeeRole = employeeRole;
  if (filialId) queryParams.filialId = filialId;
  if (page) queryParams.page = page.toString();
  if (limit) queryParams.limit = limit.toString();
  if (isVisible) queryParams.isVisible = isVisible;

  const response = await apiRequest<
    { items: Employee[]; total: number } | Employee[]
  >({ endpoint: "employees", queryParams });
  return response;
}

export async function DeleteEmployee(employeeId: string) {
  const response = await apiRequest({
    endpoint: `employees/${employeeId}`,
    method: "DELETE",
  });
  return response;
}

export async function UpdateEmployee({
  employeeId,
  data,
}: {
  employeeId: string;
  data: Partial<Employee>;
}) {
  const response = await apiRequest<{
    message: string;
    employee: Employee;
  }>({
    endpoint: `employees/update/${employeeId}`,
    method: "POST",
    body: data,
  });
  return response;
}
