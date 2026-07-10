import { Gear } from "@/utils/@types/gears";

// Nomes de equipamento se repetem entre filiais (sem unique no banco): a mesma
// máquina existe como registros distintos (gearId diferente) em cada filial.
// Nos filtros, cada nome deve aparecer uma vez e selecionar = todos os ids.

export function normalizeGearName(name: string): string {
  return name.trim().toLowerCase();
}

export interface GearNameGroup {
  /** Nome normalizado (chave do grupo). */
  key: string;
  /** Nome de exibição (primeiro encontrado, trim). */
  gearName: string;
  /** Todos os gearIds que compartilham o nome. */
  gearIds: string[];
}

export function groupGearsByName(gears: Gear[]): GearNameGroup[] {
  const groups = new Map<string, GearNameGroup>();

  for (const gear of gears) {
    const key = normalizeGearName(gear.gearName ?? "");
    const existing = groups.get(key);
    if (existing) {
      existing.gearIds.push(gear.gearId);
    } else {
      groups.set(key, {
        key,
        gearName: (gear.gearName ?? "").trim(),
        gearIds: [ gear.gearId ],
      });
    }
  }

  return Array.from(groups.values());
}
