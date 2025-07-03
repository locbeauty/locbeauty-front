
import { Employee } from "../@types/employees";

export const employees: Employee[] = [
    {
        employeeId: "1",
        sourceRegionalId: "1",
        fullname: "Funcionario 1",
        documentNumber: "999.999.999-99",
        roleId: "cmcjvj8vl000018uyelhjfonu",
        cellphone: "(81) 9.8232-1232",
        email: "funcionario1@empresa.com",
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
        fullname: "Funcionario 2",
        documentNumber: "888.888.888-88",
        roleId: "cmcjvj8vl000018uyelhjfonu",
        cellphone: "(81) 9.7654-3210",
        email: "funcionario2@empresa.com",
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
        fullname: "Funcionario 3",
        documentNumber: "777.777.777-77",
        roleId: "cmcjvj8vl000018uyelhjfonu",
        cellphone: "(81) 9.5432-1098",
        email: "funcionario3@empresa.com",
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
        fullname: "Funcionário 4",
        documentNumber: "666.666.666-66",
        roleId: "cmcjvj8vl000018uyelhjfonu",
        cellphone: "(81) 9.1234-5678",
        email: "funcionario4@empresa.com",
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
        fullname: "Funcionario 5",
        documentNumber: "555.555.555-55",
        roleId: "cmcjvj8vl000018uyelhjfonu",
        cellphone: "(81) 9.9876-5432",
        email: "funcionario5@empresa.com",
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