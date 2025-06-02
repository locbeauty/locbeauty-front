import { ROLE } from "../@types/employees";

export type LoggedEmployee = {
    employeeId: string,
    fullname: string,
    role: ROLE,
    email: string,
}

export const loggedEmployee: LoggedEmployee = {
    employeeId: "1",
    fullname: "Antonio Marcelo",
    role: "COMERCIAL",
    email: "teste@teste.com"
};