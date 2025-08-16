export async function fetchWithToken(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    const token = localStorage.getItem("accessToken");

    if (!token) {
        throw new Error("No access token found");
    }

    const headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
    };

    return fetch(url, { ...options, headers });
}
