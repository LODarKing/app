# Storyboard: "A curva que é mais curta"

> **v2:** a narração agora é a do ElevenLabs (texto em `roteiro_final.txt`). Os tempos abaixo são da v1 e serão refeitos no episódio. Revelação planejada para "tudo começa a fazer sentido" (40,9 s); cena 4 na pausa de 2,2 s depois dela.

**Formato:** 1080×1920, 30 fps. Os tempos vêm da narração medida (`audio/narracao_tempos.json`, 66,5 s). Os eventos ficam na grade de 96 BPM medida (`remotion/src/data/beats.json`).

## Ideia visual central
O mapa é tratado como uma **folha física**. Uma única fórmula (`remotion/src/morph.ts`) leva a folha do Mercator à esfera de forma contínua, em duas etapas:
1. Desfaz o esticamento vertical do Mercator (u: 0 → 1).
2. Curva a folha numa calota de raio 1/s até fechar a esfera (s: 0 → 1).

Cada rota, marcador e círculo é recalculado a partir de lat/lon em todo quadro, então a correspondência geográfica nunca se perde.

A revelação usa uma propriedade real das esferas. Com o globo centrado no ponto médio do círculo máximo, **a rota ciano vira uma reta perfeita** na tela, porque todo círculo máximo que passa pelo centro da vista é projetado como reta. Ao mesmo tempo, a linha amarela, que era reta no Mercator, aparece curva. A curva e a reta trocam de papel diante do espectador.

**Código de cores:** ciano = círculo máximo; amarelo = linha reta do Mercator (loxodromia).

## Cena 01: O gancho (0–8,1 s) ✅ produzida no piloto
| Tempo | Imagem | Som |
|---|---|---|
| 0,0 | Mapa de Mercator real, já em cena. O marcador de Nova York entra no quadro 0 e o de Tóquio na batida 0,25. Rótulo "MAPA DE MERCATOR" preso à borda do mapa. | "ping" de cada marcador |
| 0,0–0,47 | A linha reta amarela é traçada. | traço |
| 0,47–1,9 | O círculo máximo ciano é traçado. O avião vetorial acompanha a rota até Tóquio (6,6 s). A câmera se aproxima devagar. | traço ascendente, sopro do avião |
| 3,1 / 3,75 | Título "POR QUE ESSA" e "CURVA?" entram por varredura. | dois impactos |
| 4,4 | "CURVA?" se arqueia como a própria rota. | glissando curto |
| 5,0 / 5,6 | "Parece um desvio": hachura entre as linhas, rótulos LINHA RETA e ROTA CURVA, e "DESVIO?". | hachura, tique |
| 6,9–8,1 | "Mas olha só…": as rotas recuam e entram 5 círculos de Tissot de 1.000 km reais (0°, 30°, 50°, 62°, 72°). No Mercator eles crescem ×1,0, ×1,2, ×1,6, ×2,1, ×3,2 (sec φ). | 5 bolhas, mais graves quanto maior o círculo |

## Cena 02: O mapa está te enganando (8,1–19 s) ⏳ início no piloto
| Tempo | Imagem |
|---|---|
| 8,1 | A câmera recua. |
| 8,75–15,6 | O Mercator se desfaz enquanto a folha se curva. Os círculos de Tissot convergem para o mesmo tamanho e mostram que a distorção estava no mapa. |
| 13,3 | Texto "O MAPA DISTORCE DISTÂNCIAS" (episódio). |
| 17,2 | A esfera se fecha. Mesmos pontos, mesmas rotas. |

## Cena 03: A revelação (19–38 s) ⏳
- **19,4** "No globo…": o globo gira para centrar o ponto médio do círculo máximo. Texto "CÍRCULO MÁXIMO", depois "O MENOR CAMINHO SOBRE A ESFERA". Plano de corte do círculo máximo passando pelo centro da Terra (diagrama).
- **24,7** "em muitos mapas, esse arco parece uma curva enorme": um mini-Mercator da cena 1 aparece encaixado, ligado ao globo.
- **29,0** "Agora compare as duas rotas": órbita suave e as duas rotas sobre a esfera.
- **32,5 "Surpresa"**: o globo termina de se alinhar e a rota ciano vira **reta**, enquanto a amarela se curva. É o momento em que a projeção plana "termina" de virar globo. Comparativo com distâncias calculadas no modelo esférico: 10.849 km × 12.787 km.

## Cena 04: Mesma rota, outra perspectiva (≈36–42 s) ⏳
Tela dividida: mapa plano (esquerda) e globo (direita). A mesma rota percorre os dois, com marcadores de correspondência a cada 25% do trajeto e linhas finas ligando os pares. Texto "MESMA ROTA. OUTRA PERSPECTIVA."
> Observação: o roteiro não tem frase própria para esta cena. Ela ocupa o fim de "a menor distância!" e a pausa antes de "Mas atenção". Se precisar de mais tempo, sugiro abrir 1,5 s de respiro nesse ponto, sem acelerar a fala.

## Cena 05: Por que os voos reais variam (38–55 s) ⏳
Sobre o globo, uma segunda trajetória **rotulada "SIMULAÇÃO ILUSTRATIVA"** se afasta do círculo máximo. Os símbolos surgem junto com as palavras:
- **ventos:** setas de corrente de jato genéricas, sem dados atuais;
- **tempestades:** célula hachurada;
- **espaço aéreo restrito:** polígono tracejado;
- **controle de tráfego:** setores e espaçamento entre aeronaves.

Texto: "MAIS CURTO ≠ SEMPRE MAIS RÁPIDO".

## Cena 06: Encerramento (55–66,5 s) ⏳
O globo volta a ser mapa (fórmula inversa) e a curva ciano fica em destaque, com o avião passando rápido. A câmera se afasta e mostra a assinatura "ALÉM DO VISÍVEL / O EXTRAORDINÁRIO ESTÁ NOS DETALHES."
> ⚠️ O símbolo AV original **não está no repositório**. Preciso do arquivo (SVG ou PNG) para não redesenhar a marca.
