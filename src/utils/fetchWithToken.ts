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

    const response = fetch(url, { ...options, headers });

    if((await response).status === 403) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        // Redireciona
        if (typeof window !== "undefined") {
            window.location.href = "/login";
        }
    }

    return response;
}
