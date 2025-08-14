import { Address } from "./address";
import { BookingStatuses, PaymentStatuses } from "./bookings";

export type Checkout = {
    checkoutId: string;
    checkoutStatus: BookingStatuses;
    paymentStatus: PaymentStatuses;
    totalPrice: number;
    Bookings: {
        bookingId: string;
        date: Date;
        gearAmount: number;
        startHourInMinutes: number;
        totalDurationInMinutes: number;
        price: number;
        observations: string | null;
        bookingStatus: BookingStatuses;
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