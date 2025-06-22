export type BookingStatuses = "Pendente" | "Concluido" | "Cancelado"
export type PaymentStatuses = "Pendente" | "Parcial" | "Pago"

export type Booking = {
  id: number;
  gear: string;
  customer: string;
  customerEmail?: string;
  customerCellphone?: string;
  city: string;
  address?: string;
  startDate: Date;
  endDate: Date;
  totalDuration: number; // em horas
  price: number;
  bookingStatus: BookingStatuses;
  paymentStatus: PaymentStatuses;
  observations?: string;
};