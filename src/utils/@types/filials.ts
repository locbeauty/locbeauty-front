import { Address } from "./address";

export interface Filial {
  managerEmployee: {
    employeeId: string,
    fullname: string
  },
  filialId: string;
  CNPJ: string;
  filialName: string;
  address: Address;
  cellphone: string;
  email: string;
}