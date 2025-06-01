export const REGIONALS = [
    "",
    "Pernambuco",
    "Ceará",
    "Bahia",
    "Rio de Janeiro",
    "Pará",
    "Espírito Santo",
    "Piauí",
    "Rio Grande do Norte"
] as const;
export const ESTADOS_BRASILEIROS = {
    AC: "Acre",
    AL: "Alagoas",
    AP: "Amapá",
    AM: "Amazonas",
    BA: "Bahia",
    CE: "Ceará",
    DF: "Distrito Federal",
    ES: "Espírito Santo",
    GO: "Goiás",
    MA: "Maranhão",
    MT: "Mato Grosso",
    MS: "Mato Grosso do Sul",
    MG: "Minas Gerais",
    PA: "Pará",
    PB: "Paraíba",
    PR: "Paraná",
    PE: "Pernambuco",
    PI: "Piauí",
    RJ: "Rio de Janeiro",
    RN: "Rio Grande do Norte",
    RS: "Rio Grande do Sul",
    RO: "Rondônia",
    RR: "Roraima",
    SC: "Santa Catarina",
    SP: "São Paulo",
    SE: "Sergipe",
    TO: "Tocantins"
} as const;

export type UF = keyof typeof ESTADOS_BRASILEIROS
export type EstadoTitle = (typeof ESTADOS_BRASILEIROS)[UF]

export interface Regional {
  regionalId: string,
  CNPJ: string,
  description: string,
  CEP: string,
  state: {
    UF: UF
    title: EstadoTitle
  },
  city: string,
  neighborhood: string,
  street: string,
  houseNumber: string,
  addressComplement: string,
  manager: string,
  cellphone: string,
  email: string
}

export const regionals: Regional[] = [
    {
        regionalId: "1",
        CNPJ: "12.345.678/0001-90",
        description: "Filial Acre",
        CEP: "55608-477",
        state: {
            title: "Acre",
            UF: "AC"
        },
        city: "Rio Branco",
        neighborhood: "Boa Viagem",
        street: "Avenida Beira Mar",
        houseNumber: "1167",
        addressComplement: "Perto daquela casa",
        manager: "Chefe de tudo",
        cellphone: "(81) 9.8776-8778",
        email: "teste@email.com",
    },
    {
        regionalId: "2",
        CNPJ: "12.345.678/0001-90",
        description: "Filial Pernambuco",
        CEP: "55608-477",
        state: {
            title: "Pernambuco",
            UF: "PE"
        },
        neighborhood: "Boa Viagem",
        street: "Avenida Beira Mar",
        houseNumber: "1167",
        addressComplement: "Perto daquela casa",
        city: "Recife",
        manager: "Cassio Z",
        cellphone: "(81) 9.8776-8778",
        email: "teste@email.com",
    },
    {
        regionalId: "3",
        CNPJ: "12.345.678/0001-90",
        description: "Filial Pernambuco",
        CEP: "55608-477",
        state: {
            title: "Pernambuco",
            UF: "PE"
        },
        city: "Recife",
        neighborhood: "Boa Viagem",
        street: "Avenida Beira Mar",
        houseNumber: "1167",
        addressComplement: "Perto daquela casa",
        manager: "Fred F",
        cellphone: "(81) 9.8776-8778",
        email: "teste@email.com",
    },
];
