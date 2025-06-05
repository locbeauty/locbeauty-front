import { Customer } from "../@types/customers";

export const mockCustomers: Customer[] = [
    {
        customerId: "1",
        personType: "PF",
        status: "ATIVO",
        birthdate: "2025-05-08",
        fullname: "Cliente 1",
        companyName: null,
        personAccountableName: "Atencio",
        email: "teste@teste.com",
        cellphone: "(11) 11111-1111",
        instagram: "teste.12",
        address: {
            zipCode: "54430-350",
            state: {
                title: "Acre",
                UF: "AC"
            },
            city: "Recife",
            neighborhood: "Boa Viagem",
            street: "Avenida Beira Mar",
            buildingNumber: "1167",
            addressComplement: null,

        },
        CPF: "111.111.111-11",
        CNPJ: null,
        lastBooking: new Date(),
        regionalId: "1",
    },
    {
        customerId: "2",
        personType: "PJ",
        birthdate: "2025-05-08",
        status: "INADIMPLENTE",
        fullname: null,
        companyName: "Cliente 2",
        personAccountableName: "Pessoa responsável 1",
        email: "teste@teste.com",
        cellphone: "(11) 11111-1111",
        instagram: "teste.12",
        address: {
            zipCode: "54430-350",
            state: {
                title: "Acre",
                UF: "AC"
            },
            city: "Recife",
            neighborhood: "Boa Viagem",
            street: "Avenida Beira Mar",
            buildingNumber: "1167",
            addressComplement: "Perto daquela casa",

        },
        CPF: null,
        CNPJ: "111.111.111-11",
        lastBooking: new Date(),
        regionalId: "1",
    },
    {
        customerId: "3",
        personType: "PJ",
        birthdate: "2025-05-08",
        status: "BLOQUEADO",
        fullname: null,
        companyName: "Cliente 3",
        personAccountableName: "Pessoa Responsável 2",
        email: "teste@teste.com",
        cellphone: "(11) 11111-1111",
        instagram: "sportrecife",
        address: {
            zipCode: "54430-350",
            state: {
                title: "Acre",
                UF: "AC"
            },
            city: "Recife",
            neighborhood: "Ilha do Retiro",
            street: "Avenida Abdias de Carvalho",
            buildingNumber: "0",
            addressComplement: null,

        },
        CPF: null,
        CNPJ: "111.111.111-11",
        lastBooking: new Date(),
        regionalId: "1",
    },
];
