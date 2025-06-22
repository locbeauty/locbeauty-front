import { Customer } from "../@types/customers";

export const mockCustomers: Customer[] = [
    {
        customerId: "1",
        customerStatus: "Ativo",
        birthdate: "2025-05-08",
        fullname: "Atencio",
        companyName: null,
        email: "teste@teste.com",
        cellphone: "(11) 11111-1111",
        instagram: "teste.12",
        address: {
            zipCode: "54430-350",
            state: {
                stateName: "Acre",
                UF: "AC"
            },
            city: "Recife",
            neighborhood: "Boa Viagem",
            street: "Avenida Beira Mar",
            buildingNumber: "1167",
            addressComplement: null,

        },
        documentNumber: "111.111.111-11",
        lastBooking: new Date(),
    },
    {
        customerId: "2",
        birthdate: "2025-05-08",
        customerStatus: "Inadimplente",
        fullname: null,
        companyName: "Empresa great",
        email: "teste@teste.com",
        cellphone: "(11) 11111-1111",
        instagram: "teste.12",
        address: {
            zipCode: "54430-350",
            state: {
                stateName: "Acre",
                UF: "AC"
            },
            city: "Recife",
            neighborhood: "Boa Viagem",
            street: "Avenida Beira Mar",
            buildingNumber: "1167",
            addressComplement: "Perto daquela casa",

        },
        documentNumber: null,
        lastBooking: null,
    },
    {
        customerId: "3",
        birthdate: "2025-05-08",
        customerStatus: "Bloqueado",
        fullname: null,
        companyName: "Sport Club do Recife",
        email: "teste@teste.com",
        cellphone: "(11) 11111-1111",
        instagram: "sportrecife",
        address: {
            zipCode: "54430-350",
            state: {
                stateName: "Acre",
                UF: "AC"
            },
            city: "Recife",
            neighborhood: "Ilha do Retiro",
            street: "Avenida Abdias de Carvalho",
            buildingNumber: "0",
            addressComplement: null,

        },
        documentNumber: null,
        lastBooking: new Date(),
    },
];
