import { Address } from "./addresses";

export interface Employee {
    employeeId: string,
    fullname: string,
    documentNumber: string,
    role: {
        roleId: string;
        roleName: string;
    },
    cellphone: string,
    email: string,
    address: Address,
    birthdate: Date,
    sourceRegionalId: string
}
