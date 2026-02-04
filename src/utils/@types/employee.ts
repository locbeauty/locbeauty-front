export interface Employee {
  employeeId: string;
  username: string;
  fullname: string;
  documentNumber: string | null;
  cellphone: string | null;
  email: string | null;
  birthdate: Date | null;
  password: null;
  createdAt: Date;
  updatedAt: Date;
  role: string;
  SourceFilial: {
    filialId: string;
    filialName: string;
    Address: {
      State: {
        UF: string;
      };
    };
  };
  isVisible?: boolean;
}
