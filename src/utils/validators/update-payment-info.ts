import { parseStringToCents } from "@/utils/parseStringToCents";
import { Checkout } from "../@types/checkouts";
import { LocalErrorsType } from "@/components/pages/bookings/view/CheckoutPaymentMethodDialog/CheckoutPaymentMethodDialog";

interface ValidateFormParams {
  paymentStatus: string;
  paymentMode: string;
  firstPaymentAmount: string;
  firstPaymentDate: string | null;
  firstPaymentMethod: string | null;
  secondPaymentAmount: string;
  secondPaymentDate: string | null;
  secondPaymentMethod: string | null;
  secondPaymentStatus: string;
  selectedCheckout: Checkout | null;
  initialErrors: LocalErrorsType;
  setErrors: (errors: LocalErrorsType) => void;
}

export function validateCheckoutForm({
    paymentStatus,
    paymentMode,
    firstPaymentAmount,
    firstPaymentDate,
    firstPaymentMethod,
    secondPaymentAmount,
    secondPaymentDate,
    secondPaymentMethod,
    secondPaymentStatus,
    selectedCheckout,
    initialErrors,
    setErrors,
}: ValidateFormParams): boolean {
    const newErrors: LocalErrorsType = { ...initialErrors };
    let isValid = true;

    // --- Primeira parcela ---
    if ([ "Pago", "Parcial" ].includes(paymentStatus)) {
        if (parseStringToCents(firstPaymentAmount) === 0) {
            newErrors.paymentInfo.firstPaymentAmount = "O valor da 1ª parcela é obrigatório.";
            isValid = false;
        } else {
            newErrors.paymentInfo.firstPaymentAmount = "";
        }

        const amount = parseStringToCents(firstPaymentAmount);
        const total = selectedCheckout!.totalPrice;

        const invalid =
  (paymentStatus === "Parcial" && amount >= total) ||
  (paymentStatus === "Pago" && amount > total);

        if (invalid) {
            newErrors.paymentInfo.firstPaymentAmount = "O valor precisa ser menor do que o valor total.";
            isValid = false;
        }

        if (!firstPaymentDate) {
            newErrors.paymentInfo.firstPaymentDate = "A data da 1ª parcela é obrigatória.";
            isValid = false;
        } else {
            newErrors.paymentInfo.firstPaymentDate = "";
        }

        if (!firstPaymentMethod) {
            newErrors.paymentInfo.firstPaymentMethod = "A forma da 1ª parcela é obrigatória.";
            isValid = false;
        } else {
            newErrors.paymentInfo.firstPaymentMethod = "";
        }
    } else {
        newErrors.paymentInfo.firstPaymentAmount = "";
        newErrors.paymentInfo.firstPaymentDate = "";
        newErrors.paymentInfo.firstPaymentMethod = "";
    }

    // --- Segunda parcela (modo parcelado) ---
    if (selectedCheckout?.CheckoutPayment.paymentMode === "Parcelado") {
        const pendingValue =
      selectedCheckout.totalPrice -
      selectedCheckout.CheckoutPayment.firstPaymentAmount;

        if (
            parseStringToCents(secondPaymentAmount) === 0 ||
      parseStringToCents(secondPaymentAmount) !== pendingValue
        ) {
            newErrors.paymentInfo.secondPaymentAmount =
        "A 2ª parcela precisa corresponder ao valor restante do pagamento.";
            isValid = false;
        } else {
            newErrors.paymentInfo.secondPaymentAmount = "";
        }

        if (!secondPaymentDate || secondPaymentDate === "") {
            newErrors.paymentInfo.secondPaymentDate = "A data da 2ª parcela é obrigatória.";
            isValid = false;
        } else {
            newErrors.paymentInfo.secondPaymentDate = "";
        }

        if (!secondPaymentMethod) {
            newErrors.paymentInfo.secondPaymentMethod = "A forma da 2ª parcela é obrigatória.";
            isValid = false;
        } else {
            newErrors.paymentInfo.secondPaymentMethod = "";
        }
    } else {
        newErrors.paymentInfo.secondPaymentAmount = "";
        newErrors.paymentInfo.secondPaymentDate = "";
        newErrors.paymentInfo.secondPaymentMethod = "";
    }

    // --- Segunda parcela paga (caso específico) ---
    if (paymentMode === "Parcelado" && secondPaymentStatus === "Pago") {
        if (parseStringToCents(secondPaymentAmount) === 0) {
            newErrors.paymentInfo.secondPaymentAmount = "O valor da 2ª parcela é obrigatório.";
            isValid = false;
        }
        if (!secondPaymentDate) {
            newErrors.paymentInfo.secondPaymentDate = "A data da 2ª parcela é obrigatória.";
            isValid = false;
        }
        if (!secondPaymentMethod) {
            newErrors.paymentInfo.secondPaymentMethod = "A forma da 2ª parcela é obrigatória.";
            isValid = false;
        }
    }

    setErrors(newErrors);
    return isValid;
}
