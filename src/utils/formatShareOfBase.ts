/**
 * Fatia que um recorte representa dentro da base de clientes, em porcentagem.
 *
 * Os cards de Clientes Ativos/Inativos exibiam a VARIAÇÃO em relação à janela
 * anterior com o texto "da base de clientes" — dois números sem relação entre
 * si (ex.: "-10.8% da base de clientes"). Aqui a conta é a fatia de verdade.
 */
export function formatShareOfBase(count: number, total: number): string {
  if (!total || total <= 0) return "—";

  return `${((count / total) * 100).toFixed(1)}%`;
}
