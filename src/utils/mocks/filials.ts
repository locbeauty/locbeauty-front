import { Filial } from "../@types/filials";

export const filials: Filial[] = [
    {
        filialId: "filial-001",
        managerEmployee: {
            employeeId: "manager-001",
            fullname: "Carlos Silva Santos"
        },
        CNPJ: "12.345.678/0001-90",
        filialName: "Filial Centro",
        cellphone: "(11) 99999-0001",
        email: "centro@empresa.com",
        address: {
            addressId: "addr-001",
            zipCode: "01001-000",
            buildingNumber: "100",
            addressComplement: "Sala 1",
            createdAt: "2025-01-01T12:00:00Z",
            updatedAt: "2025-06-01T12:00:00Z",
            state: {
                stateId: "state-01",
                stateName: "São Paulo",
                UF: "SP",
            },
            city: {
                cityId: "city-01",
                cityName: "São Paulo",
            },
            neighborhood: {
                neighborhoodId: "neigh-01",
                neighborhoodName: "Centro",
            },
            street: {
                streetId: "street-01",
                streetName: "Rua Direita",
            },
        },
    },
    {
        filialId: "filial-002",
        managerEmployee: {
            employeeId: "manager-002",
            fullname: "Maria Fernanda Oliveira"
        },
        CNPJ: "98.765.432/0001-12",
        filialName: "Filial Norte",
        cellphone: "(11) 99999-0002",
        email: "norte@empresa.com",
        address: {
            addressId: "addr-002",
            zipCode: "02020-000",
            buildingNumber: "200",
            addressComplement: null,
            createdAt: "2025-02-01T12:00:00Z",
            updatedAt: "2025-06-02T12:00:00Z",
            state: {
                stateId: "state-01",
                stateName: "São Paulo",
                UF: "SP",
            },
            city: {
                cityId: "city-01",
                cityName: "São Paulo",
            },
            neighborhood: {
                neighborhoodId: "neigh-02",
                neighborhoodName: "Santana",
            },
            street: {
                streetId: "street-02",
                streetName: "Avenida Cruzeiro do Sul",
            },
        },
    },
    {
        filialId: "filial-003",
        managerEmployee: {
            employeeId: "manager-003",
            fullname: "João Pedro Costa"
        },
        CNPJ: "11.222.333/0001-44",
        filialName: "Filial Sul",
        cellphone: "(11) 99999-0003",
        email: "sul@empresa.com",
        address: {
            addressId: "addr-003",
            zipCode: "04600-000",
            buildingNumber: "300",
            addressComplement: "Loja 2",
            createdAt: "2025-03-01T12:00:00Z",
            updatedAt: "2025-06-03T12:00:00Z",
            state: {
                stateId: "state-01",
                stateName: "São Paulo",
                UF: "SP",
            },
            city: {
                cityId: "city-01",
                cityName: "São Paulo",
            },
            neighborhood: {
                neighborhoodId: "neigh-03",
                neighborhoodName: "Brooklin",
            },
            street: {
                streetId: "street-03",
                streetName: "Rua Michigan",
            },
        },
    },
    {
        filialId: "filial-004",
        managerEmployee: {
            employeeId: "manager-004",
            fullname: "Ana Beatriz Lima"
        },
        CNPJ: "22.333.444/0001-55",
        filialName: "Filial Oeste",
        cellphone: "(11) 99999-0004",
        email: "oeste@empresa.com",
        address: {
            addressId: "addr-004",
            zipCode: "05001-000",
            buildingNumber: "400",
            addressComplement: "Andar 5",
            createdAt: "2025-04-01T12:00:00Z",
            updatedAt: "2025-06-04T12:00:00Z",
            state: {
                stateId: "state-01",
                stateName: "São Paulo",
                UF: "SP",
            },
            city: {
                cityId: "city-01",
                cityName: "São Paulo",
            },
            neighborhood: {
                neighborhoodId: "neigh-04",
                neighborhoodName: "Lapa",
            },
            street: {
                streetId: "street-04",
                streetName: "Rua Guaicurus",
            },
        },
    },
    {
        filialId: "filial-005",
        managerEmployee: {
            employeeId: "manager-005",
            fullname: "Roberto Almeida Souza"
        },
        CNPJ: "33.444.555/0001-66",
        filialName: "Filial Leste",
        cellphone: "(11) 99999-0005",
        email: "leste@empresa.com",
        address: {
            addressId: "addr-005",
            zipCode: "03001-000",
            buildingNumber: "500",
            addressComplement: null,
            createdAt: "2025-05-01T12:00:00Z",
            updatedAt: "2025-06-05T12:00:00Z",
            state: {
                stateId: "state-01",
                stateName: "São Paulo",
                UF: "SP",
            },
            city: {
                cityId: "city-01",
                cityName: "São Paulo",
            },
            neighborhood: {
                neighborhoodId: "neigh-05",
                neighborhoodName: "Mooca",
            },
            street: {
                streetId: "street-05",
                streetName: "Rua da Mooca",
            },
        },
    },
    {
        filialId: "filial-pe-001",
        managerEmployee: {
            employeeId: "manager-pe-001",
            fullname: "Fernanda Carvalho Nascimento"
        },
        CNPJ: "44.555.666/0001-77",
        filialName: "Filial Pernambuco",
        cellphone: "(81) 99999-0001",
        email: "pernambuco@empresa.com",
        address: {
            addressId: "addr-pe-001",
            zipCode: "52020-010",
            buildingNumber: "150",
            addressComplement: "Sala 301",
            createdAt: "2025-01-15T12:00:00Z",
            updatedAt: "2025-06-15T12:00:00Z",
            state: {
                stateId: "state-pe",
                stateName: "Pernambuco",
                UF: "PE",
            },
            city: {
                cityId: "city-recife",
                cityName: "Recife",
            },
            neighborhood: {
                neighborhoodId: "neigh-boa-viagem",
                neighborhoodName: "Boa Viagem",
            },
            street: {
                streetId: "street-conselheiro-aguiar",
                streetName: "Avenida Conselheiro Aguiar",
            },
        },
    },
    {
        filialId: "filial-ba-001",
        managerEmployee: {
            employeeId: "manager-ba-001",
            fullname: "Thiago Santos Barbosa"
        },
        CNPJ: "55.666.777/0001-88",
        filialName: "Filial Bahia",
        cellphone: "(71) 99999-0001",
        email: "bahia@empresa.com",
        address: {
            addressId: "addr-ba-001",
            zipCode: "40070-110",
            buildingNumber: "250",
            addressComplement: "Loja 15",
            createdAt: "2025-02-10T12:00:00Z",
            updatedAt: "2025-06-10T12:00:00Z",
            state: {
                stateId: "state-ba",
                stateName: "Bahia",
                UF: "BA",
            },
            city: {
                cityId: "city-salvador",
                cityName: "Salvador",
            },
            neighborhood: {
                neighborhoodId: "neigh-barra",
                neighborhoodName: "Barra",
            },
            street: {
                streetId: "street-oceânica",
                streetName: "Avenida Oceânica",
            },
        },
    },
    {
        filialId: "filial-rj-001",
        managerEmployee: {
            employeeId: "manager-rj-001",
            fullname: "Patricia Rodrigues Silva"
        },
        CNPJ: "66.777.888/0001-99",
        filialName: "Filial Rio de Janeiro",
        cellphone: "(21) 99999-0001",
        email: "rio@empresa.com",
        address: {
            addressId: "addr-rj-001",
            zipCode: "22071-900",
            buildingNumber: "1500",
            addressComplement: "Cobertura",
            createdAt: "2025-03-05T12:00:00Z",
            updatedAt: "2025-06-05T12:00:00Z",
            state: {
                stateId: "state-rj",
                stateName: "Rio de Janeiro",
                UF: "RJ",
            },
            city: {
                cityId: "city-rio",
                cityName: "Rio de Janeiro",
            },
            neighborhood: {
                neighborhoodId: "neigh-copacabana",
                neighborhoodName: "Copacabana",
            },
            street: {
                streetId: "street-atlantica",
                streetName: "Avenida Atlântica",
            },
        },
    },
    {
        filialId: "filial-ce-001",
        managerEmployee: {
            employeeId: "manager-ce-001",
            fullname: "Lucas Mendes Ferreira"
        },
        CNPJ: "77.888.999/0001-10",
        filialName: "Filial Ceará",
        cellphone: "(85) 99999-0001",
        email: "ceara@empresa.com",
        address: {
            addressId: "addr-ce-001",
            zipCode: "60165-121",
            buildingNumber: "800",
            addressComplement: "Andar 12",
            createdAt: "2025-04-20T12:00:00Z",
            updatedAt: "2025-06-20T12:00:00Z",
            state: {
                stateId: "state-ce",
                stateName: "Ceará",
                UF: "CE",
            },
            city: {
                cityId: "city-fortaleza",
                cityName: "Fortaleza",
            },
            neighborhood: {
                neighborhoodId: "neigh-meireles",
                neighborhoodName: "Meireles",
            },
            street: {
                streetId: "street-beira-mar",
                streetName: "Avenida Beira Mar",
            },
        },
    },
    {
        filialId: "filial-mg-001",
        managerEmployee: {
            employeeId: "manager-mg-001",
            fullname: "Camila Pereira Gonçalves"
        },
        CNPJ: "88.999.111/0001-21",
        filialName: "Filial Minas Gerais",
        cellphone: "(31) 99999-0001",
        email: "mg@empresa.com",
        address: {
            addressId: "addr-mg-001",
            zipCode: "30112-000",
            buildingNumber: "350",
            addressComplement: "Sala 801",
            createdAt: "2025-05-10T12:00:00Z",
            updatedAt: "2025-06-25T12:00:00Z",
            state: {
                stateId: "state-mg",
                stateName: "Minas Gerais",
                UF: "MG",
            },
            city: {
                cityId: "city-bh",
                cityName: "Belo Horizonte",
            },
            neighborhood: {
                neighborhoodId: "neigh-centro-bh",
                neighborhoodName: "Centro",
            },
            street: {
                streetId: "street-afonso-pena",
                streetName: "Avenida Afonso Pena",
            },
        },
    }
];
