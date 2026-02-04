export type User = {
  employeeId: string;
  fullname: string;
  documentNumber: string;
  cellphone: string;
  email: string | null;
  birthdate: string | null;
  role: string;
  sourceFilialId: string;
  SourceFilial?: {
    filialId: string;
    filialName: string;
    Address?: {
      State: {
        UF: string;
      };
    };
  };
  // Backward compatibility (optional)
  sub?: string;
  employeeName?: string;
  sourceFilial?: {
    filialId: string;
    description: string;
  };
};
