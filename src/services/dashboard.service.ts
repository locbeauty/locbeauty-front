import { apiRequest } from "@/lib/api";

export async function getAvailableYears(): Promise<string[]> {
  const { data } = await apiRequest<{ years: string[] }>({
    endpoint: "dashboard/available-years",
    method: "GET",
  });

  if (!data) {
    throw new Error("Failed to fetch available years");
  }

  return data.years;
}

export async function getYearlyRevenueMetric({
  year,
  filialId,
}: {
  year: number;
  filialId?: string;
}): Promise<{
  revenueData: {
    month: number;
    total: number;
  }[];
}> {
  const queryParams: Record<string, string> = {
    year: String(year),
  };

  if (filialId) {
    queryParams.filialId = filialId;
  }

  const { data } = await apiRequest<{
    revenueData: {
      month: number;
      total: number;
    }[];
  }>({
    endpoint: "dashboard/metrics/revenue/yearly",
    method: "GET",
    queryParams,
  });

  if (!data) {
    throw new Error("Failed to fetch revenue metric");
  }

  return data;
}

export async function getDefaultsMetric({
  month,
  year,
}: {
  month: number;
  year: number;
}): Promise<{
  count: number;
  percentageChange: number;
}> {
  const queryParams = {
    month: String(month),
    year: String(year),
  };

  const { data } = await apiRequest<{
    count: number;
    percentageChange: number;
  }>({
    endpoint: "dashboard/metrics/defaults",
    method: "GET",
    queryParams,
  });

  if (!data) {
    throw new Error("Failed to fetch defaults metric");
  }

  return data;
}

export async function getFilialBookingsRanking({
  year,
}: {
  year: number;
}): Promise<{
  ranking: {
    filialName: string;
    count: number;
    filialId: string;
  }[];
}> {
  const queryParams = {
    year: String(year),
  };

  const { data } = await apiRequest<{
    ranking: {
      filialName: string;
      count: number;
      filialId: string;
    }[];
  }>({
    endpoint: "dashboard/metrics/filial-bookings-ranking",
    method: "GET",
    queryParams,
  });

  if (!data) {
    throw new Error("Failed to fetch filial rankings");
  }

  return data;
}

export async function getYearlyBookingsPerMachineMetric({
  year,
  filialId,
  gearId,
}: {
  year: number;
  filialId?: string;
  gearId?: string;
}): Promise<{
  yearlyData: {
    month: number;
    count: number;
  }[];
}> {
  const queryParams: Record<string, string> = {
    year: String(year),
  };

  if (filialId) {
    queryParams.filialId = filialId;
  }

  if (gearId) {
    queryParams.gearId = gearId;
  }

  const { data } = await apiRequest<{
    yearlyData: {
      month: number;
      count: number;
    }[];
  }>({
    endpoint: "dashboard/metrics/bookings-per-machine/yearly",
    method: "GET",
    queryParams,
  });

  if (!data) {
    throw new Error("Failed to fetch bookings per machine metric");
  }

  return data;
}

