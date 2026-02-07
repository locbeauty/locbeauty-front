import { Training } from "./training";
import { Filial } from "./filials";

export interface Volunteer {
  volunteerId: string;
  name: string;
  documentNumber: string;
  cellphone: string;
  Training: Training[];
  sourceFilialId?: string;
  SourceFilial?: Filial;
  isVisible: boolean;
}
