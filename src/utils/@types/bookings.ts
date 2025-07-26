export type BookingStatuses = "Pendente" | "Concluido" | "Cancelado"
export const paymentStatuses = [ "Pendente", "Parcial", "Pago" ] as const;
export const paymentModes = [ "PIX", "Crédito", "Débito", "Dinheiro" ] as const;

export type PaymentStatuses = (typeof paymentStatuses)[number];
export type PaymentModes = (typeof paymentModes)[number];

export type Booking = {
    bookingId: string;
    date: Date;
    gearAmount: number;
    startHourInMinutes: number;
    totalDurationInMinutes: number;
    price: number;
    observations: string | null;
    gear: {
        gearId: string;
        gearName: string;
    };
};

