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
  AdditionalFilials?: {
    filialId: string;
    filialName: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
  Addresses: Address[];
  isTrainee: boolean;
  /** Máquinas com locação em andamento, da mais para a menos (listagem de clientes). */
  rentedGears?: RentedGear[];
  /**
   * Data (só dia) da primeira locação não cancelada nem excluída — define o
   * mês do cliente em "Novos do mês" (listagem de clientes).
   */
  firstBooking?: string | null;
}

export interface RentedGear {
  gearName: string;
  /** Quantidade de agendamentos em andamento com a máquina. */
  rentals: number;
}
