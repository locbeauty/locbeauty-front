import { startOfWeek } from "date-fns";
import { Checkout } from "@/utils/@types/checkouts";

// Helper to create date relative to now (days offset, hour, minute)
const createDate = (days: number, hours: number, minutes: number = 0): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

// Helper function to convert hours and minutes to total minutes
const hoursToMinutes = (hours: number, minutes: number = 0): number => {
  return hours * 60 + minutes;
};

// Mock checkouts data
export const bookings: Checkout[] = [
  {
    checkoutId: "checkout-001",
    paymentStatus: "Pago",
    checkoutStatus: "Concluido",
    totalPrice: 800.0,
    sourceFilial: {
      filialId: "filial-001",
      description: "Filial São Paulo",
    },
    customer: {
      customerId: "customer-001",
      fullname: "Empresa ABC Ltda",
      documentNumber: "12345678901234",
      email: "contato@empresaabc.com",
      instagram: "@empresaabc",
      cellphone: "(11) 3456-7890",
      birthdate: "1990-01-01",
      companyName: "Empresa ABC Ltda",
      customerStatus: "Ativo",
      lastBooking: createDate(0, 14, 0).toISOString(),
    },
    Bookings: [
      {
        bookingId: "booking-001",
        bookingStatus: "Concluido",
        date: createDate(0, 14, 0),
        gearAmount: 1,
        startHourInMinutes: hoursToMinutes(14, 0),
        totalDurationInMinutes: 360, // 6 hours
        price: 800.0,
        observations:
          "Aguardando confirmação de pagamento. Cliente é recorrente.",
        gear: {
          gearId: "gear-001",
          gearName: "Ultraformer",
        },
      },
    ],
    address: {
      addressId: "address-001",
      zipCode: "13100-000",
      buildingNumber: "500",
      addressComplement: "Sala 10",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      state: {
        stateId: "state-001",
        stateName: "São Paulo",
        UF: "SP",
      },
      city: {
        cityId: "city-001",
        cityName: "Campinas",
      },
      neighborhood: {
        neighborhoodId: "neighborhood-001",
        neighborhoodName: "Centro",
      },
      street: {
        streetId: "street-001",
        streetName: "Rua das Indústrias",
      },
    },
  },
  {
    checkoutId: "checkout-002",
    paymentStatus: "Pendente",
    checkoutStatus: "Concluido",
    totalPrice: 1200.0,
    sourceFilial: {
      filialId: "filial-001",
      description: "Filial São Paulo",
    },
    customer: {
      customerId: "customer-002",
      fullname: "João Silva",
      documentNumber: "12345678901",
      email: "joao.silva@email.com",
      instagram: "@joaosilva",
      cellphone: "(11) 98765-4321",
      birthdate: "1985-05-15",
      companyName: "",
      customerStatus: "Ativo",
      lastBooking: createDate(0, 9, 0).toISOString(),
    },
    Bookings: [
      {
        bookingId: "booking-002",
        bookingStatus: "Concluido",
        date: createDate(0, 9, 0),
        gearAmount: 1,
        startHourInMinutes: hoursToMinutes(9, 0),
        totalDurationInMinutes: 240, // 4 hours
        price: 1200.0,
        observations:
          "Cliente solicitou entrega do equipamento no city. Acesso pela entrada lateral do terreno.",
        gear: {
          gearId: "gear-002",
          gearName: "Lavieen",
        },
      },
    ],
    address: {
      addressId: "address-002",
      zipCode: "01311-000",
      buildingNumber: "1000",
      addressComplement: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      state: {
        stateId: "state-001",
        stateName: "São Paulo",
        UF: "SP",
      },
      city: {
        cityId: "city-002",
        cityName: "São Paulo",
      },
      neighborhood: {
        neighborhoodId: "neighborhood-002",
        neighborhoodName: "Centro",
      },
      street: {
        streetId: "street-002",
        streetName: "Av. Paulista",
      },
    },
  },
  {
    checkoutId: "checkout-003",
    paymentStatus: "Pago",
    checkoutStatus: "Pendente",
    totalPrice: 650.0,
    sourceFilial: {
      filialId: "filial-002",
      description: "Filial Guarulhos",
    },
    customer: {
      customerId: "customer-003",
      fullname: "Maria Oliveira",
      documentNumber: "98765432100",
      email: "maria@email.com",
      instagram: "@mariaoliveira",
      cellphone: "(11) 91234-5678",
      birthdate: "1992-03-20",
      companyName: "",
      customerStatus: "Ativo",
      lastBooking: createDate(1, 8, 0).toISOString(),
    },
    Bookings: [
      {
        bookingId: "booking-003",
        bookingStatus: "Pendente",
        date: createDate(1, 8, 0),
        gearAmount: 1,
        startHourInMinutes: hoursToMinutes(8, 0),
        totalDurationInMinutes: 480, // 8 hours
        price: 650.0,
        observations: null,
        gear: {
          gearId: "gear-003",
          gearName: "Delight",
        },
      },
    ],
    address: {
      addressId: "address-003",
      zipCode: "07000-000",
      buildingNumber: "300",
      addressComplement: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      state: {
        stateId: "state-001",
        stateName: "São Paulo",
        UF: "SP",
      },
      city: {
        cityId: "city-003",
        cityName: "Guarulhos",
      },
      neighborhood: {
        neighborhoodId: "neighborhood-003",
        neighborhoodName: "Centro",
      },
      street: {
        streetId: "street-003",
        streetName: "Av. Monteiro Lobato",
      },
    },
  },
  {
    checkoutId: "checkout-004",
    paymentStatus: "Pendente",
    checkoutStatus: "Pendente",
    totalPrice: 1500.0,
    sourceFilial: {
      filialId: "filial-003",
      description: "Filial Santo André",
    },
    customer: {
      customerId: "customer-004",
      fullname: "Estetica XYZ",
      documentNumber: "12345678000123",
      email: "contato@esteticaxyz.com",
      instagram: "@esteticaxyz",
      cellphone: "(11) 2345-6789",
      birthdate: "1988-07-10",
      companyName: "Estetica XYZ Ltda",
      customerStatus: "Ativo",
      lastBooking: createDate(2, 10, 0).toISOString(),
    },
    Bookings: [
      {
        bookingId: "booking-004",
        bookingStatus: "Pendente",
        date: createDate(2, 10, 0),
        gearAmount: 1,
        startHourInMinutes: hoursToMinutes(10, 0),
        totalDurationInMinutes: 720, // 12 hours
        price: 1500.0,
        observations: null,
        gear: {
          gearId: "gear-004",
          gearName: "Lightsheer Duet",
        },
      },
    ],
    address: {
      addressId: "address-004",
      zipCode: "09000-000",
      buildingNumber: "123",
      addressComplement: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      state: {
        stateId: "state-001",
        stateName: "São Paulo",
        UF: "SP",
      },
      city: {
        cityId: "city-004",
        cityName: "Santo André",
      },
      neighborhood: {
        neighborhoodId: "neighborhood-004",
        neighborhoodName: "Centro",
      },
      street: {
        streetId: "street-004",
        streetName: "Rua das Obras",
      },
    },
  },
  {
    checkoutId: "checkout-005",
    paymentStatus: "Pago",
    checkoutStatus: "Cancelado",
    totalPrice: 350.0,
    sourceFilial: {
      filialId: "filial-004",
      description: "Filial Osasco",
    },
    customer: {
      customerId: "customer-005",
      fullname: "Pedro Santos",
      documentNumber: "11122233344",
      email: "pedro@email.com",
      instagram: "@pedrosantos",
      cellphone: "(11) 97654-3210",
      birthdate: "1980-12-05",
      companyName: "",
      customerStatus: "Ativo",
      lastBooking: createDate(-1, 13, 0).toISOString(),
    },
    Bookings: [
      {
        bookingId: "booking-005",
        bookingStatus: "Cancelado",
        date: createDate(-1, 13, 0),
        gearAmount: 1,
        startHourInMinutes: hoursToMinutes(13, 0),
        totalDurationInMinutes: 240, // 4 hours
        price: 350.0,
        observations: null,
        gear: {
          gearId: "gear-005",
          gearName: "HERUS HIFU",
        },
      },
    ],
    address: {
      addressId: "address-005",
      zipCode: "06000-000",
      buildingNumber: "50",
      addressComplement: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      state: {
        stateId: "state-001",
        stateName: "São Paulo",
        UF: "SP",
      },
      city: {
        cityId: "city-005",
        cityName: "Osasco",
      },
      neighborhood: {
        neighborhoodId: "neighborhood-005",
        neighborhoodName: "Centro",
      },
      street: {
        streetId: "street-005",
        streetName: "Rua das Torres",
      },
    },
  },
  {
    checkoutId: "checkout-006",
    paymentStatus: "Parcial",
    checkoutStatus: "Concluido",
    totalPrice: 1260.0, // Multiple bookings in same checkout
    sourceFilial: {
      filialId: "filial-005",
      description: "Filial São Bernardo",
    },
    customer: {
      customerId: "customer-006",
      fullname: "Cliente Z",
      documentNumber: "55566677788",
      email: "contato@reformasrapidas.com",
      instagram: "@clientez",
      cellphone: "(11) 3333-4444",
      birthdate: "1975-09-25",
      companyName: "Reformas Rápidas Ltda",
      customerStatus: "Ativo",
      lastBooking: createDate(3, 9, 30).toISOString(),
    },
    Bookings: [
      {
        bookingId: "booking-006-1",
        bookingStatus: "Concluido",
        date: createDate(3, 9, 30),
        gearAmount: 1,
        startHourInMinutes: hoursToMinutes(9, 30),
        totalDurationInMinutes: 360, // 6 hours
        price: 420.0,
        observations:
          "Cliente solicitou demonstração do equipamento antes do início do serviço.",
        gear: {
          gearId: "gear-006",
          gearName: "Galaxy Fiber",
        },
      },
      {
        bookingId: "booking-006-2",
        bookingStatus: "Concluido",
        date: createDate(3, 16, 30),
        gearAmount: 1,
        startHourInMinutes: hoursToMinutes(16, 30),
        totalDurationInMinutes: 240, // 4 hours
        price: 420.0,
        observations: "Segunda reserva do mesmo cliente no mesmo checkout.",
        gear: {
          gearId: "gear-006",
          gearName: "Galaxy Fiber",
        },
      },
      {
        bookingId: "booking-006-3",
        bookingStatus: "Concluido",
        date: createDate(7, 16, 30),
        gearAmount: 1,
        startHourInMinutes: hoursToMinutes(16, 30),
        totalDurationInMinutes: 360, // 6 hours
        price: 420.0,
        observations: "Terceira reserva do mesmo cliente no mesmo checkout.",
        gear: {
          gearId: "gear-006",
          gearName: "Galaxy Fiber",
        },
      },
    ],
    address: {
      addressId: "address-006",
      zipCode: "09700-000",
      buildingNumber: "789",
      addressComplement: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      state: {
        stateId: "state-001",
        stateName: "São Paulo",
        UF: "SP",
      },
      city: {
        cityId: "city-006",
        cityName: "São Bernardo do Campo",
      },
      neighborhood: {
        neighborhoodId: "neighborhood-006",
        neighborhoodName: "Industrial",
      },
      street: {
        streetId: "street-006",
        streetName: "Av. Industrial",
      },
    },
  },
] as unknown as Checkout[];
