export type ROLE = "FINANCIAL" | "MANAGER" | "COMERCIAL" | "LOGISTICS";

export interface Employee {
    employeeId: string,
    fullname: string,
    CPF: string,
    role: ROLE,
}
