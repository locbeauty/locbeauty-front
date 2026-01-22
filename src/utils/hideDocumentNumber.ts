export function hideDocumentNumber(documentNumber: string | null | undefined) {
  if (!documentNumber) return "";
  const digits = documentNumber.replace(/\D/g, "");

  if (digits.length === 11) {
    // CPF: ***.***.999-99
    const visible = digits.slice(6); // últimos 5 dígitos
    return `***.***.${visible.slice(0, 3)}-${visible.slice(3)}`;
  }

  if (digits.length === 14) {
    // CNPJ: **.***.***/0001-99
    const visible = digits.slice(8); // últimos 6 dígitos
    return `**.***.***/${visible.slice(0, 4)}-${visible.slice(4)}`;
  }

  // Número inválido ou não reconhecido
  return documentNumber;
}
