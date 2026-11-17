# Storyboard final: "A curva que é mais curta"

**Formato:** 1080×1920, 30 fps, **67,5 s**. A narração é a do ElevenLabs, montada (`roteiro_final.txt`). Todos os eventos ficam na grade medida de 96 BPM (`remotion/src/data/beats.json`) e estão definidos em `remotion/src/data/eventos.json`, fonte única para imagem e som.

## Ideia visual
O mapa é uma **folha física**. Uma única fórmula (`morph.ts`, a mesma no shader WebGL) leva a folha do Mercator à esfera e de volta, de forma contínua. Cada rota, marcador e círculo é recalculado a partir de lat/lon em todo quadro.

A revelação usa uma propriedade real das esferas. Com o globo centrado no ponto médio do círculo máximo, **a rota ciano vira uma reta na tela**: todo círculo máximo que passa pelo centro da vista é projetado como reta. Ao mesmo tempo, a "linha reta" do mapa vira um U.

**Cores:** ciano = círculo máximo; amarelo = linha reta do Mercator (loxodromia); branco tracejado = rota simulada.

| Tempo (s) | Fala | Imagem |
|---|---|---|
| **Cena 1: Gancho** | | |
| 0,0–1,9 | "Você já olhou a rota de um avião no mapa…" | Mercator real; Nova York e Tóquio com coordenadas; a reta amarela e depois o círculo máximo ciano são traçados; o avião parte |
| 2,8–4,5 | "…por que ele está fazendo essa curva enorme?" | título "POR QUE ESSA / CURVA?", e "CURVA?" se arqueia como a rota |
| 5,5–6,5 | "Parece um desvio, não é?" | hachura entre as linhas, rótulos LINHA RETA / ROTA CURVA, "DESVIO?" |
| 7,3–11,4 | "Mas e se eu te dissesse… o caminho mais curto?" | a rota ciano engrossa e a amarela recua; "O CAMINHO MAIS CURTO?"; o avião chega a Tóquio |
| **Cena 2: O mapa engana** | | |
| 12,2–14,0 | "O segredo está no próprio mapa." | 5 círculos de 1.000 km reais crescem no Mercator (×1,0 a ×3,2 = sec φ); a câmera recua |
| 14,1–18,8 | "A Terra é quase esférica." | o Mercator se desfaz e a folha se curva até fechar a esfera |
| 17,4–23,4 | "E quando tentamos representar… distorcidas." | os círculos ficam iguais na esfera ("NA ESFERA: TODOS IGUAIS"); título "O MAPA DISTORCE DISTÂNCIAS" |
| **Cena 3: A revelação** | | |
| 23,4–28,1 | "Por isso, o menor caminho… chamado de círculo máximo" | a câmera inclina e orbita; aparecem o anel completo do círculo máximo, o plano de corte e o CENTRO DA TERRA com os raios até as cidades; "CÍRCULO MÁXIMO / O MENOR CAMINHO SOBRE A ESFERA" |
| 28,1–30,0 | "…pode parecer uma curva gigantesca no mapa." | a esfera se desenrola e volta ao Mercator; a curva "infla" |
| 31,2–33,1 | "Imagine um voo de Nova York até Tóquio." | segundo voo; os marcadores pulsam no nome de cada cidade |
| 33,7–36,9 | "No mapa, a rota pode parecer um desvio em direção ao Norte." | a linha amarela volta; seta NORTE |
| 38,0–40,9 | "Mas quando observamos a Terra como um globo," | o mapa vira globo de novo, centrado no ponto médio da rota |
| 40,9–42,8 | "tudo começa a fazer sentido." | **a curva vira reta** (régua confirma); a amarela vira U; distâncias: **10.849 km** × **12.787 km** (esfera, R = 6.371 km) |
| **Cena 4: Mesma rota, outra perspectiva** | | |
| 42,8–45,9 | (pausa) | mapa plano em cima e globo embaixo; pontos 1-2-3 nas mesmas coordenadas ligados entre as vistas; "MESMA ROTA. OUTRA PERSPECTIVA." |
| **Cena 5: Voos reais** | | |
| 46,0–51,0 | "Só que existe outro detalhe. Os aviões nem sempre seguem…" | globo aproximado; ROTA SIMULADA tracejada; aviso "SIMULAÇÃO ILUSTRATIVA — NÃO É UM VOO REAL" |
| 52,0–56,0 | "Ventos, tempestades e restrições do espaço aéreo… influenciam as rotas." | cada símbolo surge na palavra: VENTOS (corrente para leste), TEMPESTADE, ESPAÇO AÉREO RESTRITO, CONTROLE DE TRÁFEGO (limites de setor) |
| 57,0–60,9 | "Ou seja, o caminho mais curto nem sempre é o mais rápido." | "MAIS CURTO ≠ SEMPRE MAIS RÁPIDO" |
| **Cena 6: Encerramento** | | |
| 61,0–63,1 | "Incrível, não é?" | o globo volta a ser mapa; curva ciano em destaque; avião rápido |
| 62,8–67,5 | "Além do Visível, o extraordinário está nos detalhes." | a câmera se afasta, o mapa escurece; "ALÉM DO VISÍVEL", sublinhado ciano e "O EXTRAORDINÁRIO ESTÁ NOS DETALHES." |

## Desvios do briefing (e por quê)
- **Cena 4 em cima e embaixo,** não esquerda e direita: no 9:16, metades laterais de 540 px deixariam mapa e globo pequenos demais para celular.
- **Revelação em "tudo começa a fazer sentido":** a palavra "Surpresa" não existe na narração entregue.
- **Controle de tráfego só como elemento visual:** a fala não o cita. O suporte vem da fonte da NASA.
- **Símbolo AV:** não está no repositório. A assinatura usa só a tipografia do canal. Para incluir o símbolo original, basta apontar `LOGO_SRC` em `remotion/src/Later.tsx` para o arquivo em `public/`.
