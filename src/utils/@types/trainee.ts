import { Address } from "./address";

export interface Trainee {
    traineeId: string,
    name: string,
    documentNumber: string,
    cellphone: string,
    email: string,
    Addresses: Address[],
}