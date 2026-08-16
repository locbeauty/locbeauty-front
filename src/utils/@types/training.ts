import { Address } from "./address";
import { Trainee } from "./trainee";
import { Customer } from "./customer";
import { Gear } from "./gears";
import { Volunteer } from "./volunteer";
import { Filial } from "./filials";
import { TrainingPayment } from "./payments";
import { CheckoutStatuses } from "../constants";

export type TrainingType = "COMUM" | "MPT";

// Inscrição unificada: a mesma pessoa (Customer) pode ser aluno e/ou modelo.
export interface TrainingEnrollment {
  enrollmentId: string;
  trainingId?: string;
  customerId: string;
  isTrainee: boolean;
  isModel: boolean;
  observations?: string | null;
  Customer?: Customer;
}

// Auditoria de alteração de valor de um treinamento concluído.
export interface TrainingValueChange {
  id: string;
  trainingId: string;
  justification: string;
  previousTotalPrice: number;
  newTotalPrice: number;
  changedByEmployeeId: string | null;
  changedByName: string;
  createdAt: string;
}

export interface Training {
  trainingId: string;
  trainingStatus: CheckoutStatuses;
  trainingType: TrainingType;
  capacity: number;
  hourInMinutes: number;
  // Momento da conclusão: baliza a janela de 48h para editar o treinamento.
  concludedAt?: string | null;

  gearId: string;
  volunteerId?: string;
  traineeId?: string;
  dueDate: string;
  sourceFilialId: string;
  addressId: string;
  createdAt: string;
  updatedAt: string;
  Gear: Gear;
  Volunteers: Volunteer[];
  Trainees: Customer[];
  Enrollments: TrainingEnrollment[];
  Trainee?: Trainee; // Keep for backward compatibility if needed, but likely unused
  Volunteer?: Volunteer; // Keep for backward compatibility if needed, but likely unused
  TrainingPayment: TrainingPayment[];
  SourceFilial: Filial;
  wasRefunded?: boolean;
  isVisible: boolean;
  Address: Address;
}
