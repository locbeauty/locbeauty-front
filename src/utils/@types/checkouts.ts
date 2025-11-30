import { CheckoutStatuses, PaymentModes, PaymentStatuses } from "../constants";
import { Address } from "./address";

export type Checkout = {
    checkoutId: string;
    checkoutStatus: CheckoutStatuses;
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
    CheckoutPayment: CheckoutPayment;
    driverId: string,
    accountableEmployee: {
        employeeId: string,
        fullname: string,
        documentNumber: string
    },
    Bookings: {
        bookingId: string;
        extraMachineCosts: number,
        extraMachineCostsDescription?: string,
        individualPrice: number,
        status: "ACTIVE" | "INACTIVE"
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

export interface CheckoutPayment {
  paymentStatus: PaymentStatuses;
  paymentMode: PaymentModes;
  firstPaymentDate: string | null;
  firstPaymentAmount: number;
  firstPaymentMethod: string | null;
  firstPaymentStatus: "Pendente" | "Pago";
  secondPaymentDate: string | null;
  secondPaymentAmount: number;
  secondPaymentMethod: string | null;
  secondPaymentStatus: "Pendente" | "Pago";
}