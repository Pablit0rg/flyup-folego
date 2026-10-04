import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Painel FlyUp" },
      { name: "description", content: "Painel interno de acompanhamento de leads do FlyUp." },
      { property: "og:title", content: "Painel FlyUp" },
      { property: "og:description", content: "Área restrita a administradores." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

type Lead = Database["public"]["Tables"]["leads"]["Row"];
type Status = Database["public"]["Enums"]["lead_status"];
const STATUS: { v: Status; l: string }[] = [
  { v: "novo", l: "Novo" },
  { v: "em_contato", l: "Em contato" },
  { v: "acompanhando", l: "Acompanhando" },
  { v: "descartado", l: "Descartado" },
];

function AdminPage() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  if (session === undefined) return <Shell><p className="text-muted-foreground">Carregando...</p></Shell>;
  if (!session) return <Shell><Login /></Shell>;
  return <Shell><Gate userId={session.user.id} /></Shell>;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link to="/" className="font-display text-xl font-bold text-primary">FlyUp</Link>
          <span className="text-sm text-muted-foreground">Painel</span>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-8">{children}</main>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setCarregando(false);
    if (error) setErro("E-mail ou senha incorretos.");
  }
  return (
    <form onSubmit={entrar} className="mx-auto max-w-sm space-y-4">
      <h1 className="font-display text-2xl font-bold text-primary">Entrar no painel</h1>
      <div className="space-y-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="senha">Senha</Label>
        <Input id="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" />
      </div>
      {erro && <p className="text-sm text-destructive">{erro}</p>}
      <Button type="submit" className="w-full" disabled={carregando}>{carregando ? "Entrando..." : "Entrar"}</Button>
    </form>
  );
}

function useSair() {
  const qc = useQueryClient();
  return async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
  };
}

function Gate({ userId }: { userId: string }) {
  const sair = useSair();
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["is-admin", userId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
      if (error) throw error;
      return data === true;
    },
  });
  if (isLoading) return <p className="text-muted-foreground">Verificando acesso...</p>;
  if (!isAdmin)
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-bold text-primary">Acesso negado</h1>
        <p className="text-muted-foreground">Sua conta não tem permissão de administrador.</p>
        <Button variant="outline" onClick={sair}>Sair</Button>
      </div>
    );
  return <Painel onSair={sair} />;
}

function Painel({ onSair }: { onSair: () => void }) {
  const contadores = useQuery({
    queryKey: ["contadores"],
    queryFn: async () => {
      const contar = async (tipo: string) => {
        const { count, error } = await supabase.from("eventos").select("*", { count: "exact", head: true }).eq("tipo", tipo);
        if (error) throw error;
        return count ?? 0;
      };
      const { count: leads, error } = await supabase.from("leads").select("*", { count: "exact", head: true });
      if (error) throw error;
      return { calculos: await contar("calculo_feito"), cliques: await contar("clique_ajuda"), leads: leads ?? 0 };
    },
  });
  const leads = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-primary">Leads</h1>
        <Button variant="outline" onClick={onSair}>Sair</Button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Contador label="Cálculos feitos" v={contadores.data?.calculos} />
        <Contador label="Cliques no botão de ajuda" v={contadores.data?.cliques} />
        <Contador label="Leads cadastrados" v={contadores.data?.leads} />
      </div>
      {leads.isLoading && <p className="text-muted-foreground">Carregando leads...</p>}
      {leads.error && <p className="text-destructive">Não foi possível carregar os leads.</p>}
      {leads.data?.length === 0 && <p className="text-muted-foreground">Nenhum lead ainda.</p>}
      <ul className="space-y-4">
        {leads.data?.map((l) => <LeadCard key={l.id} lead={l} />)}
      </ul>
    </div>
  );
}

function Contador({ label, v }: { label: string; v?: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold text-primary">{v ?? "—"}</p>
    </div>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  const qc = useQueryClient();
  const [obs, setObs] = useState(lead.observacoes ?? "");
  const [salvando, setSalvando] = useState(false);

  async function atualizar(patch: Partial<Pick<Lead, "status" | "observacoes">>) {
    setSalvando(true);
    const { error } = await supabase.from("leads").update(patch).eq("id", lead.id);
    setSalvando(false);
    if (error) return toast.error("Não foi possível salvar.");
    toast.success("Salvo.");
    qc.invalidateQueries({ queryKey: ["leads"] });
  }
  async function excluir() {
    const { error } = await supabase.from("leads").delete().eq("id", lead.id);
    if (error) return toast.error("Não foi possível excluir.");
    toast.success("Lead excluído.");
    qc.invalidateQueries({ queryKey: ["leads"] });
    qc.invalidateQueries({ queryKey: ["contadores"] });
  }

  return (
    <li className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-foreground">{lead.nome}</p>
          <a href={`https://wa.me/${lead.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline">
            +{lead.whatsapp}
          </a>
          <p className="text-sm text-muted-foreground">
            {lead.carreira_alvo || "Carreira-alvo não informada"} · {new Date(lead.created_at).toLocaleString("pt-BR")}
          </p>
        </div>
        <Select value={lead.status} onValueChange={(v) => atualizar({ status: v as Status })}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUS.map((s) => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="mt-4 space-y-2">
        <Label htmlFor={`obs-${lead.id}`}>Observações</Label>
        <Textarea id={`obs-${lead.id}`} value={obs} maxLength={2000} onChange={(e) => setObs(e.target.value)} rows={3} />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">{obs.length}/2000</span>
          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive">Excluir</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir este lead?</AlertDialogTitle>
                  <AlertDialogDescription>Os dados de {lead.nome} serão apagados definitivamente.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={excluir}>Excluir</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button size="sm" disabled={salvando} onClick={() => atualizar({ observacoes: obs.trim() ? obs : null })}>
              Salvar observações
            </Button>
          </div>
        </div>
      </div>
    </li>
  );
}
