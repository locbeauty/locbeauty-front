import { Address } from "./address";

export interface Student {
    studentId: string,
    name: string,
    documentNumber: string,
    cellphone: string,
    email: string,
    Addresses: Address[],
}