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
export type StateName = (typeof ESTADOS_BRASILEIROS)[UF]

export interface Address {
    addressId: string;
    zipCode: string;
    buildingNumber: string;
    addressComplement: string | null;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    State: {
      stateId: string;
      stateName: StateName;
      UF: UF
    };
    City: {
      cityId: string;
      cityName: string;
    };
    Neighborhood: {
      neighborhoodId: string;
      neighborhoodName: string;
    };
    Street: {
      streetId: string;
      streetName: string;
    };
}