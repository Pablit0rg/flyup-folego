import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { leadSchema, normalizeWhatsapp } from "./lead-schema";

// Recebe apenas dados de contato. Nenhum valor financeiro faz parte deste contrato.
export const enviarLead = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => leadSchema.parse(data))
  .handler(async ({ data }) => {
    // Honeypot preenchido: descarta silenciosamente.
    if (data.website && data.website.trim() !== "") return { ok: true };

    const whatsapp = normalizeWhatsapp(data.whatsapp);
    if (!whatsapp) throw new Error("WhatsApp inválido");

    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const supabase = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    const carreira = data.carreiraAlvo?.trim();
    const { error } = await supabase.from("leads").insert({
      nome: data.nome.trim(),
      whatsapp,
      carreira_alvo: carreira ? carreira : null,
      consentimento: true,
    });
    if (error) {
      console.error("Erro ao salvar lead", error);
      throw new Error("Não foi possível enviar agora. Tente novamente.");
    }
    await supabase.from("eventos").insert({ tipo: "lead_enviado" });
    return { ok: true };
  });
