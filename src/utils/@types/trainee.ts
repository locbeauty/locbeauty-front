import { Address } from "./address";
import { Gear } from "./gears";

interface TrainingPayment {
    paymentId: string;
    payerType: "TRAINEE" | "VOLUNTEER";
    paymentStatus: "Pendente" | "Pago" | "Parcial";
    firstPaymentDate: string | null;
    firstPaymentAmount: number;
    firstPaymentMethod: string | null;
    firstPaymentStatus: string | null;
    secondPaymentDate: string | null;
    secondPaymentAmount: number;
    secondPaymentMethod: string | null;
    secondPaymentStatus: string | null;
}

export interface Trainee {
    traineeId: string,
    name: string,
    documentNumber: string,
    cellphone: string,
    email: string,
    Addresses: Address[],
    Training: Training[]
}

export interface Training {
  trainingId: string
  trainingStatus: "Pendente" | "Concluido" | "Cancelado" | string
  hourInMinutes: number
  price: number
  additionalCost: number
  additionalCostDescription: string
  gearId: string
  volunteerId: string
  traineeId: string
  dueDate: string
  sourceFilialId: string
  addressId: string
  createdAt: string
  updatedAt: string
  TrainingPayment: TrainingPayment[]
  Gear: Gear
}