// src/mocks/customers.ts

export type PERSON_TYPE = "PF" | "PJ";
export type CUSTOMER_STATUSES =
  | "ATIVO"
  | "INATIVO"
  | "INADIMPLENTE"
  | "BLOQUEADO";

export interface Customer {
  customerId: string;
  personType: PERSON_TYPE;
  status: CUSTOMER_STATUSES;
  regionalId: string;
  birthdate: string;
  fullname: string | null;
  companyName: string | null;
  personAccountableName: string | null;
  email: string;
  cellphone: string;
  instagram: string | null;
  CEP: string;
  UF: string;
  city: string;
  neighborhood: string;
  street: string;
  houseNumber: string;
  addressComplement: string | null;
  CPF: string | null;
  CNPJ: string | null;
  lastRecord: Date;
}

export const mockCustomers: Customer[] = [
    {
        customerId: "1",
        personType: "PF",
        status: "ATIVO",
        birthdate: "2025-05-08",
        fullname: "Atencio",
        companyName: null,
        personAccountableName: "Atencio",
        email: "teste@teste.com",
        cellphone: "(11) 11111-1111",
        instagram: "teste.12",
        CEP: "54430-350",
        UF: "PE",
        city: "Recife",
        neighborhood: "Boa Viagem",
        street: "Avenida Beira Mar",
        houseNumber: "1167",
        addressComplement: null,
        CPF: "111.111.111-11",
        CNPJ: null,
        lastRecord: new Date(),
        regionalId: "1",
    },
    {
        customerId: "2",
        personType: "PJ",
        birthdate: "2025-05-08",
        status: "INADIMPLENTE",
        fullname: null,
        companyName: "Empresa great",
        personAccountableName: "Pessoa da empresa",
        email: "teste@teste.com",
        cellphone: "(11) 11111-1111",
        instagram: "teste.12",
        CEP: "54430-350",
        UF: "PE",
        city: "Recife",
        neighborhood: "Boa Viagem",
        street: "Avenida Beira Mar",
        houseNumber: "1167",
        addressComplement: "Perto daquela casa",
        CPF: null,
        CNPJ: "111.111.111-11",
        lastRecord: new Date(),
        regionalId: "1",
    },
    {
        customerId: "3",
        personType: "PJ",
        birthdate: "2025-05-08",
        status: "BLOQUEADO",
        fullname: null,
        companyName: "Sport Club do Recife",
        personAccountableName: "Yuri Romão",
        email: "teste@teste.com",
        cellphone: "(11) 11111-1111",
        instagram: "sportrecife",
        CEP: "54430-350",
        UF: "PE",
        city: "Recife",
        neighborhood: "Ilha do Retiro",
        street: "Avenida Abdias de Carvalho",
        houseNumber: "0",
        addressComplement: null,
        CPF: null,
        CNPJ: "111.111.111-11",
        lastRecord: new Date(),
        regionalId: "1",
    },
];
