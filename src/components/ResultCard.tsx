import { Button } from "@/components/ui/button";
import { META_MESES, type Resultado } from "@/lib/calc";

const fmt = (n: number) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

type ResultCardProps = {
  resultado: Resultado;
  onHelp?: () => void;
  example?: boolean;
};

export function ResultCard({ resultado, onHelp, example = false }: ResultCardProps) {
  const progresso = Math.min(100, (resultado.meses / META_MESES) * 100);

  return (
    <section
      className="relative rounded-2xl border border-border bg-card p-6"
      aria-label={example ? "Exemplo ilustrativo de resultado da calculadora" : undefined}
      aria-live={example ? undefined : "polite"}
    >
      {example && (
        <span className="absolute right-4 top-4 rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
          Exemplo
        </span>
      )}
      <p className="text-sm text-muted-foreground">Você tem</p>
      <p className="font-display text-5xl font-bold text-primary">
        {fmt(resultado.meses)} <span className="text-2xl font-semibold">meses de fôlego</span>
      </p>
      <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-success transition-all" style={{ width: `${progresso}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Meta de referência: {META_MESES} meses</p>

      {resultado.metaAtingida ? (
        <p className="mt-5 font-medium text-success-strong">Você já tem 6 meses ou mais de fôlego.</p>
      ) : resultado.estimativaMeses != null ? (
        <p className="mt-5 text-foreground">
          <span className="mr-2 rounded-md bg-success/15 px-2 py-0.5 text-xs font-semibold uppercase text-success-strong">
            estimativa
          </span>
          Guardando esse valor por mês, você chega a 6 meses de fôlego em cerca de{" "}
          <strong>
            {resultado.estimativaMeses} {resultado.estimativaMeses === 1 ? "mês" : "meses"}
          </strong>
          .
        </p>
      ) : null}

      {onHelp && (
        <Button onClick={onHelp} variant="secondary" size="lg" className="mt-6 h-auto w-full whitespace-normal py-3">
          Quer ajuda para montar seu plano de transição?
        </Button>
      )}

      {example && (
        <p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
          Simulação ilustrativa. O seu resultado depende dos seus números.
        </p>
      )}
    </section>
  );
}