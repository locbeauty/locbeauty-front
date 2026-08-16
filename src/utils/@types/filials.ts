export interface Filial {
  managerEmployee: {
    employeeId: string;
    fullname: string;
  };
  filialId: string;
  CNPJ: string;
  filialName: string;
  cellphone: string;
  email: string;
  isVisible?: boolean;
  zipCode?: string | null;
  street?: string | null;
  buildingNumber?: string | null;
  addressComplement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  // Filiais vinculadas: compartilham todos os dados nos filtros por filial.
  LinkedFilials?: { filialId: string; filialName: string }[];
}

export interface FilialStats {
  totalEquipment: number;
  availableEquipment: number;
  inUseEquipment: number;
  activeCustomers: number;
  appointmentsThisMonth: number;
  monthlyGrowth: number;
}
