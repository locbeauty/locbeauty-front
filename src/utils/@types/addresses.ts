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
export type StateTitle = (typeof ESTADOS_BRASILEIROS)[UF]

export type State = {
    UF: UF
    stateName: StateTitle
  }

export type Address = {
    zipCode: string,
    state: State,
    city: string,
    neighborhood: string,
    street: string,
    buildingNumber: string,
    addressComplement: string | null,
}