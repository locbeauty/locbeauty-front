import { PayerType } from "@/components/pages/trainings/TrainingPaymentMethodDialog";
import { PaymentModes, PaymentStatuses } from "../constants";

export interface CheckoutPayment {
  paymentStatus: PaymentStatuses;
  paymentMode: PaymentModes;
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
  paymentStatus: "Pendente" | "Pago" | "Parcial";
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
  cancellationFee: number | null;
}
