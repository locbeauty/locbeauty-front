import { parseStringToCents } from "@/utils/parseStringToCents";
import { Checkout } from "../@types/checkouts";
import { Training } from "../@types/training"; // Importar o tipo Training
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

  // Agora aceita um ou outro (opcionais, mas pelo menos um deve existir na lógica)
  selectedCheckout?: Checkout | null;
  selectedTraining?: Training | null;

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
    selectedTraining,
    initialErrors,
    setErrors,
}: ValidateFormParams): boolean {
    const newErrors: LocalErrorsType = { ...initialErrors };
    let isValid = true;

    // 1. Normalização dos dados (Abstração)
    // Determina qual entidade está sendo editada para pegar o preço total e o objeto de pagamento salvo
    const entity = selectedCheckout || selectedTraining;

    if (!entity) {
        // Se nenhuma entidade for passada, não há como validar
        return false;
    }

    // Checkout usa 'totalPrice' e 'CheckoutPayment'
    // Training usa 'price' e 'TrainingPayment'
    const totalValue = selectedCheckout
        ? selectedCheckout.totalPrice
        : (selectedTraining ? selectedTraining.price : 0);

    const savedPaymentInfo = selectedCheckout
        ? selectedCheckout.CheckoutPayment
        : (selectedTraining ? selectedTraining.TrainingPayment : null);

    if (!savedPaymentInfo) return false;

    // --- Primeira parcela ---
    if ([ "Pago", "Parcial" ].includes(paymentStatus)) {
        const amount = parseStringToCents(firstPaymentAmount);

        if (amount === 0) {
            newErrors.paymentInfo.firstPaymentAmount = "O valor da 1ª parcela é obrigatório.";
            isValid = false;
        } else {
            newErrors.paymentInfo.firstPaymentAmount = "";
        }

        // Validação baseada no total normalizado
        const invalid =
            (paymentStatus === "Parcial" && amount >= totalValue) ||
            (paymentStatus === "Pago" && amount > totalValue);

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

    // --- Segunda parcela (modo parcelado - baseado no estado salvo no banco) ---
    if (savedPaymentInfo.paymentMode === "Parcelado") {
        const pendingValue = totalValue - savedPaymentInfo.firstPaymentAmount;

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

    // --- Segunda parcela paga (caso específico de atualização de form) ---
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