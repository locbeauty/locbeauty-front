import { Address } from "./addresses";

export interface Regional {
  managerEmployeeId: string,
  regionalId: string,
  title: string,
  CNPJ: string,
  description: string,
  address: Address,
  cellphone: string,
  email: string
}