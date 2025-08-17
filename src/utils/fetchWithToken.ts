export async function fetchWithToken(
    url: string | URL,
    options: RequestInit = {}
): Promise<Response> {
    const token = localStorage.getItem("accessToken");

    if (!token) {
        console.log("No access token found");
    }

    const headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
    };

    return fetch(url, { ...options, headers });
}
