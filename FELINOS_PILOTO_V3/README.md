# Felinos — Piloto v3

Abertura de **Felinos: uma aventura selvagem!** (Especialidade EN-024): cena 1 do roteiro, 12 s, 1080×1920, 60 fps.
Segue as regras do `CLAUDE.md` da raiz (contrato de render, padrões visuais proibidos, som na grade medida, ciclo de notas).

## Referências usadas

- **Visual geral:** "Brilhante" (curta de 2021). Traço e cor chapada com uma sombra, paleta lilás, malva e pêssego, cenários pintados, luz como elemento da história e título escrito à mão.
- **Felinos:** exemplo enviado pelo usuário, usado só como referência de estilo. Vetor chapado sem contorno, 2 ou 3 tons, cabeça pequena, pernas longas e esguias, rosetas em anel e listras laranja-escuras.
- **Acabamento:** *Gato de Botas 2: O Último Pedido*. Pinceladas por cima das formas, animação em dois (12 desenhos/s), quadro de impacto em alto contraste e efeitos 2D desenhados.
- **Filtro final:** *Homem-Aranha: Através do Aranhaverso*. `js/post.js` é um sombreador WebGL determinístico.
  - Pinceladas (filtro Kuwahara ao longo de um campo de fluxo).
  - Retícula girada 30° e hachura nas sombras.
  - Cor fora de registro, papel, manchas de aquarela e gradação quente.
  - Textos de interface (legendas, rótulos, página do título) e emblemas oficiais são desenhados depois do filtro, para ficarem nítidos.
- **Gancho e ritmo:** onomatopeias desenhadas à mão na batida (TUM, TUM!, miau..., BOING!, FIUUU!, ROOAAR!). Legendas palavra por palavra com palavras-chave em caixas de gibi com retícula.
- **Marca:** emblema oficial dos Desbravadores e insígnia oficial da especialidade (arquivos do usuário em `assets/`).

## Estrutura

- `index.html`: `window.seek(t)` desenha o quadro do instante `t`, como função pura do tempo.
- `timeline.js`: todos os eventos, na grade de 120 bpm; é lido pela página e pelo som.
- `js/core.js`: base do motor.
  - Ruído só com semente (mulberry32), curvas e IK.
  - Formas com uma sombra de célula e pinceladas.
  - Tremor de traço a cada desenho.
- `js/pingo.js`: o Pingo de frente, sentado e no salto.
- `js/bigcats.js`: onça-pintada, tigre e leão em perfil, com caminhada por IK.
- `js/sets.js`: cenários.
  - Área de estudos.
  - Floresta tropical.
  - Bambuzal.
  - Savana.
  - Páginas do Diário da Criação.
- `js/film.js`: os planos, as câmeras, os efeitos, as legendas e o título.
- `audio/synth.py`: o som do piloto.
  1. Sintetiza a trilha.
  2. Mede as batidas com o librosa e grava `audio/beats.json` (ajuste linear: 120,09 bpm, resíduo de 10 ms).
  3. Encaixa os efeitos na grade medida (`audio/acertos.json`).
  4. Mixa em −14 LUFS.
- `render.mjs`: `node render.mjs` faz o render completo (H.264 yuv420p, CRF 16). `--sheet` gera a folha com um quadro por batida; `--stills` e `--lab` geram conferências.

## Comandos

```sh
npm install                    # playwright 1.63.0 (o Chromium já vem no ambiente)
python3 audio/synth.py         # som + beats.json   (--com-voz: ducking de -7,5 dB quando houver narração)
node render.mjs --sheet        # folha de contato por batida (ciclo de notas)
node render.mjs                # render completo -> FELINOS_PILOTO_v3.mp4
```

## Ciclo de notas (antes do render completo)

| Rodada | Gancho | Leitura | Movimento | Variedade | Marca | Som | Correções |
|---|---|---|---|---|---|---|---|
| 1 | 7 | 6 | 7 | 8 | 6 | 8 | emblema e nome da série na página; rótulos maiores; silhueta em contraluz desde o 1º quadro; salto sem quadro morto |
| 2 | 8 | 7 | 8 | 8 | 8 | 8 | textos da página maiores; legenda não invade o título |
| 3 | 8 | 8 | 8 | 8 | 8 | 8 | subtítulo dentro da tela; emblema sem fundo branco |
| 4 | 8 | 8 | 8 | 8 | 8 | 8 | bug: canvas não era limpo entre quadros (faixa com restos do quadro anterior no tigre) — corrigido |
| 5 | 9 | 6 | 8 | 9 | 8 | 8 | filtro Aranhaverso + onomatopeias + legendas novas; o filtro borrava textos pequenos |
| 6 | 9 | 8 | 8 | 9 | 8 | 8 | textos de interface depois do filtro; ROOAAR! sem colidir com o rótulo → render completo |

## Pendências

- **Narração:** a narração gravada pelo usuário entra depois da aprovação. Os tempos das legendas são provisórios.
- **Lara e Miguel:** têm referência (`assets/ref_*.png`), mas não aparecem na cena 1.
