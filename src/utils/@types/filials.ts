import { Address } from "./addresses";

export interface Filial {
  managerEmployeeId: string,
  filialId: string,
  CNPJ: string,
  description: string,
  address: Address,
  cellphone: string,
  email: string
}