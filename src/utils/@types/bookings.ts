import { CheckoutStatuses, PaymentStatuses } from "../constants";

export interface BookingWithCheckout {
  bookingId: string;
  checkoutId: string;
  observations: string;
  individualPrice: number;
  startHourInMinutes: number;
  totalDurationInMinutes: number;
  date: Date;
  extraMachineCosts: number;
  extraMachineCostsDescription: string;
  status: "ACTIVE" | "INACTIVE";
  isCourtesy: boolean;
  wasRefunded: boolean;
  gear: {
    gearId: string;
    gearName: string;
  };
  paymentStatus: PaymentStatuses;
  checkoutStatus: CheckoutStatuses;
  totalPrice: number;
  sourceFilial: {
    filialId: string;
    filialName: string;
    CNPJ: string;
    slug: string;
    email: string;
    cellphone: string;
    addressId: string;
    managerEmployeeId: string;
    createdAt: Date;
    updatedAt: Date;
  };
  customer: {
    customerId: string;
    fullname: string;
    documentNumber: string;
    companyName: string;
    email: string;
    cellphone: string;
    instagram: string;
    birthdate: Date;
    customerStatus: "Ativo" | "Inativo";
    lastBooking: Date;
    higherValueBooking: number;
    createdAt: Date;
    updatedAt: Date;
  };
  address: {
    addressId: string;
    zipCode: string;
    buildingNumber: string;
    addressComplement: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    city: string;
    state: string;
    neighborhood: string;
    street: string;
  };
  hasMultipleBookingsInCheckout: boolean;
}

export type Booking = BookingWithCheckout;
