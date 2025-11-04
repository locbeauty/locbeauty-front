import { Address } from "./address";
import { CheckoutStatuses, PaymentModes, PaymentStatuses } from "./bookings";

export type Checkout = {
    checkoutId: string;
    checkoutStatus: CheckoutStatuses;
    paymentStatus: PaymentStatuses;
    date: Date;
    startHourInMinutes: number;
    totalDurationInMinutes: number;
    totalPrice: number;
    observations: string | null;
    basePrice: number,
    distanceInKm: number,
    foodCost: number,
    fuelCost: number,
    lodgingCost: number,
    additionalTransportCost: number,
    pendingValue: number,
    // paymentMode: PaymentModes,
    paymentMode: string,
    driverId: string,
    accountableEmployee: {
        employeeId: string,
        fullname: string,
        documentNumber: string
    },
    Bookings: {
        bookingId: string;
        extraMachineCosts: number,
        extraMachineCostsDescription: string,
        individualPrice: number,
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
        lastBooking: Date | null,
    };
    sourceFilial: {
        filialId: string;
        filialName: string;
    };
    address: Address;
}