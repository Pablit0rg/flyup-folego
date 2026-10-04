import { z } from "zod";

/** Remove não-dígitos; com 10 ou 11 dígitos (DDD + número) prefixa 55. Retorna null se inválido. */
export function normalizeWhatsapp(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  const full = digits.length === 10 || digits.length === 11 ? `55${digits}` : digits;
  return /^55\d{10,11}$/.test(full) ? full : null;
}

export const leadSchema = z.object({
  nome: z.string().trim().min(1, "Informe seu nome").max(100, "Máximo de 100 caracteres"),
  whatsapp: z
    .string()
    .refine((v) => normalizeWhatsapp(v) !== null, "Informe um WhatsApp válido com DDD"),
  carreiraAlvo: z.string().trim().max(100, "Máximo de 100 caracteres").optional(),
  consentimento: z.literal(true, { message: "É preciso autorizar o contato" }),
  website: z.string().optional(), // honeypot
});

export type LeadInput = z.infer<typeof leadSchema>;
