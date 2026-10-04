import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/SiteHeader";
import { ContactDialog } from "@/components/ContactDialog";
import { calcular, parseReais, META_MESES, type Resultado } from "@/lib/calc";
import { registrarEvento } from "@/lib/eventos";

export const Route = createFileRoute("/calculadora")({
  head: () => ({
    meta: [
      { title: "Calculadora de meses de fôlego — FlyUp" },
      { name: "description", content: "Informe seu custo de vida e sua reserva e veja quantos meses de fôlego você tem para a transição de carreira." },
      { property: "og:title", content: "Calculadora de meses de fôlego — FlyUp" },
      { property: "og:description", content: "Calcule no seu navegador quantos meses sua reserva cobre. Nenhum valor é salvo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Calculadora,
});

const fmt = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function Calculadora() {
  // Valores financeiros existem apenas neste estado local; nunca são enviados.
  const [custo, setCusto] = useState("");
  const [reserva, setReserva] = useState("");
  const [guardado, setGuardado] = useState("");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [res, setRes] = useState<Resultado | null>(null);
  const [aberto, setAberto] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const c = parseReais(custo);
    const r = parseReais(reserva);
    const g = parseReais(guardado);
    const err: Record<string, string> = {};
    if (c == null || Number.isNaN(c) || c <= 0) err.custo = "Informe um custo de vida maior que zero.";
    if (r == null || Number.isNaN(r) || r < 0) err.reserva = "Informe uma reserva igual ou maior que zero.";
    if (g != null && (Number.isNaN(g) || g < 0)) err.guardado = "Informe um valor igual ou maior que zero.";
    setErros(err);
    if (Object.keys(err).length > 0) {
      setRes(null);
      return;
    }
    setRes(calcular(c!, r!, g));
    registrarEvento("calculo_feito");
  }

  function abrirAjuda() {
    registrarEvento("clique_ajuda");
    setAberto(true);
  }

  const progresso = res ? Math.min(100, (res.meses / META_MESES) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-xl px-5 py-10">
        <h1 className="font-display text-3xl font-bold text-primary">Seus meses de fôlego</h1>
        <p className="mt-2 text-muted-foreground">Tudo é calculado aqui no seu navegador. Nada é salvo.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
          <Campo id="custo" label="Custo de vida mensal (R$)" value={custo} onChange={setCusto} erro={erros.custo} />
          <Campo id="reserva" label="Reserva atual (R$)" value={reserva} onChange={setReserva} erro={erros.reserva} />
          <Campo id="guardado" label="Quanto consegue guardar por mês (R$, opcional)" value={guardado} onChange={setGuardado} erro={erros.guardado} />
          <Button type="submit" size="lg" className="w-full">Calcular</Button>
        </form>

        {res && (
          <section className="mt-8 rounded-2xl border border-border bg-card p-6" aria-live="polite">
            <p className="text-sm text-muted-foreground">Você tem</p>
            <p className="font-display text-5xl font-bold text-primary">
              {fmt(res.meses)} <span className="text-2xl font-semibold">meses de fôlego</span>
            </p>
            <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-success transition-all" style={{ width: `${progresso}%` }} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Meta de referência: {META_MESES} meses</p>

            {res.metaAtingida ? (
              <p className="mt-5 font-medium text-success-strong">Você já tem 6 meses ou mais de fôlego.</p>
            ) : res.estimativaMeses != null ? (
              <p className="mt-5 text-foreground">
                <span className="mr-2 rounded-md bg-success/15 px-2 py-0.5 text-xs font-semibold uppercase text-success-strong">estimativa</span>
                Guardando esse valor por mês, você chega a 6 meses de fôlego em cerca de{" "}
                <strong>{res.estimativaMeses} {res.estimativaMeses === 1 ? "mês" : "meses"}</strong>.
              </p>
            ) : null}

            <Button onClick={abrirAjuda} variant="secondary" size="lg" className="mt-6 w-full whitespace-normal h-auto py-3">
              Quer ajuda para montar seu plano de transição?
            </Button>
          </section>
        )}

        <p className="mt-8 rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
          Isto não é recomendação de investimento.
        </p>
      </main>
      <ContactDialog open={aberto} onOpenChange={setAberto} />
    </div>
  );
}

function Campo(props: { id: string; label: string; value: string; onChange: (v: string) => void; erro?: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={props.id}>{props.label}</Label>
      <Input
        id={props.id}
        inputMode="decimal"
        autoComplete="off"
        placeholder="0,00"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        aria-invalid={!!props.erro}
      />
      {props.erro && <p className="text-sm text-destructive">{props.erro}</p>}
    </div>
  );
}
