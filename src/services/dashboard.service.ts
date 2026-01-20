import { apiRequest } from "@/lib/api";

export interface GetTotalRevenueResponse {
  totalRevenue: number;
}

export interface GetTotalRevenueParams {
  month: number;
  year: number;
}

export async function getTotalRevenue({
  month,
  year,
}: GetTotalRevenueParams): Promise<GetTotalRevenueResponse> {
  const { data } = await apiRequest<GetTotalRevenueResponse>({
    endpoint: "dashboard/metrics/revenue",
    queryParams: {
      month,
      year,
    },
  });

  if (!data) {
    throw new Error("Failed to fetch total revenue");
  }

  return data;
}

export async function getAvailableYears() {
  const { data } = await apiRequest<{ years: number[] }>({
    endpoint: "dashboard/available-years",
    method: "GET",
  });

  if (!data) {
    throw new Error("Failed to fetch available years");
  }

  return data;
}
