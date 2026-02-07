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

export async function DeleteVolunteer(volunteerId: string) {
  const response = await apiRequest({
    endpoint: `volunteers/${volunteerId}`,
    method: "DELETE",
  });
  return response;
}

export async function UpdateVolunteer({
  body,
  volunteerId,
}: {
  body: Partial<Volunteer> | any;
  volunteerId: string;
}) {
  const response = await apiRequest({
    endpoint: `volunteers/update/${volunteerId}`,
    method: "POST",
    body,
  });

  return response;
}
