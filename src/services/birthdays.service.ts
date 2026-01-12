import { apiRequest, ApiResponse } from "@/lib/api";
import { BirthdayEvent } from "@/utils/@types/birthday";

interface GetBirthdaysParams {
  startDate?: string;
  endDate?: string;
}

export const GetBirthdays = async (
  params: GetBirthdaysParams
): Promise<ApiResponse<BirthdayEvent[]>> => {
  const cleanParams = Object.entries(params).reduce((acc, [ key, value ]) => {
    if (value) acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  return await apiRequest<BirthdayEvent[]>({
    endpoint: "birthdays",
    method: "GET",
    queryParams: cleanParams,
  });
};
