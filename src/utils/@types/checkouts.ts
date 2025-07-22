import { BookingStatuses, PaymentStatuses } from "./bookings";

export type CheckoutWithRelations = {
    checkoutId: string;
    bookingStatus: BookingStatuses;
    paymentStatus: PaymentStatuses;
    totalPrice: number;
    Bookings: {
        bookingId: string;
        date: Date;
        gearAmount: number;
        startHourInMinutes: number;
        totalDuration: number;
        price: number;
        observations: string | null;
        gear: {
            gearId: string;
            gearName: string;
        };
    }[];
    customer: {
        customerId: string;
        fullname: string;
        documentNumber: string;
    };
    sourceFilial: {
        filialId: string;
        description: string;
    };
}