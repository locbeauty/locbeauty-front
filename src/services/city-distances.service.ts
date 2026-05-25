import { apiRequest } from "@/lib/api";

export type CityDistance = {
  cityDistanceId: string;
  cityName: string;
  state: string;
  distance: number;
  filialId: string;
  street?: string | null;
  buildingNumber?: string | null;
  addressComplement?: string | null;
};

type CreateCityDistanceInput = {
  cityName: string;
  state: string;
  distance: number;
  filialId: string;
  street: string;
  buildingNumber: string;
  addressComplement?: string | null;
};

export async function fetchCityDistances(filialId: string) {
  const response = await apiRequest<{ cityDistances: CityDistance[] }>({
    endpoint: `city-distances/${filialId}`,
  });
  // The backend returns { cityDistances: [...] } directly, not wrapped in a 'data' property
  // We cast to unknown first because apiRequest types it as ApiResponse<T>
  return (
    (response as unknown as { cityDistances: CityDistance[] }).cityDistances ||
    []
  );
}

export async function createCityDistance(data: CreateCityDistanceInput) {
  const response = await apiRequest<{
    cityDistanceId: string;
    message: string;
  }>({
    endpoint: "city-distances",
    method: "POST",
    body: data,
  });
  return response.data;
}

export async function deleteCityDistance(cityDistanceId: string) {
  const response = await apiRequest<{ message: string }>({
    endpoint: `city-distances/${cityDistanceId}`,
    method: "DELETE",
  });
  return response.data;
}
