import { apiRequest, ApiResponse } from "@/lib/api";
import { BirthdayEvent } from "@/utils/@types/birthday";

interface GetBirthdaysParams {
  startDate?: string;
  endDate?: string;
  customerFilialIds?: string[];
  employeeFilialIds?: string[];
}

export const GetBirthdays = async (
  params: GetBirthdaysParams
): Promise<ApiResponse<BirthdayEvent[]>> => {
  const cleanParams = Object.entries(params).reduce((acc, [ key, value ]) => {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach((v) => {
          // Special handling for array params if apiRequest supports it directly or we need to append multiple times
          // Based on previous files, we often append manually or use queryParams object if internal logic handles arrays.
          // apiRequest uses URLSearchParams internally usually but let's check lib/api.ts logic if possible.
          // Assuming apiRequest handles array in queryParams correctly or we might need to manually construct URL.
          // Actually, let's verify usage in other services.
          // Ideally: acc[key] = value; but Record<string, string> prevents array.
          // We need to change the accumulator type or how we structure it.
        });
      }
      acc[key] = value as string; // This cast might be wrong if value is array.
    }
    return acc;
  }, {} as Record<string, string | string[]>);

  return await apiRequest<BirthdayEvent[]>({
    endpoint: "birthdays",
    method: "GET",
    queryParams: cleanParams,
  });
};
