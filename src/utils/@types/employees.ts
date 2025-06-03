import { Address } from "./addresses";
import { Regional } from "./regionals";

export type ROLE = "FINANCIAL" | "MANAGER" | "COMERCIAL" | "LOGISTICS";

export interface Employee {
    employeeId: string,
    fullname: string,
    CPF: string,
    role: ROLE,
    cellphone: string,
    email: string,
    address: Address,
    birthdate: Date,
    sourceRegional: string,
    regional: Regional
}
