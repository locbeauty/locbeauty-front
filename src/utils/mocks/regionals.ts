import { Regional } from "../@types/regionals";

export const regionals: Regional[] = [
    {
        regionalId: "1",
        title: "Filial Acre",
        CNPJ: "12.345.678/0001-90",
        description: "Filial Acre",
        CEP: "55608-477",
        state: {
            stateId: "1",
            title: "Acre",
            UF: "AC"
        },
        city: "Rio Branco",
        neighborhood: "Boa Viagem",
        street: "Avenida Beira Mar",
        houseNumber: "1167",
        addressComplement: "Perto daquela casa",
        manager: {
            employeeId: "1",
            fullname: "Chefe de tudo",
            role: "COMERCIAL",
            CPF: "111.111.111-00"
        },
        cellphone: "(81) 9.8776-8778",
        email: "teste@email.com",
    },
    {
        regionalId: "2",
        title: "Filial Pernambuco",
        CNPJ: "12.345.678/0001-90",
        description: "Filial Pernambuco",
        CEP: "55608-477",
        state: {
            stateId: "2",
            title: "Pernambuco",
            UF: "PE"
        },
        neighborhood: "Boa Viagem",
        street: "Avenida Beira Mar",
        houseNumber: "1167",
        addressComplement: "Perto daquela casa",
        city: "Recife",
        manager: {
            employeeId: "1",
            fullname: "Cassio Z",
            role: "COMERCIAL",
            CPF: "111.111.111-00"
        },
        cellphone: "(81) 9.8776-8778",
        email: "teste@email.com",
    },
    {
        regionalId: "3",
        title: "Filial Pernambuco",
        CNPJ: "12.345.678/0001-90",
        description: "Filial Pernambuco",
        CEP: "55608-477",
        state: {
            stateId: "3",
            title: "Pernambuco",
            UF: "PE"
        },
        city: "Recife",
        neighborhood: "Boa Viagem",
        street: "Avenida Beira Mar",
        houseNumber: "1167",
        addressComplement: "Perto daquela casa",
        manager: {
            employeeId: "1",
            fullname: "Fred F",
            role: "COMERCIAL",
            CPF: "111.111.111-00"
        },
        cellphone: "(81) 9.8776-8778",
        email: "teste@email.com",
    },
];
