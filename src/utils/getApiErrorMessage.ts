// A API devolve em `details` a mensagem legível da validação (ex.: qual campo o
// Zod recusou). Quando existe, ela é mais útil que o `message` genérico.
export function getApiErrorMessage(response: {
  message?: string;
  details?: unknown;
}): string {
  if (typeof response.details === "string" && response.details.length > 0) {
    return response.details;
  }

  return response.message ?? "Erro inesperado.";
}
