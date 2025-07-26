import { Address } from "./address";

export interface Filial {
  managerEmployeeId: string;
  filialId: string;
  CNPJ: string;
  description: string;
  address: Address;
  cellphone: string;
  email: string;
}