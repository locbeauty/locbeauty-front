import { Address } from "./address";

export interface Training {
  trainingId: string;
  hour: number;
  minute: number;
  Gear: {
    gearId: string;
    gearName: string
  }
  Professor: {
    professorId: string;
    name: string;
  }
  Student: {
    studentId: string;
    name: string;
    documentNumber: string;
  }
  dueDate: Date;
  Address: Address
}