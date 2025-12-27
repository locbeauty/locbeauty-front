// export function parseStringToCents(valor: string): number {
//     const normalizado = valor.replace(/\./g, "").replace(",", ".");
//     const emReais = parseFloat(normalizado);
//     if (isNaN(emReais)) throw new Error("Valor inválido");
//     const result = Math.round(emReais * 100);
//     return result;
// }

export function parseStringToCents(valor: string | null | undefined): number {
    // 1. Trata null, undefined, e strings vazias ""
    if (!valor) {
        return 0;
    }

    const normalizado = valor.replace(/\./g, "").replace(",", ".");
    const emReais = parseFloat(normalizado);

    // 2. Trata valores não-numéricos (ex: "abc")
    if (isNaN(emReais)) {
        return 0;
    }

    const result = Math.round(emReais * 100);
    return result;
}