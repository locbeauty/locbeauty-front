import { Address } from "./address";
import { CheckoutStatuses } from "../constants";
import { CheckoutPayment } from "./checkouts";

export interface Training {
  trainingId: string;
  hourInMinutes: number;
  price: number;
  trainingStatus: CheckoutStatuses;
  additionalCost: number;
  additionalCostDescription: string;
  TrainingPayment: CheckoutPayment
  Gear: {
    gearId: string;
    gearName: string
  }
  Volunteer: {
    volunteerId: string;
    name: string;
    documentNumber: string;
  }
  Trainee: {
    traineeId: string;
    name: string;
    documentNumber: string;
    cellphone: string;
  }
  dueDate: Date;
  Address: Address
  createdAt: string;
  updatedAt: string;
  sourceFilial: {
    CNPJ: string;
    addressId: string;
    cellphone: string;
    createdAt: string;
    email: string;
    filialId: string;
    filialName: string;
    managerEmployeeId: string;
    slug: string;
    updatedAt: string;
  }
}