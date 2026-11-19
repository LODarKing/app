# Lettering autoral — "Enquanto Isso em Amontada…"

**Conceito: o batom que vira notícia.** As letras não vêm de nenhuma fonte. Foram desenhadas como esqueletos (linha central)
e "escritas" por uma ferramenta virtual que imita a bala chanfrada do batom. Assim:
- a espessura de cada traço depende da direção, como numa pena larga com o bisel a −35°: descidas cheias, horizontais em fio;
- **toda terminação sai cortada no mesmo ângulo do bisel do batom**, a marca registrada do desenho;
- há uma pressão orgânica sutil (entrada mais leve e variação mínima com semente), e uma textura de pigmento aparece só em "Amontada…".

O mesmo bisel desenha o contorno do mapa, as fitas que se desprendem da boca e do mapa e a pincelada gigante da saída.
É uma só ferramenta do começo ao fim.

## As três propostas (`propostas/`)
| | 1 — Bala de Batom (escolhida) | 2 — Linha Contínua | 3 — Arco do Cupido |
|---|---|---|---|
| construção | pena larga do bisel; E com braço superior subindo e base alongada; A com travessão que nasce à esquerda como um risco; último "a" com cauda até as reticências | círculos e retas em espessura única (geometria pura) | o arco do lábio vira letra: m, n e A com picos, E em épsilon, traço em gota (fino → cheio → fio) |
| disposição | degraus assimétricos: "Enquanto" / "Isso" deslocado + "em" inclinado / "Amontada…" larga | centralizada e simétrica, com régua sob "Amontada" | cascata diagonal inclinada a 9° |
| integração do batom | o traço do mapa desce e vira o E; o batom escreve "Amontada"; as reticências são toques de batom | o contorno do mapa desce em prumo e vira a régua | as reticências viram três beijos |

**Por que a 1:**
- *Originalidade:* o bisel cortado é um detalhe que nenhuma fonte tem e que liga as letras ao objeto da história.
- *Legibilidade:* é a mais clara das três na tela do celular.
- *Coerência:* é literalmente o batom escrevendo.

A 2 é limpa, mas lembra uma sans geométrica comum. A 3 tem boas ideias (os beijos nas reticências), mas o traço em gota puxa para caneta-pincel de caligrafia.

## Arquivos editáveis (`svg/`)
| arquivo | uso |
|---|---|
| `lettering-cor.svg` | lettering nas cores da identidade (grupos `enquanto`, `isso`, `em`, `amontada`) |
| `lettering-monocromatico.svg` | tudo em cereja — carimbo, bordado, gravação |
| `lettering-negativo.svg` | creme sobre cereja — camiseta, adesivo |
| `assinatura-logotipo.svg` | mapa + beijo + lettering, recortado (logotipo do quadro) |
| `assinatura-completa-1080x1920.svg` | o quadro final da vinheta em vetor |
| `proposta-{1,2,3}-lettering.svg` | as três propostas |

Todos são contornos vetoriais limpos (caminhos preenchidos), sem fontes, abertos em qualquer editor (Illustrator, Figma, Inkscape).

## Medidas da composição (1080 × 1920)
- "Enquanto": altura-x 70 px, vinho `#7B0D1E` · "Isso": 70 px, deslocado para a direita · "em": 38 px, inclinado 10°, cereja-rosa `#EF476F`.
- "Amontada…": altura-x 88 px, cereja `#D90429` com textura de pigmento; ocupa x 62–960 (dentro da área segura do Reels).
- Paleta: cereja `#D90429`, rosa vibrante `#FF4D6D`, rosa-pálido `#FFC9D3`/`#FFF1F2`, vinho `#7B0D1E`, creme `#FFF6EE`.

## Como editar ou gerar de novo
- Desenho das letras: `src/lettering/glyphs.js`. Prefixos: `~` = começa dentro de outro traço; `!` = termina dentro; `=` = laço fechado.
- Ferramentas de traço (bisel, gota, linha): `src/lettering/engine.js`.
- Disposição das três propostas: `src/lettering/lockups.js`.
- `node tools/exportar_svg.mjs` gera os SVGs; `node render.mjs --propostas` gera os PNGs das propostas e o comparativo.
