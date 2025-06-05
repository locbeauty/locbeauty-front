import { Regional } from "../@types/regionals";

export const regionals: Regional[] = [
    {
        regionalId: "1",
        title: "Filial Acre",
        CNPJ: "12.345.678/0001-90",
        description: "Filial Acre",
        address: {
            zipCode: "55608-477",
            state: {
                UF: "AC",
                title: "Acre"
            },
            city: "Rio Branco",
            neighborhood: "Boa Viagem",
            street: "Avenida Beira Mar",
            buildingNumber: "1167",
            addressComplement: "Perto daquela casa"
        },
        managerEmployeeId: "1",
        cellphone: "(81) 9.8776-8778",
        email: "teste@email.com"
    },
    {
        regionalId: "2",
        title: "Filial Pernambuco",
        CNPJ: "12.345.678/0001-90",
        description: "Filial Pernambuco",
        address: {
            zipCode: "55608-477",
            state: {
                UF: "PE",
                title: "Pernambuco"
            },
            city: "Recife",
            neighborhood: "Boa Viagem",
            street: "Avenida Beira Mar",
            buildingNumber: "1167",
            addressComplement: "Perto daquela casa"
        },
        managerEmployeeId:  "1",
        cellphone: "(81) 9.8776-8778",
        email: "teste@email.com"
    },
    {
        regionalId: "3",
        title: "Filial Pernambuco 2",
        CNPJ: "12.345.678/0001-90",
        description: "Filial Pernambuco 2",
        address: {
            zipCode: "55608-477",
            state: {
                UF: "PE",
                title: "Pernambuco"
            },
            city: "Recife",
            neighborhood: "Boa Viagem",
            street: "Avenida Beira Mar",
            buildingNumber: "1167",
            addressComplement: "Perto daquela casa"
        },
        managerEmployeeId:  "1",
        cellphone: "(81) 9.8776-8778",
        email: "teste@email.com"
    }
];