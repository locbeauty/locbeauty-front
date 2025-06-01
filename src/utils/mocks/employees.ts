type ROLE = "FINANCIAL" | "MANAGER" | "COMERCIAL" | "LOGISTICS";

export interface Employee {
    id: string,
    name: string,
    CPF: string,
    role: ROLE,
}

export const employees: Employee[] = [
    { id: "1", name: "Chefe de tudo", CPF: "999.999.999-99", role: "MANAGER" },
    { id: "2", name: "Chefe", CPF: "999.999.999-99", role: "MANAGER" },
    { id: "3", name: "Cassio Z", CPF: "999.999.999-99", role: "LOGISTICS" },
    { id: "4", name: "Fred F", CPF: "999.999.999-99", role: "COMERCIAL" },
];