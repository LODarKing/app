# Regras do estúdio de motion

## Contrato de render
- Todo filme é uma função pura do tempo: `window.seek(t)` desenha o quadro do instante t.
- Sem transições de CSS, sem setTimeout, sem requestAnimationFrame no modo de render,
  sem estado carregado de um quadro pro outro. Ruído só com semente (mulberry32), nunca Math.random.
- Renderiza com `node render.mjs`, codifica em H.264 yuv420p, CRF 16.

## Visual
- Padrões proibidos: título centralizado em cima de gradiente, tudo entrando com fade,
  etiquetas nos cantos e molduras no quadro, brilho (glow) em interface, explosão genérica de partículas.
- Uma fonte de título, uma fonte de interface. Uma cor de destaque, a não ser que o briefing diga outra coisa.
- A cada 2 a 4 segundos alguma coisa nova tem que acontecer na tela.

## Som
- Trilha e efeitos são sintetizados em código, a não ser que eu forneça uma música.
- Os acertos sonoros caem na grade de batidas medida (beats.json). Volume em -14 LUFS.

## Loop antes de me mostrar qualquer coisa
1. Renderiza um quadro por batida numa folha de contato e OLHA pra ela.
2. Dá nota de 1 a 10 em: gancho nos 2 primeiros segundos, leitura em tela de celular,
   qualidade do movimento, variedade, fidelidade à marca, sincronia do som.
3. Corrige os 3 piores problemas. Repete até toda nota ser 8 ou mais.
4. Só então faz o render completo.
