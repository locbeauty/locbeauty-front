import { Filial } from "./filials";

export const checkoutStatuses = [ "Pendente", "Concluido", "Cancelado" ] as const;
export const paymentStatuses = [ "Pendente", "Parcial", "Pago" ] as const;
export const paymentModes = [ "PIX", "Transferência bancária" ] as const;

export type CheckoutStatuses = (typeof checkoutStatuses)[number];
export type PaymentStatuses = (typeof paymentStatuses)[number];
export type PaymentModes = (typeof paymentModes)[number];

export type Booking = {
    bookingId: string;
    bookingStatus: string,
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

export interface Checkout {
  checkoutId: string
  paymentStatus: string
  checkoutStatus: string
  totalPrice: number
  sourceFilial: SourceFilial
  customer: Customer
  Bookings: Booking[]
  address: Address
}

export interface SourceFilial {
  filialId: string
  description: string
}

export interface Customer {
  customerId: string
  fullname: string
  documentNumber: string
  email: string
  instagram: string
  cellphone: string
  birthdate: string
  companyName: string
  customerStatus: string
  lastBooking: string | null
}

export interface Gear {
  gearId: string
  gearName: string
}

export interface Address {
  addressId: string
  zipCode: string
  buildingNumber: string
  addressComplement: string
  createdAt: string
  updatedAt: string
  state: State
  city: City
  neighborhood: Neighborhood
  street: Street
}

export interface State {
  stateId: string
  stateName: string
  UF: string
}

export interface City {
  cityId: string
  cityName: string
}

export interface Neighborhood {
  neighborhoodId: string
  neighborhoodName: string
}

export interface Street {
  streetId: string
  streetName: string
}

export type BookingWithCheckout = Booking & {
  checkoutId: string;
  paymentStatus: PaymentStatuses;
  checkoutStatus: string;
  totalPrice: number;
  bookingStatus: CheckoutStatuses,
  sourceFilial: Filial;
  customer: Customer;
  address: Address;
  hasMultipleBookingsInCheckout: boolean;
};