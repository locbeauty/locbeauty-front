import { apiRequest, ApiResponse } from "@/lib/api";
import { Notice } from "@/utils/@types/notice";

interface CreateNoticeInput {
  description: string;
  filialId?: string;
  startDate: Date | string;
  endDate: Date | string;
  startHourInMinutes: number;
  endHourInMinutes: number;
}

interface GetNoticesInput {
  filialId?: string;
  startDate?: string;
  endDate?: string;
  filterByStartDateOnly?: boolean;
}

export async function CreateNotice(
  data: CreateNoticeInput,
): Promise<ApiResponse<Notice>> {
  const response = await apiRequest<Notice>({
    endpoint: "notices/create",
    method: "POST",
    body: data,
  });
  return response;
}

export async function GetNotices({
  filialId,
  startDate,
  endDate,
  filterByStartDateOnly,
}: GetNoticesInput): Promise<ApiResponse<Notice[]>> {
  const queryParams: Record<string, string> = {};

  if (startDate) {
    queryParams.startDate = startDate;
  }

  if (endDate) {
    queryParams.endDate = endDate;
  }

  if (filialId) {
    queryParams.filialId = filialId;
  }

  if (filterByStartDateOnly) {
    queryParams.filterByStartDateOnly = "true";
  }

  const response = await apiRequest<Notice[]>({
    endpoint: "notices",
    method: "GET",
    queryParams,
  });
  return response;
}
