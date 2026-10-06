import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ResultCard } from "@/components/ResultCard";
import { SiteHeader } from "@/components/SiteHeader";
import { calcular } from "@/lib/calc";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FlyUp — Quantos meses você aguenta se der o salto?" },
      { name: "description", content: "Calcule seus meses de fôlego para a transição de carreira em tecnologia: sua reserva dividida pelo custo de vida." },
      { property: "og:title", content: "FlyUp — Meses de fôlego para sua transição de carreira" },
      { property: "og:description", content: "Descubra quantos meses você aguenta se mudar de carreira para tecnologia. O cálculo é feito no seu navegador." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const passos = [
  { n: "1", t: "Informe seu custo de vida", d: "Quanto você gasta por mês para viver." },
  { n: "2", t: "Informe sua reserva", d: "Quanto você tem guardado hoje." },
  { n: "3", t: "Veja seus meses de fôlego", d: "Por quanto tempo sua reserva cobre seus gastos." },
];

export const EXAMPLE_INPUTS = {
  custo: 4_000,
  reserva: 12_000,
  guardado: 1_000,
} as const;

const exampleResult = calcular(EXAMPLE_INPUTS.custo, EXAMPLE_INPUTS.reserva, EXAMPLE_INPUTS.guardado);

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5">
        <section className="grid gap-8 py-8 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-12 lg:py-20">
          <div className="min-w-0">
            <h1 className="font-display text-4xl font-bold leading-tight text-primary sm:text-5xl">
              Quantos meses você aguenta se der o salto?
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              O FlyUp mede os meses de fôlego de quem está mudando de carreira para tecnologia: a sua reserva
              dividida pelo seu custo de vida. Um número simples para planejar a transição com mais calma.
            </p>
            <Button asChild size="lg" className="mt-8 w-full sm:w-auto">
              <Link to="/calculadora">Calcular meus meses de fôlego</Link>
            </Button>
          </div>
          <div className="min-w-0" aria-hidden={undefined}>
            <ResultCard resultado={exampleResult} example />
          </div>
        </section>

        <section className="pb-14">
          <h2 className="font-display text-2xl font-semibold text-primary">Como funciona</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            {passos.map((p) => (
              <li key={p.n} className="rounded-xl border border-border bg-card p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-success/15 font-display font-bold text-success-strong">
                  {p.n}
                </span>
                <h3 className="mt-3 font-semibold text-foreground">{p.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.d}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mb-16 rounded-2xl bg-primary p-7 text-primary-foreground">
          <h2 className="font-display text-2xl font-semibold">Seus números ficam com você</h2>
          <p className="mt-3 opacity-90">
            O cálculo acontece no seu navegador e nenhum valor financeiro é salvo. Nem a gente vê quanto você
            ganha, gasta ou tem guardado.
          </p>
        </section>
      </main>
    </div>
  );
}
