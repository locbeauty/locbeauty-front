import { PayerType } from "@/components/pages/trainings/TrainingPaymentMethodDialog";
import { PaymentModes, PaymentStatuses } from "../constants";

export type InstallmentStatus = "Pendente" | "Pago";

export interface Installment {
  number: number;
  amount: number; // centavos
  dueDate: string | null;
  paymentDate: string | null;
  paymentMethod: string | null;
  paymentStatus: InstallmentStatus;
}

export interface CheckoutPayment {
  paymentStatus: PaymentStatuses;
  paymentMode: PaymentModes;
  installmentsCount?: number;
  installments?: Installment[] | null;
  firstPaymentDate: string | null;
  firstPaymentAmount: number;
  firstPaymentMethod: string | null;
  firstPaymentStatus: "Pendente" | "Pago";
  secondPaymentDate: string | null;
  secondPaymentAmount: number;
  secondPaymentMethod: string | null;
  secondPaymentStatus: "Pendente" | "Pago";
}

export interface TrainingPayment {
  paymentId: string;
  payerType: "TRAINEE" | "VOLUNTEER";
  additionalCost: number;
  additionalCostDescription: string;
  basePrice: number;
  totalPrice: number;
  paymentMode: PaymentModes;
  paymentStatus: PaymentStatuses;
  installmentsCount?: number;
  installments?: Installment[] | null;
  firstPaymentDate: string | null;
  firstPaymentAmount: number;
  firstPaymentMethod: string | null;
  firstPaymentStatus: "Pendente" | "Pago";
  secondPaymentDate: string | null;
  secondPaymentAmount: number;
  secondPaymentMethod: string | null;
  secondPaymentStatus: "Pendente" | "Pago";
  isCourtesy: boolean;
  wasRefunded: boolean;
  refundAmount: number | null;
  refundedAmount: number | null;
  cancellationFee: number | null;
  cancellationDate: string | null;
  cancellationFeePaymentDate: string | null;
  cancellationFeePaymentMethod: string | null;
  traineeId?: string | null;
  customerId?: string | null;
  volunteerId?: string | null;
}
