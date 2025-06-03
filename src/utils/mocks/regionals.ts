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
        manager: {
            employeeId: "1",
            fullname: "Chefe de tudo",
            CPF: "111.111.111-00",
            role: "COMERCIAL",
            cellphone: "(81) 9.8776-8778",
            email: "chefe@email.com",
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
            birthdate: new Date("1980-01-15"),
            sourceRegional: "1",
            regional: {
                regionalId: "1",
                title: "Filial Acre",
                CNPJ: "12.345.678/0001-90",
                state: {
                    stateId: "1",
                    UF: "AC",
                    title: "Acre"
                }
            }
        },
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
        manager: {
            employeeId: "2",
            fullname: "Cassio Z",
            CPF: "222.222.222-00",
            role: "COMERCIAL",
            cellphone: "(81) 9.8776-8779",
            email: "cassio@email.com",
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
            birthdate: new Date("1985-03-20"),
            sourceRegional: "2",
            regional: {
                regionalId: "2",
                title: "Filial Pernambuco",
                CNPJ: "12.345.678/0001-90",
                state: {
                    stateId: "2",
                    UF: "PE",
                    title: "Pernambuco"
                }
            }
        },
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
        manager: {
            employeeId: "3",
            fullname: "Fred F",
            CPF: "333.333.333-00",
            role: "COMERCIAL",
            cellphone: "(81) 9.8776-8780",
            email: "fred@email.com",
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
            birthdate: new Date("1982-07-10"),
            sourceRegional: "3",
            regional: {
                regionalId: "3",
                title: "Filial Pernambuco 2",
                CNPJ: "12.345.678/0001-90",
                state: {
                    stateId: "3",
                    UF: "PE",
                    title: "Pernambuco"
                }
            }
        },
        cellphone: "(81) 9.8776-8778",
        email: "teste@email.com"
    }
];