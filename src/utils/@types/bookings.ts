import { CheckoutStatuses, PaymentStatuses } from "../constants";
import { Address } from "./address";
import { Customer } from "./customer";
import { Filial } from "./filials";

export type Booking = {
    bookingId: string;
    checkoutId: string;
    gearId: string;
    gearName: string;
    individualPrice: number,
    extraMachineCosts: number,
    extraMachineCostsDescription: string,
};

// export interface Checkout {
//   checkoutId: string
//   paymentStatus: string
//   checkoutStatus: string
//   totalPrice: number
//   sourceFilial: Filial
//   customer: Customer
//   Bookings: Booking[]
//   address: Address
// }

// export interface Customer {
//   customerId: string
//   fullname: string
//   documentNumber: string
//   email: string
//   instagram: string
//   cellphone: string
//   birthdate: string
//   companyName: string
//   customerStatus: string
//   lastBooking: string | null
// }

// export interface Gear {
//   gearId: string
//   gearName: string
// }

// export interface Address {
//   addressId: string
//   zipCode: string
//   buildingNumber: string
//   addressComplement: string
//   createdAt: string
//   updatedAt: string
//   state: State
//   city: City
//   neighborhood: Neighborhood
//   street: Street
// }

// export interface State {
//   stateId: string
//   stateName: string
//   UF: string
// }

// export interface City {
//   cityId: string
//   cityName: string
// }

// export interface Neighborhood {
//   neighborhoodId: string
//   neighborhoodName: string
// }

// export interface Street {
//   streetId: string
//   streetName: string
// }

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