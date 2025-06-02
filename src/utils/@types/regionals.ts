import { StateTitle, UF } from "./addresses";
import { Employee } from "./employees";

export interface Regional {
  regionalId: string,
  title: string,
  CNPJ: string,
  description: string,
  CEP: string,
  state: {
    stateId: string,
    UF: UF
    title: StateTitle
  },
  city: string,
  neighborhood: string,
  street: string,
  houseNumber: string,
  addressComplement: string,
  manager: Employee,
  cellphone: string,
  email: string
}