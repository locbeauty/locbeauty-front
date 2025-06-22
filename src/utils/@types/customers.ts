import { Address } from "./addresses";

export type PERSON_TYPE = "PF" | "PJ";
export type CUSTOMER_STATUSES = "Ativo" | "Inativo" | "Inadimplente" | "Bloqueado";

export interface Customer {
  customerId: string;
  fullname: string | null;
  documentNumber: string | null;
  companyName: string | null;
  customerStatus: CUSTOMER_STATUSES;
  birthdate: string | null;
  email: string | null;
  cellphone: string;
  instagram: string | null;
  address: Address,
  lastBooking: Date | null;
}