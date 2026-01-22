import { apiRequest } from "@/lib/api";
import { CreateVolunteerFormDataType } from "@/lib/zod/CreateVolunteerValidation";
import { Volunteer } from "@/utils/@types/volunteer";

export async function GetAllVolunteers(queryParams?: Record<string, string>) {
  const response = await apiRequest<Volunteer[]>({
    endpoint: "volunteers",
    queryParams,
  });
  return response;
}
export async function CreateVolunteer(body: CreateVolunteerFormDataType) {
  const response = await apiRequest({
    endpoint: "volunteers/create",
    method: "POST",
    body,
  });

  return response;
}

// export async function UpdateCustomer({ body, queryParams }: {body: UpdateCustomerFormSchemaType, queryParams?: Record<string, string>}) {
//     const response = await apiRequest<Customer[]>({ endpoint: "customers/update", method: "POST", body, queryParams });

//     return response;
// }
