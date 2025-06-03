import { Address } from "./addresses";
import { Employee } from "./employees";

export interface Regional {
  regionalId: string,
  title: string,
  CNPJ: string,
  description: string,
  address: Address,
  manager: Employee,
  cellphone: string,
  email: string
}