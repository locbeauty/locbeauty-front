import { Address } from "./addresses";

export type CUSTOMER_STATUSES = "Ativo" | "Inativo" | "Inadimplente" | "Bloqueado";

export interface Customer {
  customerId: string;
  fullname: string;
  documentNumber: string;
  companyName: string | null;
  customerStatus: CUSTOMER_STATUSES;
  birthdate: string | null;
  email: string | null;
  cellphone: string | null;
  instagram: string | null;
  address: Address,
  lastBooking: Date | null;
}