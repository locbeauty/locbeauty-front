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
  volunteerId: string;
  traineeId: string;
  dueDate: string;
  sourceFilialId: string;
  addressId: string;
  createdAt: string;
  updatedAt: string;
  Gear: Gear;
  Volunteer: Volunteer;
  Trainee: Trainee;
  TrainingPayment: TrainingPayment[];
  SourceFilial: Filial;
  wasRefunded?: boolean;
  Address: Address;
}
