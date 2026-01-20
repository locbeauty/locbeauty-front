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

export async function getBookingsPerMachineMetric({
  gearId,
  month,
  year,
}: {
  gearId: string;
  month: number;
  year: number;
}): Promise<{ count: number }> {
  const { data } = await apiRequest<{ count: number }>({
    endpoint: "dashboard/metrics/bookings-per-machine",
    method: "GET",
    queryParams: {
      gearId,
      month: String(month),
      year: String(year),
    },
  });

  if (!data) {
    throw new Error("Failed to fetch bookings metric");
  }

  return data;
}

export async function getYearlyBookingsPerMachineMetric({
  gearId,
  filialId,
  year,
}: {
  gearId?: string;
  filialId?: string;
  year: number;
}): Promise<{ yearlyData: { month: number; count: number }[] }> {
  const queryParams: Record<string, string | number> = {
    year: String(year),
  };

  if (gearId) {
    queryParams.gearId = gearId;
  }
  if (filialId) {
    queryParams.filialId = filialId;
  }

  const { data } = await apiRequest<{
    yearlyData: { month: number; count: number }[];
  }>({
    endpoint: "dashboard/metrics/bookings-per-machine/yearly",
    method: "GET",
    queryParams,
  });

  if (!data) {
    throw new Error("Failed to fetch yearly bookings metric");
  }

  return data;
}

export async function getYearlyRevenueMetric({
  year,
}: {
  year: number;
}): Promise<{ revenueData: { month: number; total: number }[] }> {
  const { data } = await apiRequest<{
    revenueData: { month: number; total: number }[];
  }>({
    endpoint: "dashboard/metrics/revenue/yearly",
    method: "GET",
    queryParams: {
      year: String(year),
    },
  });

  if (!data) {
    throw new Error("Failed to fetch yearly revenue metric");
  }

  return data;
}
