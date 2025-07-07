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
  role: {
    roleId: string;
    roleName: string;
  };
  sourceFilial: {
    filialId: string;
    description: string;
  };
  address: Address;
}
