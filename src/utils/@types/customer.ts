import { Address } from "./address";

export type CUSTOMER_STATUSES =
  | "Ativo"
  | "Inativo"
  | "Inadimplente"
  | "Bloqueado";

export interface Customer {
  customerId: string;
  fullname: string;
  cpf?: string | null;
  cnpj?: string | null;
  companyName: string | null;
  email: string | null;
  emailDescription?: string | null;
  secondaryEmail?: string | null;
  secondaryEmailDescription?: string | null;
  cellphone: string | null;
  cellphoneDescription?: string | null;
  secondaryCellphone?: string | null;
  secondaryCellphoneDescription?: string | null;
  instagram: string | null;
  observations?: string | null;
  birthdate: Date | null;
  customerStatus: CUSTOMER_STATUSES;
  lastBooking: Date | null;
  sourceFilialId: string;
  SourceFilial: {
    filialId: string;
    filialName: string;
  };
  Filials?: {
    filialId: string;
    filialName: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
  Addresses: Address[];
  isTrainee: boolean;
}
