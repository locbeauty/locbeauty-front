import { Address } from "./address";

export interface Filial {
  managerEmployee: {
    employeeId: string;
    fullname: string;
  };
  filialId: string;
  CNPJ: string;
  filialName: string;
  Address: Address;
  cellphone: string;
  email: string;
}

export interface FilialStats {
  totalEquipment: number;
  availableEquipment: number;
  inUseEquipment: number;
  activeCustomers: number;
  appointmentsThisMonth: number;
  monthlyGrowth: number;
}
