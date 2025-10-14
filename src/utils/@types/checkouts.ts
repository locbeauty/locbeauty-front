import { Address } from "./address";
import { CheckoutStatuses, PaymentStatuses } from "./bookings";

export type Checkout = {
    checkoutId: string;
    checkoutStatus: CheckoutStatuses;
    paymentStatus: PaymentStatuses;
    date: Date;
    startHourInMinutes: number;
    totalDurationInMinutes: number;
    totalPrice: number;
    observations: string | null;
    Bookings: {
        bookingId: string;
        gear: {
            gearId: string;
            gearName: string;
        };
    }[];
    customer: {
        customerId: string;
        fullname: string;
        documentNumber: string;
        email: string,
        instagram: string,
        cellphone: string,
        birthdate: string,
        companyName: string,
        customerStatus: string,
        lastBooking: Date,
    };
    sourceFilial: {
        filialId: string;
        description: string;
    };
    address: Address;
}