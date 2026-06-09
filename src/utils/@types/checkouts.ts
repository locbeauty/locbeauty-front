import { CheckoutStatuses } from "../constants";
import { Address } from "./address";
import { CheckoutPayment } from "./payments";
export type { CheckoutPayment } from "./payments";

export type Checkout = {
  checkoutId: string;
  checkoutStatus: CheckoutStatuses;
  date: Date;
  startHourInMinutes: number;
  totalDurationInMinutes: number;
  totalPrice: number;
  observations: string | null;
  basePrice: number;
  distanceInKm: number;
  foodCost: number;
  fuelCost: number;
  lodgingCost: number;
  additionalTransportCost: number;
  isCourtesy: boolean;
  wasRefunded: boolean;
  cancellationFee: number | null;
  refundAmount: number | null;
  CheckoutPayment: CheckoutPayment | null;
  driver: {
    employeeId: string;
    fullname: string;
    documentNumber: string | null;
  } | null;
  driverId: string;
  AccountableEmployee: {
    employeeId: string;
    fullname: string;
    documentNumber: string | null;
  };
  addressId: string;
  Bookings: {
    bookingId: string;
    extraMachineCosts: number;
    extraMachineCostsDescription?: string;
    individualPrice: number;
    status: "ACTIVE" | "INACTIVE";
    Gear: {
      gearId: string;
      gearName: string;
    };
  }[];
  Customer: {
    customerId: string;
    fullname: string;
    cpf: string;
    cnpj: string;
    email: string;
    instagram: string;
    cellphone: string;
    birthdate: string;
    companyName: string;
    customerStatus: string;
    lastBooking: Date | null;
  };
  SourceFilial: {
    filialId: string;
    filialName: string;
  };
  Address: Address;
  concludedAt?: Date | null;
  isVisible?: boolean;
  driverLat?: number | null;
  driverLng?: number | null;
  driverLocationAt?: Date | null;
};

export type CheckoutValueChange = {
  id: string;
  checkoutId: string;
  justification: string;
  previousTotalPrice: number;
  newTotalPrice: number;
  changedByEmployeeId: string | null;
  changedByName: string;
  createdAt: string;
};
