import { State } from "./addresses";

export type PERSON_TYPE = "PF" | "PJ";
export type CUSTOMER_STATUSES = "ATIVO" | "INATIVO" | "INADIMPLENTE" | "BLOQUEADO";

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
  CEP: string;
  state: State;
  city: string;
  neighborhood: string;
  street: string;
  houseNumber: string;
  addressComplement: string | null;
  CPF: string | null;
  CNPJ: string | null;
  lastBooking: Date;
}