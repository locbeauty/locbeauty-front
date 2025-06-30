import { Address } from "./addresses";

export type ROLE = "FINANCIAL" | "MANAGER" | "COMERCIAL" | "LOGISTICS";

export interface Employee {
    employeeId: string,
    fullname: string,
    documentNumber: string,
    role: ROLE,
    cellphone: string,
    email: string,
    address: Address,
    birthdate: Date,
    sourceRegionalId: string
}
