export function parseStringToCents(valor: string): number {
    const normalizado = valor.replace(/\./g, "").replace(",", ".");
    const emReais = parseFloat(normalizado);
    if (isNaN(emReais)) throw new Error("Valor inválido");
    const result = Math.round(emReais * 100);
    return result;
}