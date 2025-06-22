
import { Employee } from "../@types/employees";

export const employees: Employee[] = [
    {
        employeeId: "1",
        sourceRegionalId: "1",
        fullname: "Chefe de tudo",
        CPF: "999.999.999-99",
        role: "MANAGER",
        cellphone: "(81) 9.8232-1232",
        email: "chefe.geral@empresa.com",
        address: {
            zipCode: "51021-000",
            state: {
                stateName: "Pernambuco",
                UF: "PE"
            },
            city: "Recife",
            neighborhood: "Boa Viagem",
            street: "Rua das Flores",
            buildingNumber: "123",
            addressComplement: "Apt 504"
        },
        birthdate: new Date("1985-03-15"),
    },
    {
        employeeId: "2",
        sourceRegionalId: "1",
        fullname: "Chefe Regional PE",
        CPF: "888.888.888-88",
        role: "MANAGER",
        cellphone: "(81) 9.7654-3210",
        email: "chefe.pe@empresa.com",
        address: {
            zipCode: "51011-000",
            state: {
                stateName: "Pernambuco",
                UF: "PE"
            },
            city: "Recife",
            neighborhood: "Pina",
            street: "Av. Boa Viagem",
            buildingNumber: "456",
            addressComplement: "Cobertura"
        },
        birthdate: new Date("1980-07-22"),
    },
    {
        employeeId: "3",
        sourceRegionalId: "1",
        fullname: "Cassio Z",
        CPF: "777.777.777-77",
        role: "LOGISTICS",
        cellphone: "(81) 9.5432-1098",
        email: "cassio.logistica@empresa.com",
        address: {
            zipCode: "50030-000",
            state: {
                stateName: "Pernambuco",
                UF: "PE"
            },
            city: "Recife",
            neighborhood: "Recife Antigo",
            street: "Rua do Porto",
            buildingNumber: "789",
            addressComplement: ""
        },
        birthdate: new Date("1990-11-08"),
    },
    {
        employeeId: "4",
        sourceRegionalId: "1",
        fullname: "Fred F",
        CPF: "666.666.666-66",
        role: "COMERCIAL",
        cellphone: "(81) 9.1234-5678",
        email: "fred.comercial@empresa.com",
        address: {
            zipCode: "50050-000",
            state: {
                stateName: "Pernambuco",
                UF: "PE"
            },
            city: "Recife",
            neighborhood: "Boa Vista",
            street: "Rua da Aurora",
            buildingNumber: "321",
            addressComplement: "Sala 12"
        },
        birthdate: new Date("1988-02-14"),
    },
    {
        employeeId: "5",
        sourceRegionalId: "1",
        fullname: "Ana Silva",
        CPF: "555.555.555-55",
        role: "MANAGER",
        cellphone: "(81) 9.9876-5432",
        email: "ana.admin@empresa.com",
        address: {
            zipCode: "51030-000",
            state: {
                stateName: "Pernambuco",
                UF: "PE"
            },
            city: "Recife",
            neighborhood: "Piedade",
            street: "Rua do Hospício",
            buildingNumber: "200",
            addressComplement: "Apt 101"
        },
        birthdate: new Date("1992-05-18"),
    }
];