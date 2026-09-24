import { TrainingChargePayload } from "@/lib/zod/CreateTrainingValidation";
import { TrainingEnrollment, TrainingType } from "@/utils/@types/training";
import { TrainingChargeKind, TrainingPayment } from "@/utils/@types/payments";

/**
 * Itens de cobrança obrigatórios de um participante, por tipo de treinamento:
 *
 *  - COMUM: "Valor aluno" (BASE) para aluno e "Valor paciente modelo"
 *    (BASE_MODELO) para paciente modelo — quem tem os dois papéis tem os dois;
 *  - MPT:   "Garantia de vaga" e, apenas para paciente modelo, "Disparos".
 *
 * As cobranças adicionais (kind EXTRA) não entram aqui — são acrescentadas
 * caso a caso pelo usuário.
 *
 * Fonte única da regra: é usada na criação do treinamento (com os valores
 * digitados), ao adicionar um participante depois e ao mudar os papéis de uma
 * inscrição (com valor zerado, para o usuário preencher na lista de
 * Inscrições). Se o MPT ganhar uma cobrança obrigatória nova, os caminhos
 * precisam continuar iguais.
 */
export function buildRequiredCharges(
  trainingType: TrainingType,
  roles: { isTrainee: boolean; isModel: boolean },
  amounts?: {
    base?: number;
    model?: number;
    placeGuarantee?: number;
    shots?: number;
  },
): TrainingChargePayload[] {
  if (trainingType === "MPT") {
    const charges: TrainingChargePayload[] = [
      {
        kind: "GARANTIA_VAGA",
        description: "Garantia de vaga",
        amountCents: amounts?.placeGuarantee ?? 0,
        isRequired: true,
      },
    ];

    // Disparos é cobrado apenas de pacientes modelos.
    if (roles.isModel) {
      charges.push({
        kind: "DISPAROS",
        description: "Disparos",
        amountCents: amounts?.shots ?? 0,
        isRequired: true,
      });
    }

    return charges;
  }

  const charges: TrainingChargePayload[] = [];
  if (roles.isTrainee) {
    charges.push({
      kind: "BASE",
      description: "Valor aluno",
      amountCents: amounts?.base ?? 0,
      isRequired: true,
    });
  }
  if (roles.isModel) {
    charges.push({
      kind: "BASE_MODELO",
      description: "Valor paciente modelo",
      amountCents: amounts?.model ?? 0,
      isRequired: true,
    });
  }
  return charges;
}

// Cobranças que, num pagamento de quem também é aluno, são do paciente modelo.
const MODEL_CHARGE_KINDS: TrainingChargeKind[] = [ "BASE_MODELO", "DISPAROS" ];

/**
 * Parte de um pagamento que é do paciente modelo (o restante é do aluno).
 *
 * O papel vem da inscrição do pagamento; sem ela (legado ou cancelado), do
 * payerType. Só modelo: o pagamento inteiro é de paciente. Aluno (e talvez
 * modelo): só "Valor paciente modelo" e "Disparos" são de paciente.
 */
export function getModelShare(
  payment: TrainingPayment,
  enrollment?: TrainingEnrollment,
): number {
  const isTrainee = enrollment
    ? enrollment.isTrainee
    : payment.payerType === "TRAINEE";
  if (!isTrainee) return payment.totalPrice || 0;

  return (payment.TrainingCharge || [])
    .filter((c) => MODEL_CHARGE_KINDS.includes(c.kind))
    .reduce((acc, c) => acc + (c.amountCents || 0), 0);
}
