import { supabase } from "@/integrations/supabase/client";

export type TipoEvento = "calculo_feito" | "clique_ajuda";

/** Registra apenas o tipo do evento. Nenhum valor ou dado pessoal. */
export function registrarEvento(tipo: TipoEvento) {
  void supabase.from("eventos").insert({ tipo }).then(({ error }) => {
    if (error) console.warn("Falha ao registrar evento", error.message);
  });
}
