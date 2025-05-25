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
  state: {
    UF: UF
    title: EstadoTitle
  },
  city: string,
  manager: string
}
