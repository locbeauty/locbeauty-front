import { Address } from "./address";

export interface Employee {
  employeeId: string;
  fullname: string;
  documentNumber: string;
  cellphone: string | null;
  email: string | null;
  birthdate: Date | null;
  password: null;
  createdAt: Date;
  updatedAt: Date;
  role: string
  SourceFilial: {
    filialId: string;
    filialName: string;
    Address: {
      State: {
        UF: string
      }
    }
  };
  Address: Address;
}
