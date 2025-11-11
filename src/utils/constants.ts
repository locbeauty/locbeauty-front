export const PaymentMethods = [ "PIX", "Transferência", "Débito", "Crédito", "Dinheiro" ] as const;
export const paymentModes = [ "Parcelado", "AVista" ] as const;
export const paymentStatuses = [ "Pendente", "Pago", "Parcial" ] as const;
export const checkoutStatuses = [ "Pendente", "Concluido", "Cancelado" ] as const;

export type CheckoutStatuses = (typeof checkoutStatuses)[number];
export type PaymentStatuses = (typeof paymentStatuses)[number];
export type PaymentModes = (typeof paymentModes)[number];