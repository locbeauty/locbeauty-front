export interface BirthdayEvent {
  id: string;
  title: string;
  date: string;
  type: "CUSTOMER" | "EMPLOYEE";
  role: string;
  originalBirthdate: string;
}
