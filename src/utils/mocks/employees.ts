import { Address } from "../@types/addresses";
import { ROLE } from "../@types/employees";

// Interfaces recomendadas (para referência)
interface Employee {
    employeeId: string,
    fullname: string,
    CPF: string,
    role: ROLE,
    cellphone: string,
    email: string,
    address: Address,
    birthdate: Date,
    regionalId: string  // Apenas o ID
}

interface Regional {
    regionalId: string,
    title: string,
    CNPJ: string,
    description: string,
    address: Address,
    managerId: string,  // Apenas o ID
    cellphone: string,
    email: string
}

// Dados das Regionais
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
        managerId: "1",  // Referência ao employee ID 1
        cellphone: "(81) 9.8776-8778",
        email: "acre@empresa.com"
    },
    {
        regionalId: "2",
        title: "Filial Pernambuco",
        CNPJ: "12.345.678/0001-91",
        description: "Filial Pernambuco",
        address: {
            zipCode: "51021-000",
            state: {
                UF: "PE",
                title: "Pernambuco"
            },
            city: "Recife",
            neighborhood: "Boa Viagem",
            street: "Avenida Boa Viagem",
            buildingNumber: "2500",
            addressComplement: "Sala 201"
        },
        managerId: "2",  // Referência ao employee ID 2
        cellphone: "(81) 9.8776-8779",
        email: "pernambuco@empresa.com"
    },
    {
        regionalId: "3",
        title: "Filial Pernambuco Norte",
        CNPJ: "12.345.678/0001-92",
        description: "Filial Pernambuco Norte",
        address: {
            zipCode: "52060-000",
            state: {
                UF: "PE",
                title: "Pernambuco"
            },
            city: "Recife",
            neighborhood: "Parnamirim",
            street: "Rua da Hora",
            buildingNumber: "850",
            addressComplement: "Andar térreo"
        },
        managerId: "4",  // Referência ao employee ID 4
        cellphone: "(81) 9.8776-8780",
        email: "pe-norte@empresa.com"
    }
];

// Dados dos Funcionários
export const employees: Employee[] = [
    {
        employeeId: "1",
        fullname: "Chefe de tudo",
        CPF: "999.999.999-99",
        role: "MANAGER",
        cellphone: "(81) 9.8232-1232",
        email: "chefe.geral@empresa.com",
        address: {
            zipCode: "51021-000",
            state: {
                title: "Pernambuco",
                UF: "PE"
            },
            city: "Recife",
            neighborhood: "Boa Viagem",
            street: "Rua das Flores",
            buildingNumber: "123",
            addressComplement: "Apt 504"
        },
        birthdate: new Date("1985-03-15"),
        regionalId: "1"  // Trabalha na regional 1 (Acre)
    },
    {
        employeeId: "2",
        fullname: "Chefe Regional PE",
        CPF: "888.888.888-88",
        role: "MANAGER",
        cellphone: "(81) 9.7654-3210",
        email: "chefe.pe@empresa.com",
        address: {
            zipCode: "51011-000",
            state: {
                title: "Pernambuco",
                UF: "PE"
            },
            city: "Recife",
            neighborhood: "Pina",
            street: "Av. Boa Viagem",
            buildingNumber: "456",
            addressComplement: "Cobertura"
        },
        birthdate: new Date("1980-07-22"),
        regionalId: "2"  // Trabalha na regional 2 (PE)
    },
    {
        employeeId: "3",
        fullname: "Cassio Z",
        CPF: "777.777.777-77",
        role: "LOGISTICS",
        cellphone: "(81) 9.5432-1098",
        email: "cassio.logistica@empresa.com",
        address: {
            zipCode: "50030-000",
            state: {
                title: "Pernambuco",
                UF: "PE"
            },
            city: "Recife",
            neighborhood: "Recife Antigo",
            street: "Rua do Porto",
            buildingNumber: "789",
            addressComplement: ""
        },
        birthdate: new Date("1990-11-08"),
        regionalId: "2"  // Trabalha na regional 2 (PE)
    },
    {
        employeeId: "4",
        fullname: "Fred F",
        CPF: "666.666.666-66",
        role: "COMERCIAL",
        cellphone: "(81) 9.1234-5678",
        email: "fred.comercial@empresa.com",
        address: {
            zipCode: "50050-000",
            state: {
                title: "Pernambuco",
                UF: "PE"
            },
            city: "Recife",
            neighborhood: "Boa Vista",
            street: "Rua da Aurora",
            buildingNumber: "321",
            addressComplement: "Sala 12"
        },
        birthdate: new Date("1988-02-14"),
        regionalId: "3"  // Trabalha na regional 3 (PE Norte)
    },
    {
        employeeId: "5",
        fullname: "Ana Silva",
        CPF: "555.555.555-55",
        role: "ADMINISTRATIVE",
        cellphone: "(81) 9.9876-5432",
        email: "ana.admin@empresa.com",
        address: {
            zipCode: "51030-000",
            state: {
                title: "Pernambuco",
                UF: "PE"
            },
            city: "Recife",
            neighborhood: "Piedade",
            street: "Rua do Hospício",
            buildingNumber: "200",
            addressComplement: "Apt 101"
        },
        birthdate: new Date("1992-05-18"),
        regionalId: "2"  // Trabalha na regional 2 (PE)
    }
];

// Funções auxiliares para buscar dados relacionados
// export const getRegionalManager = (regionalId: string): Employee | undefined => {
//     const regional = regionals.find(r => r.regionalId === regionalId);
//     return regional ? employees.find(e => e.employeeId === regional.managerId) : undefined;
// };

// export const getRegionalEmployees = (regionalId: string): Employee[] => {
//     return employees.filter(e => e.regionalId === regionalId);
// };

// export const getEmployeeRegional = (employeeId: string): Regional | undefined => {
//     const employee = employees.find(e => e.employeeId === employeeId);
//     return employee ? regionals.find(r => r.regionalId === employee.regionalId) : undefined;
// };

// // Exemplos de uso:
// // const managerDoAcre = getRegionalManager("1");
// // const funcionariosDePE = getRegionalEmployees("2");
// // const regionalDoFred = getEmployeeRegional("4");