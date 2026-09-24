import { Training } from "@/utils/@types/training";
import { TrainingPayment } from "@/utils/@types/payments";
import { Volunteer } from "@/utils/@types/volunteer";

const onlyDigits = (value?: string | null) => (value ?? "").replace(/\D/g, "");

/**
 * Participação de um paciente modelo (Volunteer) numa turma, com o pagamento
 * dele. Vale o vínculo legado (Training.Volunteers / volunteerId) ou a
 * inscrição unificada de um Customer modelo com o mesmo documento — é assim
 * que quem foi inscrito como cliente aparece na aba "Pacientes modelo".
 * Devolve null quando ele não está na turma.
 */
export function findVolunteerParticipation(
  training: Training,
  volunteer: Volunteer,
): { payment?: TrainingPayment } | null {
  const id = volunteer.volunteerId;
  if (
    training.volunteerId === id ||
    training.Volunteers?.some((v) => v.volunteerId === id)
  ) {
    return {
      payment: training.TrainingPayment?.find(
        (p) =>
          p.payerType === "VOLUNTEER" &&
          (p.volunteerId === id || (!p.volunteerId && training.volunteerId === id)),
      ),
    };
  }

  const document = onlyDigits(volunteer.documentNumber);
  if (!document) return null;
  const enrollment = training.Enrollments?.find(
    (e) =>
      e.isModel &&
      [ e.Customer?.cpf, e.Customer?.cnpj ].some((d) => onlyDigits(d) === document),
  );
  if (!enrollment) return null;
  return {
    payment: training.TrainingPayment?.find(
      (p) => p.enrollmentId === enrollment.enrollmentId,
    ),
  };
}
