import { Training } from "./training";

export interface Volunteer {
  volunteerId: string;
  name: string;
  documentNumber: string;
  cellphone: string;
  Training: Training[];
}
