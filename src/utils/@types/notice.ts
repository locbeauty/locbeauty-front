import { Filial } from "./filials";
import { Employee } from "./employee";

export type Notice = {
  noticeId: string;
  description: string;
  createdById: string;
  createdBy?: Employee;
  filialId: string;
  filial?: Filial;
  startDate: string; // ISO string
  endDate: string; // ISO string
  startHourInMinutes: number;
  endHourInMinutes: number;
  createdAt: string;
  updatedAt: string;
};
