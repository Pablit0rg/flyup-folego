// Cálculo puro, executado somente no navegador.
export const META_MESES = 6;

export type Resultado = {
  meses: number;
  metaAtingida: boolean;
  estimativaMeses: number | null;
};

export function parseReais(v: string): number | null {
  const t = v.trim();
  if (t === "") return null;
  const norm = t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t;
  const n = Number(norm);
  return Number.isFinite(n) ? n : NaN;
}

export function calcular(custo: number, reserva: number, guardado: number | null): Resultado {
  const meses = reserva / custo;
  const metaAtingida = meses >= META_MESES;
  let estimativaMeses: number | null = null;
  if (!metaAtingida && guardado != null && guardado > 0) {
    estimativaMeses = Math.ceil((META_MESES * custo - reserva) / guardado);
  }
  return { meses, metaAtingida, estimativaMeses };
}
