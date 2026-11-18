import { Gear } from "@/utils/@types/gears";

// Nomes de equipamento se repetem entre filiais (sem unique no banco): a mesma
// máquina existe como registros distintos (gearId diferente) em cada filial.
// Nos filtros, cada nome deve aparecer uma vez e selecionar = todos os ids.

/** O mínimo para agrupar: vale para `Gear` e para o `Gear` de um booking. */
export type GearLike = Pick<Gear, "gearId" | "gearName">;

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

export function groupGearsByName(gears: GearLike[]): GearNameGroup[] {
  const groups = new Map<string, GearNameGroup>();

  for (const gear of gears) {
    const key = normalizeGearName(gear.gearName ?? "");
    const existing = groups.get(key);
    if (existing) {
      if (!existing.gearIds.includes(gear.gearId)) {
        existing.gearIds.push(gear.gearId);
      }
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
