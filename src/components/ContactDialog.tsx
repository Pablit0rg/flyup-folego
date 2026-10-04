import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { enviarLead } from "@/lib/leads.functions";
import { leadSchema } from "@/lib/lead-schema";
import { whatsappLink } from "@/config/flyup";

const CONSENT_TEXT =
  "Autorizo o FlyUp a usar meu nome e WhatsApp para entrar em contato sobre meu plano de transição.";

export function ContactDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const enviar = useServerFn(enviarLead);
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [carreira, setCarreira] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErroGeral(null);
    const payload = {
      nome,
      whatsapp,
      carreiraAlvo: carreira || undefined,
      consentimento: consent,
      website,
    };
    const parsed = leadSchema.safeParse(payload);
    if (!parsed.success) {
      const map: Record<string, string> = {};
      for (const i of parsed.error.issues) map[String(i.path[0])] ??= i.message;
      setErros(map);
      return;
    }
    setErros({});
    setEnviando(true);
    try {
      await enviar({ data: parsed.data });
      window.open(whatsappLink(), "_blank", "noopener");
      onOpenChange(false);
    } catch {
      setErroGeral("Não foi possível enviar agora. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Vamos montar seu plano juntos</DialogTitle>
          <DialogDescription>
            Deixe seu contato e conversamos pelo WhatsApp. Seus valores financeiros não são enviados.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} maxLength={100} autoComplete="name" />
            {erros["nome"] && <p className="text-sm text-destructive">{erros["nome"]}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="whatsapp">WhatsApp (com DDD)</Label>
            <Input id="whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} inputMode="tel" placeholder="(11) 91234-5678" autoComplete="tel" />
            {erros["whatsapp"] && <p className="text-sm text-destructive">{erros["whatsapp"]}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="carreira">Carreira-alvo (opcional)</Label>
            <Input id="carreira" value={carreira} onChange={(e) => setCarreira(e.target.value)} maxLength={100} placeholder="Ex.: desenvolvimento web, dados, UX" />
            {erros["carreiraAlvo"] && <p className="text-sm text-destructive">{erros["carreiraAlvo"]}</p>}
          </div>
          {/* Honeypot anti-spam: invisível para pessoas */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label htmlFor="website">Site</label>
            <input id="website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>
          <div className="flex items-start gap-3">
            <Checkbox id="consent" checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-0.5" />
            <Label htmlFor="consent" className="text-sm font-normal leading-snug">{CONSENT_TEXT}</Label>
          </div>
          {erros["consentimento"] && <p className="text-sm text-destructive">{erros["consentimento"]}</p>}
          {erroGeral && <p className="text-sm text-destructive">{erroGeral}</p>}
          <Button type="submit" className="w-full" disabled={!consent || enviando}>
            {enviando ? "Enviando..." : "Enviar e abrir WhatsApp"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
