import { TrainingChargePayload } from "@/lib/zod/CreateTrainingValidation";
import { TrainingType } from "@/utils/@types/training";

/**
 * Itens de cobrança obrigatórios de um participante, por tipo de treinamento:
 *
 *  - COMUM: uma cobrança "Valor base";
 *  - MPT:   "Garantia de vaga" e, apenas para paciente modelo, "Disparos".
 *
 * As cobranças adicionais (kind EXTRA) não entram aqui — são acrescentadas
 * caso a caso pelo usuário.
 *
 * Fonte única da regra: é usada tanto na criação do treinamento (com os valores
 * digitados) quanto ao adicionar um participante depois (com valor zerado, para
 * o usuário preencher na lista de Inscrições). Se o MPT ganhar uma cobrança
 * obrigatória nova, os dois caminhos precisam continuar iguais.
 */
export function buildRequiredCharges(
  trainingType: TrainingType,
  isModel: boolean,
  amounts?: { base?: number; placeGuarantee?: number; shots?: number },
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
    if (isModel) {
      charges.push({
        kind: "DISPAROS",
        description: "Disparos",
        amountCents: amounts?.shots ?? 0,
        isRequired: true,
      });
    }

    return charges;
  }

  return [
    {
      kind: "BASE",
      description: "Valor base",
      amountCents: amounts?.base ?? 0,
      isRequired: true,
    },
  ];
}
