export enum SYSTEM_MODULES {
  DASHBOARD = "DASHBOARD",
  CUSTOMERS = "CUSTOMERS",
  GEARS = "GEARS",
  FILIALS = "FILIALS",
  EMPLOYEES = "EMPLOYEES",
  BOOKINGS = "BOOKINGS",
  CALENDAR = "CALENDAR",
  GOALS = "GOALS",
  TRAININGS = "TRAININGS",
  BIRTHDAYS = "BIRTHDAYS",
}

export type AccessPermissions = {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
};

export type EmployeeAccess = {
  accessId: string;
  employeeId: string;
  filialId: string;
  Filial: {
    filialId: string;
    filialName: string;
  };
  module: SYSTEM_MODULES;
} & AccessPermissions;
