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
  filialId,
}: {
  year: number;
  filialId?: string;
}): Promise<{ revenueData: { month: number; total: number }[] }> {
  const queryParams: Record<string, string | number> = {
    year: String(year),
  };

  if (filialId) {
    queryParams.filialId = filialId;
  }

  const { data } = await apiRequest<{
    revenueData: { month: number; total: number }[];
  }>({
    endpoint: "dashboard/metrics/revenue/yearly",
    method: "GET",
    queryParams,
  });

  if (!data) {
    throw new Error("Failed to fetch yearly revenue metric");
  }

  return data;
}

export async function getFilialBookingsRanking({
  year,
}: {
  year: number;
}): Promise<{ ranking: { filialName: string; count: number }[] }> {
  const { data } = await apiRequest<{
    ranking: { filialName: string; count: number }[];
  }>({
    endpoint: "dashboard/metrics/filial-bookings-ranking",
    method: "GET",
    queryParams: {
      year: String(year),
    },
  });

  if (!data) {
    throw new Error("Failed to fetch filial ranking");
  }

  return data;
}

export async function getDefaultsMetric({
  month,
  year,
}: {
  month: number;
  year: number;
}): Promise<{ count: number; percentageChange: number }> {
  const { data } = await apiRequest<{
    count: number;
    percentageChange: number;
  }>({
    endpoint: "dashboard/metrics/defaults",
    method: "GET",
    queryParams: {
      month: String(month),
      year: String(year),
    },
  });

  if (!data) {
    throw new Error("Failed to fetch defaults metric");
  }

  return data;
}

export async function getInactiveClientsMetric(filialId?: string): Promise<{
  count: number;
  percentageChange: number;
}> {
  const queryParams: Record<string, string> = {};
  if (filialId && filialId !== "all") {
    queryParams.filialId = filialId;
  }

  const { data } = await apiRequest<{
    count: number;
    percentageChange: number;
  }>({
    endpoint: "dashboard/metrics/inactive-clients",
    method: "GET",
    queryParams,
  });

  if (!data) {
    throw new Error("Failed to fetch inactive clients metric");
  }

  return data;
}

export async function getActiveClientsMetric(filialId?: string): Promise<{
  count: number;
  percentageChange: number;
}> {
  const queryParams: Record<string, string> = {};
  if (filialId && filialId !== "all") {
    queryParams.filialId = filialId;
  }

  const { data } = await apiRequest<{
    count: number;
    percentageChange: number;
  }>({
    endpoint: "dashboard/metrics/active-clients",
    method: "GET",
    queryParams,
  });

  if (!data) {
    throw new Error("Failed to fetch active clients metric");
  }

  return data;
}

export async function getCityRankingMetric({
  year,
  filialId,
}: {
  year: number;
  filialId?: string;
}): Promise<{ ranking: { city: string; count: number }[] }> {
  const queryParams: Record<string, string> = {
    year: String(year),
  };

  if (filialId && filialId !== "all") {
    queryParams.filialId = filialId;
  }

  const { data } = await apiRequest<{
    ranking: { city: string; count: number }[];
  }>({
    endpoint: "dashboard/metrics/city-ranking",
    method: "GET",
    queryParams,
  });

  if (!data) {
    throw new Error("Failed to fetch city ranking metric");
  }

  return data;
}
