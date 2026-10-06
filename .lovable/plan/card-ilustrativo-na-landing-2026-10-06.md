# Card ilustrativo na landing

## Implementação
- Extrair a apresentação atual do resultado para um componente compartilhado, preservando exatamente o resultado real da calculadora.
- Na landing, calcular o exemplo com valores fixos pela função `calcular`: custo mensal de R$ 4.000, reserva de R$ 12.000 e R$ 1.000 guardados por mês. Isso produz 3,0 meses e estimativa de 12 meses até a referência de 6 meses.
- Exibir o card ao lado da manchete no desktop e logo abaixo do botão no celular, mantendo manchete e botão na primeira tela.
- Acrescentar apenas o selo “Exemplo” e a nota “Simulação ilustrativa. O seu resultado depende dos seus números.”, com semântica de exemplo ilustrativo e sem controles, foco, links ou eventos.
- Não alterar cálculo, formulário, WhatsApp, administração, autenticação, banco ou métricas.

## Verificação
- Testar que o exemplo deriva da mesma função e retorna 3,0 meses com os valores fixos.
- Conferir visualmente desktop e celular, inclusive ordem, primeira tela e ausência de interatividade.
