import { Agendamento } from "@/app/(main)/bookings/page";
import { createDate } from "@/utils/bookingViewHelpers";

export const agendamentos: Agendamento[] = [
    {
        id: 2,
        gear: "Ultraformer",
        customer:
      "Empresa ABC LtdaEmpresa ABC LtdaEmpresa ABC LtdaEmpresa ABC Ltda",
        customerEmail: "contato@empresaabc.com",
        customerCellphone: "(11) 3456-7890",
        city: "Campinas",
        address: "Rua das Indústrias, 500, Campinas - SP",
        startDate: createDate(0, 14, 0), // Hoje às 14h
        endDate: createDate(0, 20, 0), // Hoje às 20h
        totalDuration: 6,
        price: 800.0,
        bookingStatus: "Concluído",
        paymentStatus: "Pago",
        observations: "Aguardando confirmação de pagamento. Cliente é recorrente.",
    },
    {
        id: 1,
        gear: "Lavieen",
        customer: "João Silva",
        customerEmail: "joao.silva@email.com",
        customerCellphone: "(11) 98765-4321",
        city: "São Paulo - Centro",
        address: "Av. Paulista, 1000, São Paulo - SP",
        startDate: createDate(0, 9, 0), // Hoje às 9h
        endDate: createDate(0, 13, 0), // Hoje às 13h
        totalDuration: 4,
        price: 1200.0,
        bookingStatus: "Concluído",
        paymentStatus: "Não pago",
        observations:
      "Cliente solicitou entrega do equipamento no city. Acesso pela entrada lateral do terreno.",
    },
    {
        id: 33,
        gear: "Delight",
        customer: "Maria Oliveira",
        customerEmail: "maria@email.com",
        customerCellphone: "(11) 91234-5678",
        city: "Guarulhos",
        address: "Av. Monteiro Lobato, 300, Guarulhos - SP",
        startDate: createDate(1, 8, 0), // Amanhã às 8h
        endDate: createDate(1, 16, 0), // Amanhã às 16h
        totalDuration: 8,
        price: 650.0,
        bookingStatus: "Concluído",
        paymentStatus: "Pago",
    },
    {
        id: 34,
        gear: "Delight",
        customer: "Maria Oliveira",
        customerEmail: "maria@email.com",
        customerCellphone: "(11) 91234-5678",
        city: "Guarulhos",
        address: "Av. Monteiro Lobato, 300, Guarulhos - SP",
        startDate: createDate(1, 8, 0), // Amanhã às 8h
        endDate: createDate(1, 16, 0), // Amanhã às 16h
        totalDuration: 8,
        price: 650.0,
        bookingStatus: "Não iniciado",
        paymentStatus: "Pago",
    },
    {
        id: 349,
        gear: "Delight",
        customer: "Maria Oliveira",
        customerEmail: "maria@email.com",
        customerCellphone: "(11) 91234-5678",
        city: "Guarulhos",
        address: "Av. Monteiro Lobato, 300, Guarulhos - SP",
        startDate: createDate(1, 8, 0), // Amanhã às 8h
        endDate: createDate(1, 16, 0), // Amanhã às 16h
        totalDuration: 8,
        price: 650.0,
        bookingStatus: "Não iniciado",
        paymentStatus: "Pago",
    },
    {
        id: 3429,
        gear: "Delight",
        customer: "Maria Oliveira",
        customerEmail: "maria@email.com",
        customerCellphone: "(11) 91234-5678",
        city: "Guarulhos",
        address: "Av. Monteiro Lobato, 300, Guarulhos - SP",
        startDate: createDate(1, 8, 0), // Amanhã às 8h
        endDate: createDate(1, 16, 0), // Amanhã às 16h
        totalDuration: 8,
        price: 650.0,
        bookingStatus: "Não iniciado",
        paymentStatus: "Pago",
    },
    {
        id: 34292,
        gear: "Delight",
        customer: "Maria Oliveira",
        customerEmail: "maria@email.com",
        customerCellphone: "(11) 91234-5678",
        city: "Guarulhos",
        address: "Av. Monteiro Lobato, 300, Guarulhos - SP",
        startDate: createDate(1, 8, 0), // Amanhã às 8h
        endDate: createDate(1, 16, 0), // Amanhã às 16h
        totalDuration: 8,
        price: 650.0,
        bookingStatus: "Não iniciado",
        paymentStatus: "Pago",
    },
    {
        id: 342922,
        gear: "Delight",
        customer: "Maria Oliveira",
        customerEmail: "maria@email.com",
        customerCellphone: "(11) 91234-5678",
        city: "Guarulhos",
        address: "Av. Monteiro Lobato, 300, Guarulhos - SP",
        startDate: createDate(1, 18, 0), // Amanhã às 8h
        endDate: createDate(1, 22, 0), // Amanhã às 16h
        totalDuration: 4,
        price: 650.0,
        bookingStatus: "Não iniciado",
        paymentStatus: "Pago",
    },
    {
        id: 3,
        gear: "Delight",
        customer: "Maria Oliveira",
        customerEmail: "maria@email.com",
        customerCellphone: "(11) 91234-5678",
        city: "Guarulhos",
        address: "Av. Monteiro Lobato, 300, Guarulhos - SP",
        startDate: createDate(1, 6, 0), // Amanhã às 8h
        endDate: createDate(1, 10, 0), // Amanhã às 16h
        totalDuration: 4,
        price: 650.0,
        bookingStatus: "Cancelado",
        paymentStatus: "Pago",
    },
    {
        id: 4,
        gear: "Lightsheer Duet",
        customer: "Estetica XYZ",
        customerEmail: "Estetica@esteticaxyz.com",
        customerCellphone: "(11) 2345-6789",
        city: "Santo André",
        address: "Rua das Obras, 123, Santo André - SP",
        startDate: createDate(2, 10, 0), // Depois de amanhã às 10h
        endDate: createDate(2, 22, 0), // Depois de amanhã às 22h
        totalDuration: 2,
        price: 1500.0,
        bookingStatus: "Não iniciado",
        paymentStatus: "Não pago",
    },
    {
        id: 5,
        gear: "HERUS HIFU",
        customer: "Pedro Santos",
        customerEmail: "pedro@email.com",
        customerCellphone: "(11) 97654-3210",
        city: "Osasco",
        address: "Rua das Torres, 50, Osasco - SP",
        startDate: createDate(-1, 13, 0), // Ontem às 13h
        endDate: createDate(-1, 17, 0), // Ontem às 17h
        totalDuration: 4,
        price: 350.0,
        bookingStatus: "Cancelado",
        paymentStatus: "Pago",
    },
    {
        id: 6,
        gear: "Galaxy Fiber",
        customer: "Cliente Z",
        customerEmail: "contato@reformasrapidas.com",
        customerCellphone: "(11) 3333-4444",
        city: "São Bernardo",
        address: "Av. Industrial, 789, São Bernardo do Campo - SP",
        startDate: createDate(3, 9, 30), // Daqui a 3 dias às 9:30h
        endDate: createDate(3, 15, 30), // Daqui a 3 dias às 15:30h
        totalDuration: 6,
        price: 420.0,
        bookingStatus: "Cancelado",
        paymentStatus: "Não pago",
        observations:
      "Cliente solicitou demonstração do equipamento antes do início do serviço.",
    },
    {
        id: 755,
        gear: "Galaxy Fiber",
        customer: "Cliente Z",
        customerEmail: "contato@reformasrapidas.com",
        customerCellphone: "(11) 3333-4444",
        city: "São Bernardo",
        address: "Av. Industrial, 789, São Bernardo do Campo - SP",
        startDate: createDate(3, 9, 30), // Daqui a 3 dias às 9:30h
        endDate: createDate(3, 17, 30), // Daqui a 3 dias às 15:30h
        totalDuration: 9,
        price: 420.0,
        bookingStatus: "Concluído",
        paymentStatus: "Pagamento parcial",
        observations:
      "Cliente solicitou demonstração do equipamento antes do início do serviço.",
    },
    {
        id: 7266,
        gear: "Galaxy Fiber",
        customer: "Cliente Z",
        customerEmail: "contato@reformasrapidas.com",
        customerCellphone: "(11) 3333-4444",
        city: "São Bernardo",
        address: "Av. Industrial, 789, São Bernardo do Campo - SP",
        startDate: createDate(3, 16, 30), // Daqui a 3 dias às 9:30h
        endDate: createDate(3, 20, 30), // Daqui a 3 dias às 15:30h
        totalDuration: 2,
        price: 420.0,
        bookingStatus: "Concluído",
        paymentStatus: "Pagamento parcial",
        observations:
      "Cliente solicitou demonstração do equipamento antes do início do serviço.",
    },
    {
        id: 72177,
        gear: "Galaxy Fiber",
        customer: "Cliente Z",
        customerEmail: "contato@reformasrapidas.com",
        customerCellphone: "(11) 3333-4444",
        city: "São Bernardo",
        address: "Av. Industrial, 789, São Bernardo do Campo - SP",
        startDate: createDate(7, 16, 30), // Daqui a 3 dias às 9:30h
        endDate: createDate(7, 20, 30), // Daqui a 3 dias às 15:30h
        totalDuration: 4,
        price: 420.0,
        bookingStatus: "Concluído",
        paymentStatus: "Pagamento parcial",
        observations:
      "Cliente solicitou demonstração do equipamento antes do início do serviço.",
    },
    {
        id: 72288,
        gear: "Galaxy Fiber",
        customer: "Cliente Z",
        customerEmail: "contato@reformasrapidas.com",
        customerCellphone: "(11) 3333-4444",
        city: "São Bernardo",
        address: "Av. Industrial, 789, São Bernardo do Campo - SP",
        startDate: createDate(7, 16, 30), // Daqui a 3 dias às 9:30h
        endDate: createDate(7, 20, 30), // Daqui a 3 dias às 15:30h
        totalDuration: 6,
        price: 420.0,
        bookingStatus: "Concluído",
        paymentStatus: "Pagamento parcial",
        observations:
      "Cliente solicitou demonstração do equipamento antes do início do serviço.",
    },
    {
        id: 7229,
        gear: "Galaxy Fiber",
        customer: "Cliente Z",
        customerEmail: "contato@reformasrapidas.com",
        customerCellphone: "(11) 3333-4444",
        city: "São Bernardo",
        address: "Av. Industrial, 789, São Bernardo do Campo - SP",
        startDate: createDate(7, 16, 30), // Daqui a 3 dias às 9:30h
        endDate: createDate(7, 20, 30), // Daqui a 3 dias às 15:30h
        totalDuration: 6,
        price: 420.0,
        bookingStatus: "Concluído",
        paymentStatus: "Pagamento parcial",
        observations:
      "Cliente solicitou demonstração do equipamento antes do início do serviço.",
    },
    {
        id: 7228,
        gear: "Galaxy Fiber",
        customer: "Cliente Z",
        customerEmail: "contato@reformasrapidas.com",
        customerCellphone: "(11) 3333-4444",
        city: "São Bernardo",
        address: "Av. Industrial, 789, São Bernardo do Campo - SP",
        startDate: createDate(7, 16, 30), // Daqui a 3 dias às 9:30h
        endDate: createDate(7, 20, 30), // Daqui a 3 dias às 15:30h
        totalDuration: 6,
        price: 420.0,
        bookingStatus: "Concluído",
        paymentStatus: "Pagamento parcial",
        observations:
      "Cliente solicitou demonstração do equipamento antes do início do serviço.",
    },
    {
        id: 7227,
        gear: "Galaxy Fiber",
        customer: "Cliente Z",
        customerEmail: "contato@reformasrapidas.com",
        customerCellphone: "(11) 3333-4444",
        city: "São Bernardo",
        address: "Av. Industrial, 789, São Bernardo do Campo - SP",
        startDate: createDate(7, 16, 30), // Daqui a 3 dias às 9:30h
        endDate: createDate(7, 20, 30), // Daqui a 3 dias às 15:30h
        totalDuration: 6,
        price: 420.0,
        bookingStatus: "Concluído",
        paymentStatus: "Pagamento parcial",
        observations:
      "Cliente solicitou demonstração do equipamento antes do início do serviço.",
    },
    {
        id: 7226,
        gear: "Galaxy Fiber",
        customer: "Cliente Z",
        customerEmail: "contato@reformasrapidas.com",
        customerCellphone: "(11) 3333-4444",
        city: "São Bernardo",
        address: "Av. Industrial, 789, São Bernardo do Campo - SP",
        startDate: createDate(7, 16, 30), // Daqui a 3 dias às 9:30h
        endDate: createDate(7, 20, 30), // Daqui a 3 dias às 15:30h
        totalDuration: 6,
        price: 420.0,
        bookingStatus: "Concluído",
        paymentStatus: "Pagamento parcial",
        observations:
      "Cliente solicitou demonstração do equipamento antes do início do serviço.",
    },
    {
        id: 7225,
        gear: "Galaxy Fiber",
        customer: "Cliente Z",
        customerEmail: "contato@reformasrapidas.com",
        customerCellphone: "(11) 3333-4444",
        city: "São Bernardo",
        address: "Av. Industrial, 789, São Bernardo do Campo - SP",
        startDate: createDate(7, 16, 30), // Daqui a 3 dias às 9:30h
        endDate: createDate(7, 20, 30), // Daqui a 3 dias às 15:30h
        totalDuration: 6,
        price: 420.0,
        bookingStatus: "Concluído",
        paymentStatus: "Pagamento parcial",
        observations:
      "Cliente solicitou demonstração do equipamento antes do início do serviço.",
    },
    {
        id: 7224,
        gear: "Galaxy Fiber",
        customer: "Cliente Z",
        customerEmail: "contato@reformasrapidas.com",
        customerCellphone: "(11) 3333-4444",
        city: "São Bernardo",
        address: "Av. Industrial, 789, São Bernardo do Campo - SP",
        startDate: createDate(7, 16, 30), // Daqui a 3 dias às 9:30h
        endDate: createDate(7, 20, 30), // Daqui a 3 dias às 15:30h
        totalDuration: 6,
        price: 420.0,
        bookingStatus: "Concluído",
        paymentStatus: "Pagamento parcial",
        observations:
      "Cliente solicitou demonstração do equipamento antes do início do serviço.",
    },
    {
        id: 7223,
        gear: "Galaxy Fiber",
        customer: "Cliente Z",
        customerEmail: "contato@reformasrapidas.com",
        customerCellphone: "(11) 3333-4444",
        city: "São Bernardo",
        address: "Av. Industrial, 789, São Bernardo do Campo - SP",
        startDate: createDate(7, 16, 30), // Daqui a 3 dias às 9:30h
        endDate: createDate(7, 20, 30), // Daqui a 3 dias às 15:30h
        totalDuration: 6,
        price: 420.0,
        bookingStatus: "Concluído",
        paymentStatus: "Pagamento parcial",
        observations:
      "Cliente solicitou demonstração do equipamento antes do início do serviço.",
    },
    {
        id: 7222,
        gear: "Galaxy Fiber",
        customer: "Cliente Z",
        customerEmail: "contato@reformasrapidas.com",
        customerCellphone: "(11) 3333-4444",
        city: "São Bernardo",
        address: "Av. Industrial, 789, São Bernardo do Campo - SP",
        startDate: createDate(7, 16, 30), // Daqui a 3 dias às 9:30h
        endDate: createDate(7, 20, 30), // Daqui a 3 dias às 15:30h
        totalDuration: 6,
        price: 420.0,
        bookingStatus: "Concluído",
        paymentStatus: "Pagamento parcial",
        observations:
      "Cliente solicitou demonstração do equipamento antes do início do serviço.",
    },
    {
        id: 7221,
        gear: "Galaxy Fiber",
        customer: "Cliente Z",
        customerEmail: "contato@reformasrapidas.com",
        customerCellphone: "(11) 3333-4444",
        city: "São Bernardo",
        address: "Av. Industrial, 789, São Bernardo do Campo - SP",
        startDate: createDate(7, 16, 30), // Daqui a 3 dias às 9:30h
        endDate: createDate(7, 20, 30), // Daqui a 3 dias às 15:30h
        totalDuration: 6,
        price: 420.0,
        bookingStatus: "Concluído",
        paymentStatus: "Pagamento parcial",
        observations:
      "Cliente solicitou demonstração do equipamento antes do início do serviço.",
    },
];
