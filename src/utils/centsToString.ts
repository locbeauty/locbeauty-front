export function centsToString(cents: number) {
    return `${(cents / 100).toFixed(2).replace(".", ",")}`;
}

export function centsToStringWithCurrencyMark(cents: number) {
    return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}
