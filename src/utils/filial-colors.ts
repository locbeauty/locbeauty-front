// Paleta categórica compartilhada pelos gráficos que pintam por filial
// (Receita Total e Ranking de filiais): a mesma filial recebe sempre a mesma
// cor, derivada da lista completa de filiais em ordem alfabética — assim os
// gráficos do dashboard ficam visualmente paralelos entre si.
export const FILIAL_COLOR_PALETTE = [
  "#2a78d6", // azul
  "#1baf7a", // verde-água
  "#eda100", // âmbar
  "#008300", // verde
  "#4a3aa7", // violeta
  "#c8401f", // tijolo
  "#a82a6e", // magenta
  "#12808a", // azul-petróleo
  "#7a5210", // castanho
];

/** Cor neutra para a fatia agregada "Outras" (não é uma filial). */
export const OTHERS_COLOR = "#4B5563";

/**
 * Mapeia nome da filial -> cor, de forma determinística (ordem alfabética da
 * lista completa de filiais). Passar sempre a lista completa — não apenas as
 * filiais exibidas — para que todos os gráficos derivem o mesmo mapa.
 */
export function buildFilialColorMap(
  filialNames: string[],
): Record<string, string> {
  const sorted = [ ...new Set(filialNames) ].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
  const map: Record<string, string> = {};
  sorted.forEach((name, index) => {
    map[name] = FILIAL_COLOR_PALETTE[index % FILIAL_COLOR_PALETTE.length];
  });
  return map;
}
