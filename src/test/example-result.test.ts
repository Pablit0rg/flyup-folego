import { describe, expect, it } from "vitest";

import { calcular } from "@/lib/calc";
import { EXAMPLE_INPUTS } from "@/routes/index";

describe("resultado ilustrativo da landing", () => {
  it("usa a mesma função da calculadora e resulta em 3,0 meses", () => {
    const resultado = calcular(EXAMPLE_INPUTS.custo, EXAMPLE_INPUTS.reserva, EXAMPLE_INPUTS.guardado);

    expect(resultado.meses).toBe(3);
    expect(resultado.estimativaMeses).toBe(12);
  });
});