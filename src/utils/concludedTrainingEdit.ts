import { USER_ROLES } from "@/utils/constants";

// Espelha as regras do backend (utils/concluded-training-edit.ts): alterar um
// treinamento concluído é restrito a Master, Gerente e Comercial, dentro de
// 48h após a conclusão. O Master pode alterar a qualquer momento.

export const CONCLUDED_TRAINING_EDIT_WINDOW_HOURS = 48;

const EDIT_ROLES: string[] = [
  USER_ROLES.MASTER,
  USER_ROLES.GERENTE,
  USER_ROLES.COMERCIAL,
];

export function canRoleEditConcludedTraining(role?: string | null): boolean {
  return !!role && EDIT_ROLES.includes(role);
}

export function hasUnlimitedConcludedTrainingEdit(
  role?: string | null,
): boolean {
  return role === USER_ROLES.MASTER;
}

/** Fim da janela de edição; `null` quando a conclusão não foi carimbada. */
export function getConcludedTrainingEditDeadline(
  concludedAt?: string | Date | null,
): Date | null {
  if (!concludedAt) return null;
  const concluded = new Date(concludedAt);
  if (Number.isNaN(concluded.getTime())) return null;
  return new Date(
    concluded.getTime() + CONCLUDED_TRAINING_EDIT_WINDOW_HOURS * 60 * 60 * 1000,
  );
}

export function isWithinConcludedTrainingEditWindow(
  concludedAt?: string | Date | null,
  now: Date = new Date(),
): boolean {
  const deadline = getConcludedTrainingEditDeadline(concludedAt);
  if (!deadline) return false;
  return now < deadline;
}

export function formatEditDeadline(date: Date): string {
  return `${date.toLocaleDateString("pt-BR")} às ${date.toLocaleTimeString(
    "pt-BR",
    { hour: "2-digit", minute: "2-digit" },
  )}`;
}
