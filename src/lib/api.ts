interface ApiRequestParams {
  endpoint: string;
  body?: unknown;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  queryParams?: Record<
    string,
    string | number | boolean | Date | undefined | null | string[]
  >;
}

export interface ApiResponse<T = unknown> {
  statusCode: number;
  data?: T;
  message?: string;
}
export async function apiRequest<T = unknown>({
  endpoint,
  body,
  method = "GET",
  queryParams,
}: ApiRequestParams): Promise<ApiResponse<T>> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const cleanQueryParams = new URLSearchParams();

  if (queryParams) {
    Object.entries(queryParams).forEach(([ key, value ]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value)) {
          value.forEach((v) => cleanQueryParams.append(key, String(v)));
        } else if (value instanceof Date) {
          cleanQueryParams.append(key, value.toISOString());
        } else {
          cleanQueryParams.append(key, String(value));
        }
      }
    });
  }

  const queryString =
    cleanQueryParams.toString().length > 0
      ? `?${cleanQueryParams.toString()}`
      : "";

  console.log(
    "API Request:",
    method,
    endpoint,
    queryString,
    cleanQueryParams.toString()
  );

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/${endpoint}${queryString}`,
      {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...(method !== "GET" && body ? { body: JSON.stringify(body) } : {}),
      }
    );
    const data: ApiResponse<T> = await response.json();

    if (data.statusCode === 403) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    return data;
  } catch (err) {
    console.error("Network error:", err);
    return { statusCode: 0, message: "Network error" };
  }
}
