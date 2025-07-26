import { Filial } from "../@types/filials";

export const filials: Filial[] = [
    {
        filialId: "filial-001",
        managerEmployeeId: "manager-001",
        CNPJ: "12.345.678/0001-90",
        description: "Filial Centro",
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
        managerEmployeeId: "manager-002",
        CNPJ: "98.765.432/0001-12",
        description: "Filial Norte",
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
        managerEmployeeId: "manager-003",
        CNPJ: "11.222.333/0001-44",
        description: "Filial Sul",
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
        managerEmployeeId: "manager-004",
        CNPJ: "22.333.444/0001-55",
        description: "Filial Oeste",
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
        managerEmployeeId: "manager-005",
        CNPJ: "33.444.555/0001-66",
        description: "Filial Leste",
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
];
