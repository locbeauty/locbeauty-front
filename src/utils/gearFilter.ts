import type { Checkout } from "@/utils/@types/checkouts";
import type { Training } from "@/utils/@types/training";
import { GearLike, normalizeGearName } from "./groupGearsByName";

// Filtro de equipamentos da agenda.
//
// O mesmo equipamento existe como vários registros (gearId):
//  - um por filial;
//  - um novo quando é excluído e recadastrado (os agendamentos antigos seguem
//    apontando para o registro excluído, que some da lista de equipamentos);
//  - e um agendamento pode usar o registro de OUTRA filial.
// Comparar por id deixava esses agendamentos de fora mesmo com o nome do
// equipamento aparecendo no evento. Por isso o filtro compara pelo nome — o
// mesmo que a agenda exibe —, e os ids selecionados só servem para descobrir
// quais nomes foram escolhidos.

/** Equipamentos que aparecem nos eventos (máquinas ativas e treinamentos). */
export function gearsInEvents(
  checkouts: Pick<Checkout, "Bookings">[],
  trainings: Pick<Training, "gearId" | "Gear">[],
): GearLike[] {
  const gears: GearLike[] = [];

  for (const checkout of checkouts) {
    for (const booking of checkout.Bookings ?? []) {
      if (booking.status === "ACTIVE" && booking.Gear) gears.push(booking.Gear);
    }
  }
  for (const training of trainings) {
    if (training.Gear?.gearName) {
      gears.push({
        gearId: training.Gear.gearId ?? training.gearId,
        gearName: training.Gear.gearName,
      });
    }
  }

  return gears;
}

/** Junta listas de equipamentos sem repetir gearId (vale a primeira). */
export function mergeGearOptions(...lists: GearLike[][]): GearLike[] {
  const byId = new Map<string, GearLike>();
  for (const list of lists) {
    for (const gear of list) {
      if (!byId.has(gear.gearId)) {
        byId.set(gear.gearId, { gearId: gear.gearId, gearName: gear.gearName });
      }
    }
  }
  return Array.from(byId.values());
}

/** Nomes (normalizados) dos equipamentos selecionados. */
export function resolveSelectedGearNames(
  selectedGearIds: string[],
  knownGears: GearLike[],
): Set<string> {
  const selected = new Set(selectedGearIds);
  return new Set(
    knownGears
      .filter((gear) => selected.has(gear.gearId))
      .map((gear) => normalizeGearName(gear.gearName)),
  );
}

/** O agendamento tem (ainda ativo) algum dos equipamentos? */
export function checkoutUsesGearNames(
  checkout: Pick<Checkout, "Bookings">,
  gearNames: Set<string>,
): boolean {
  return (checkout.Bookings ?? []).some(
    (booking) =>
      booking.status === "ACTIVE" &&
      gearNames.has(normalizeGearName(booking.Gear?.gearName ?? "")),
  );
}

/** O treinamento é de algum dos equipamentos? */
export function trainingUsesGearNames(
  training: Pick<Training, "Gear">,
  gearNames: Set<string>,
): boolean {
  return gearNames.has(normalizeGearName(training.Gear?.gearName ?? ""));
}
