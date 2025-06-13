import { Address } from "./addresses";

export type PERSON_TYPE = "PF" | "PJ";
export type CUSTOMER_STATUSES = "ACTIVE" | "INACTIVE" | "DEFAULTING" | "BLOCKED";

export interface Customer {
  customerId: string;
  regionalId: string;
  personType: PERSON_TYPE;
  status: CUSTOMER_STATUSES;
  birthdate: string;
  fullname: string | null;
  companyName: string | null;
  personAccountableName: string | null;
  email: string;
  cellphone: string;
  instagram: string | null;
  address: Address,
  CPF: string | null;
  CNPJ: string | null;
  lastBooking: Date;
}