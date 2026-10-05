// Configuração do FlyUp. Troque o número antes de publicar.
// Formato internacional, apenas dígitos: 55 + DDD + número (sem +, espaços ou traços).
export const WHATSAPP_NUMBER = "5541996219078";

export const WHATSAPP_MESSAGE =
  "Olá! Calculei meus meses de fôlego no FlyUp e quero ajuda com meu plano de transição.";

export function whatsappLink() {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
}
