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

export interface Training {
  trainingId: string;
  trainingStatus: CheckoutStatuses;
  trainingType: TrainingType;
  capacity: number;
  hourInMinutes: number;

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
