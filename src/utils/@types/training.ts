import { Address } from "./address";
import { Trainee } from "./trainee";
import { Gear } from "./gears";
import { Volunteer } from "./volunteer";
import { Filial } from "./filials";
import { TrainingPayment } from "./payments";
import { CheckoutStatuses } from "../constants";

export interface Training {
  trainingId: string;
  trainingStatus: CheckoutStatuses;
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
  Trainees: Trainee[];
  Trainee?: Trainee; // Keep for backward compatibility if needed, but likely unused
  Volunteer?: Volunteer; // Keep for backward compatibility if needed, but likely unused
  TrainingPayment: TrainingPayment[];
  SourceFilial: Filial;
  wasRefunded?: boolean;
  Address: Address;
}