export async function getInactiveClientsMetric({
  year,
  filialId,
  startMonth,
  endMonth,
}: {
  year: number;
  filialId?: string;
  startMonth: number;
  endMonth: number;
}): Promise<{
  activeCount: number;
  inactiveCount: number;
  inactivePercentage: number;
  inactiveList: {
    customerId: string;
    customerName: string;
    lastRentalDate: string;
    daysInactive: number;
    totalRentals: number;
  }[];
}> {
  const queryParams: Record<string, string> = {
    year: String(year),
    startMonth: String(startMonth),
    endMonth: String(endMonth),
  };

  if (filialId && filialId !== "all") {
    queryParams.filialId = filialId;
  }

  const { data } = await apiRequest<{
    activeCount: number;
    inactiveCount: number;
    inactivePercentage: number;
    inactiveList: {
      customerId: string;
      customerName: string;
      lastRentalDate: string;
      daysInactive: number;
      totalRentals: number;
    }[];
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

export async function getActiveClientsMetric({
  year,
  filialId,
  startMonth,
  endMonth,
}: {
  year: number;
  filialId?: string;
  startMonth: number;
  endMonth: number;
}): Promise<{
  totalClients: number;
  activeClients: number;
  activePercentage: number;
  newClients: number;
  recurringClients: number;
}> {
  const queryParams: Record<string, string> = {
    year: String(year),
    startMonth: String(startMonth),
    endMonth: String(endMonth),
  };

  if (filialId && filialId !== "all") {
    queryParams.filialId = filialId;
  }

  const { data } = await apiRequest<{
    totalClients: number;
    activeClients: number;
    activePercentage: number;
    newClients: number;
    recurringClients: number;
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
  limit,
}: {
  year: number;
  filialId?: string;
  limit?: number;
}): Promise<{
  cityRanking: {
    city: string;
    state: string;
    count: number;
    percentage: number;
    revenue: number;
  }[];
}> {
  const queryParams: Record<string, string> = {
    year: String(year),
  };

  if (filialId && filialId !== "all") {
    queryParams.filialId = filialId;
  }

  if (limit) {
    queryParams.limit = String(limit);
  }

  const { data } = await apiRequest<{
    cityRanking: {
      city: string;
      state: string;
      count: number;
      percentage: number;
      revenue: number;
    }[];
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

export async function getTopCustomersMetric({
  year,
  filialId,
  limit,
}: {
  year: number;
  filialId?: string;
  limit?: number;
}): Promise<{
  topCustomers: {
    customerId: string;
    fullname: string;
    city: string;
    state: string;
    count: number;
    totalRevenue: number;
    customerStatus: string;
  }[];
}> {
  const queryParams: Record<string, string> = {
    year: String(year),
  };

  if (filialId && filialId !== "all") {
    queryParams.filialId = filialId;
  }

  if (limit) {
    queryParams.limit = String(limit);
  }

  const { data } = await apiRequest<{
    topCustomers: {
      customerId: string;
      fullname: string;
      city: string;
      state: string;
      count: number;
      totalRevenue: number;
      customerStatus: string;
    }[];
  }>({
    endpoint: "dashboard/metrics/top-customers",
    method: "GET",
    queryParams,
  });

  if (!data) {
    throw new Error("Failed to fetch top customers metric");
  }

  return data;
}

export async function getNewClientsMetric({
  year,
  filialId,
}: {
  year: number;
  filialId?: string;
}): Promise<{
  data: { month: number; count: number }[];
}> {
  const queryParams: Record<string, string> = {
    year: String(year),
  };

  if (filialId && filialId !== "all") {
    queryParams.filialId = filialId;
  }

  const { data } = await apiRequest<{
    data: { month: number; count: number }[];
  }>({
    endpoint: "dashboard/metrics/new-clients",
    method: "GET",
    queryParams,
  });

  if (!data) {
    throw new Error("Failed to fetch new clients metric");
  }

  return data;
}

export async function getAverageTicketMetric({
  year,
  filialId,
}: {
  year: number;
  filialId?: string;
}): Promise<{
  data: { month: number; average: number }[];
}> {
  const queryParams: Record<string, string> = {
    year: String(year),
  };

  if (filialId && filialId !== "all") {
    queryParams.filialId = filialId;
  }

  const { data } = await apiRequest<{
    data: { month: number; average: number }[];
  }>({
    endpoint: "dashboard/metrics/average-ticket",
    method: "GET",
    queryParams,
  });

  if (!data) {
    throw new Error("Failed to fetch average ticket metric");
  }

  return data;
}

export async function getClientsAtRiskMetric({
  filialId,
}: {
  filialId?: string;
}): Promise<{
  count: number;
}> {
  const queryParams: Record<string, string> = {};

  if (filialId && filialId !== "all") {
    queryParams.filialId = filialId;
  }

  const { data } = await apiRequest<{
    count: number;
  }>({
    endpoint: "dashboard/metrics/clients-at-risk",
    method: "GET",
    queryParams,
  });

  if (!data) {
    throw new Error("Failed to fetch clients at risk metric");
  }

  return data;
}

export async function getCustomerStatusMetric({
  filialId,
}: {
  filialId?: string;
}): Promise<{
  data: { status: string; count: number }[];
}> {
  const queryParams: Record<string, string> = {};

  if (filialId && filialId !== "all") {
    queryParams.filialId = filialId;
  }

  const { data } = await apiRequest<{
    data: { status: string; count: number }[];
  }>({
    endpoint: "dashboard/metrics/customer-status",
    method: "GET",
    queryParams,
  });

  if (!data) {
    throw new Error("Failed to fetch customer status metric");
  }

  return data;
}

export async function getTopNeighborhoodsMetric({
  year,
  filialId,
}: {
  year: number;
  filialId?: string;
}): Promise<{
  data: { neighborhood: string; count: number }[];
}> {
  const queryParams: Record<string, string> = {
    year: String(year),
  };

  if (filialId && filialId !== "all") {
    queryParams.filialId = filialId;
  }

  const { data } = await apiRequest<{
    data: { neighborhood: string; count: number }[];
  }>({
    endpoint: "dashboard/metrics/top-neighborhoods",
    method: "GET",
    queryParams,
  });

  if (!data) {
    throw new Error("Failed to fetch top neighborhoods metric");
  }

  return data;
}

export async function getDefaultsOverTime({
  year,
  filialId,
}: {
  year: number;
  filialId?: string;
}): Promise<{
  data: { month: number; count: number }[];
}> {
  const queryParams: Record<string, string> = {
    year: String(year),
  };

  if (filialId && filialId !== "all") {
    queryParams.filialId = filialId;
  }

  const { data } = await apiRequest<{
    data: { month: number; count: number }[];
  }>({
    endpoint: "dashboard/metrics/defaults/over-time",
    method: "GET",
    queryParams,
  });

  if (!data) {
    throw new Error("Failed to fetch defaults over time");
  }

  return data;
}

export async function getTopBookedGearsRanking({
  year,
  filialId,
  limit,
}: {
  year: number;
  filialId?: string;
  limit?: number;
}): Promise<{
  ranking: {
    gearName: string;
    count: number;
    totalRevenue: number;
    occupancyRate: number;
  }[];
}> {
  const queryParams: Record<string, string> = {
    year: String(year),
  };

  if (filialId && filialId !== "all") {
    queryParams.filialId = filialId;
  }

  if (limit) {
    queryParams.limit = String(limit);
  }

  const { data } = await apiRequest<{
    ranking: {
      gearName: string;
      count: number;
      totalRevenue: number;
      occupancyRate: number;
    }[];
  }>({
    endpoint: "dashboard/metrics/top-gears",
    method: "GET",
    queryParams,
  });

  if (!data) {
    throw new Error("Failed to fetch top gears metric");
  }

  return data;
}
