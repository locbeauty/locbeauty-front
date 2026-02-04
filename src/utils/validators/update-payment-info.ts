import { parseStringToCents } from "@/utils/parseStringToCents";
import { Checkout } from "../@types/checkouts";
import { Training } from "../@types/training"; // Importar o tipo Training
import { LocalErrorsType } from "@/components/pages/trainings/TrainingPaymentMethodDialog";

interface ValidateFormParams {
  paymentStatus: string;
  paymentMode: string;
  firstPaymentAmount: string;
  firstPaymentDate: string | null;
  firstPaymentMethod: string | null;
  firstPaymentStatus?: string; // Add optional type to be backward compatible or strict depending on usage
  secondPaymentAmount: string;
  secondPaymentDate: string | null;
  secondPaymentMethod: string | null;
  secondPaymentStatus: string;

  // Agora aceita um ou outro (opcionais, mas pelo menos um deve existir na lógica)
  selectedCheckout?: Checkout | null;
  selectedTraining?: Training | null;

  totalValue?: number; // Novo campo opcional para validar valor total

  initialErrors: LocalErrorsType;
  isRefunded?: boolean; // New param to bypass strict validation
  setErrors: (errors: LocalErrorsType) => void;
}

export function validateCheckoutForm({
  paymentStatus,
  paymentMode,
  firstPaymentAmount,
  firstPaymentDate,
  firstPaymentMethod,
  firstPaymentStatus,
  secondPaymentAmount,
  secondPaymentDate,
  secondPaymentMethod,
  secondPaymentStatus,
  selectedCheckout,
  selectedTraining,
  totalValue: explicitTotalValue,
  initialErrors,
  isRefunded = false,
  setErrors,
}: ValidateFormParams): boolean {
  const newErrors: LocalErrorsType = { ...initialErrors };
  let isValid = true;

  // 1. Normalização dos dados (Abstração)
  const entity = selectedCheckout || selectedTraining;

  if (!entity) {
    return false;
  }

  // Prioriza o valor explícito, depois tenta checkout, por fim training (que pode não ter price direto)
  const totalValue =
    explicitTotalValue !== undefined
      ? explicitTotalValue
      : selectedCheckout
        ? selectedCheckout.totalPrice
        : selectedTraining?.TrainingPayment?.[0]?.totalPrice || 0;

  // --- Primeira parcela ---
  if ([ "Pago", "Parcial" ].includes(paymentStatus)) {
    const amount = parseStringToCents(firstPaymentAmount);

    if (amount === 0) {
      newErrors.paymentInfo.firstPaymentAmount =
        "O valor da 1ª parcela é obrigatório.";
      isValid = false;
    } else {
      newErrors.paymentInfo.firstPaymentAmount = "";
    }

    // Validação baseada no total normalizado
    // Se for Parcial/Parcelado, deve ser estritamente menor que o total.
    // Se for Pago/A Vista, pode ser igual (mas não maior).
    // Ignoramos a regra estrita se o status for "Pago" para evitar conflitos com dados legados ou transições.
    let invalid = false;
    let errorMsg = "";

    if (
      (paymentMode === "Parcelado" || paymentStatus === "Parcial") &&
      paymentStatus !== "Pago"
    ) {
      if (amount >= totalValue) {
        invalid = true;
        errorMsg = "O valor da 1ª parcela deve ser menor que o total.";
      }
    } else {
      if (amount > totalValue) {
        invalid = true;
        errorMsg = "O valor não pode ser maior do que o valor total.";
      }
    }

    if (invalid) {
      newErrors.paymentInfo.firstPaymentAmount = errorMsg;
      isValid = false;
    }

    if (!firstPaymentDate) {
      newErrors.paymentInfo.firstPaymentDate =
        "A data da 1ª parcela é obrigatória.";
      isValid = false;
    } else {
      newErrors.paymentInfo.firstPaymentDate = "";
    }

    if (!firstPaymentMethod) {
      newErrors.paymentInfo.firstPaymentMethod =
        "A forma da 1ª parcela é obrigatória.";
      isValid = false;
    } else {
      newErrors.paymentInfo.firstPaymentMethod = "";
    }
  } else {
    newErrors.paymentInfo.firstPaymentAmount = "";
    newErrors.paymentInfo.firstPaymentDate = "";
    newErrors.paymentInfo.firstPaymentMethod = "";
  }

  // --- Segunda parcela ---
  // A validação agora depende do MODO atual ou da escolha 'Parcial' que força o parcelamento
  const isParcelledMode =
    paymentMode === "Parcelado" || paymentStatus === "Parcial";

  if (isParcelledMode && paymentStatus !== "Pago") {
    const firstAmountCents = parseStringToCents(firstPaymentAmount);
    const pendingValue = Math.max(totalValue - firstAmountCents, 0);

    const currentSecondAmount = parseStringToCents(secondPaymentAmount);

    // Se há valor pendente, a segunda parcela deve bater com ele
    if (pendingValue > 0) {
      if (firstPaymentStatus === "Pendente") {
        newErrors.paymentInfo.secondPaymentAmount = "";
        newErrors.paymentInfo.secondPaymentDate = "";
      } else {
        // Skip amount validation if refunded (or we might want to keep it? User said allow saving without filling info. "Pendente" second parcel with 0 amount might fail this check)
        // Actually, if it's refunded, we allow incomplete second data.
        if (!isRefunded) {
          if (
            currentSecondAmount === 0 ||
            currentSecondAmount !== pendingValue
          ) {
            // Nota: como o sistema auto-calcula, esse erro raramente deve aparecer, mas previne manipulação manual incorreta
            newErrors.paymentInfo.secondPaymentAmount =
              "A 2ª parcela precisa corresponder ao valor restante.";
            isValid = false;
          } else {
            newErrors.paymentInfo.secondPaymentAmount = "";
          }
        } else {
          newErrors.paymentInfo.secondPaymentAmount = ""; // Clear error if refunded
        }

        // Data é obrigatória apenas se a primeira parcela já foi paga (Status: Parcial)
        // A regra do usuário é: "apenas se este [firstPaymentStatus] for 'Pago'"
        if (firstPaymentStatus === "Pago") {
          if ((!secondPaymentDate || secondPaymentDate === "") && !isRefunded) {
            // Skip date required check if refunded
            newErrors.paymentInfo.secondPaymentDate =
              "A data prevista é obrigatória.";
            isValid = false;
          } else {
            newErrors.paymentInfo.secondPaymentDate = "";
          }
        } else {
          newErrors.paymentInfo.secondPaymentDate = "";
        }
      }

      // Override errors if isRefunded is true - we allow saving potentially incomplete second parcel info if we are refunding the first.
      if (isRefunded) {
        newErrors.paymentInfo.secondPaymentAmount = "";
        newErrors.paymentInfo.secondPaymentDate = "";
        newErrors.paymentInfo.secondPaymentMethod = "";
      }
    }
    // Se pendingValue for 0 (primeira parcela cobriu tudo), teoricamente não deveria estar aqui ou status seria Pago.
  } else {
    newErrors.paymentInfo.secondPaymentAmount = "";
    newErrors.paymentInfo.secondPaymentDate = "";
    newErrors.paymentInfo.secondPaymentMethod = "";
  }

  // --- Segunda parcela já paga (Validação extra se o status da segunda for marcado como Pago manual, se houver essa opção) ---
  if (isParcelledMode && secondPaymentStatus === "Pago" && !isRefunded) {
    if (parseStringToCents(secondPaymentAmount) === 0) {
      newErrors.paymentInfo.secondPaymentAmount =
        "O valor da 2ª parcela é obrigatório.";
      isValid = false;
    }
    if (!secondPaymentDate) {
      newErrors.paymentInfo.secondPaymentDate =
        "A data do pagamento é obrigatória.";
      isValid = false;
    }
    if (!secondPaymentMethod) {
      newErrors.paymentInfo.secondPaymentMethod =
        "A forma de pagamento é obrigatória.";
      isValid = false;
    }
  }

  setErrors(newErrors);
  return isValid;
}
