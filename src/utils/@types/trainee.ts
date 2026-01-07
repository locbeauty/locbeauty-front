import { Address } from "./address";
import { Gear } from "./gears";
import { Training } from "./training";

export interface Trainee {
  traineeId: string;
  name: string;
  documentNumber: string;
  cellphone: string;
  email: string;
  Addresses: Address[];
  Trainings: Training[];
}

// export interface Training {
//   trainingId: string
//   trainingStatus: "Pendente" | "Concluido" | "Cancelado" | string
//   hourInMinutes: number
//   price: number
//   additionalCost: number
//   additionalCostDescription: string
//   gearId: string
//   volunteerId: string
//   traineeId: string
//   dueDate: string
//   sourceFilialId: string
//   addressId: string
//   createdAt: string
//   updatedAt: string
//   TrainingPayment: TrainingPayment[]
//   Gear: Gear
// }
