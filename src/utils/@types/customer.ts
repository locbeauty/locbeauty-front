import { Address } from "./address";

export type CUSTOMER_STATUSES =
  | "Ativo"
  | "Inativo"
  | "Inadimplente"
  | "Bloqueado";

export interface Customer {
  customerId: string;
  fullname: string;
  documentNumber: string;
  companyName: string | null;
  email: string | null;
  cellphone: string | null;
  instagram: string | null;
  birthdate: Date | null;
  customerStatus: CUSTOMER_STATUSES;
  lastBooking: Date | null;
  createdAt: Date;
  updatedAt: Date;
  Addresses: Address[];
}
