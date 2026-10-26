# Estilo aprovado — Série Especialidades dos Desbravadores

Este é o guia de estilo das próximas especialidades. O estilo foi **aprovado pelo usuário no piloto de Felinos (v3)**, na pasta `FELINOS_PILOTO_V3/` (vídeo `FELINOS_PILOTO_v3.mp4`).
Cada novo episódio parte do código dessa pasta. As regras gerais de trabalho estão no `CLAUDE.md` da raiz; este arquivo trata do **visual, do som e do processo**.

> Comunicação com o usuário: sempre em português, explicando os processos.
> O usuário revisa e aprova um piloto antes do vídeo completo.

---

## 1. Referências que formam o estilo

| Referência | O que tirar dela |
|---|---|
| **"Brilhante"** (curta de animação 2D de 2021, canal Happy Kappy) | Paleta lilás, malva e pêssego. Cenários pintados com textura suave. Luz como parte da história (olhos que acendem no escuro). Título **escrito à mão**, com sublinhado e estrelinha desenhada. Planos frontais e simétricos. |
| **Exemplo de felinos do usuário** (ilustração de banco de imagens; usar só como referência, nunca copiar) | Animais em **vetor chapado sem contorno**, com 2 ou 3 tons: pernas do lado oposto mais escuras, ventre claro, sombra plana na anca e atrás do ombro. Cabeça pequena, peito fundo, cintura fina, pernas longas e esguias, cauda longa. Rosto mínimo: olho como traço curto, nariz pequeno, sem bigodes nos animais selvagens. |
| ***Gato de Botas 2: O Último Pedido*** | **Pinceladas** sobre as formas, que "fervem" a cada desenho. **Animação em dois** (12 desenhos/s) com câmera a 60 fps. **Quadro de impacto** em alto contraste (2 desenhos) nos momentos fortes. Efeitos 2D desenhados: linhas de velocidade, arcos de som. |
| ***Homem-Aranha: Através do Aranhaverso*** | Filtro final sobre o quadro inteiro: pinceladas (Kuwahara), **retícula** nos meios-tons, **hachura** nas sombras, **cor fora de registro**, papel e manchas de aquarela, gradação quente. **Onomatopeias** desenhadas à mão. |

## 2. Paleta (uma cor de destaque só)

| Papel | Cor |
|---|---|
| Destaque (único) | `#F2B451` âmbar |
| Tinta escura de interface e texto | `#3B2A45` ameixa |
| Claro de interface | `#F6EEE4` creme |
| Traço de cenário | `#4A3A52` |
| Escuro de cena (noite, abertura) | `#120C17` |
| Céu de entardecer | `#8F86B8` → `#C9A3BE` → `#EDC3A4` |
| Vegetação | `#7E9C82` / sombra `#5F7A6E` |
| Pôr do sol (savana) | `#5E4A86` → `#B678A2` → `#EE9F8E` → `#F6C9A0` |
| Impacto | `#E0306A` (magenta, só no quadro de impacto) |

Personagens animais (exemplos aprovados):
- **Pingo:** pelo `#E8975A`, sombra `#BC6A50`, listras `#C2703F`, branco `#F5ECE4`, íris `#8CC152`.
- **Onça:** base `#E7B44E`, rosetas `#9A6A2C`/`#7A4E22`.
- **Tigre:** base `#E8743A`, listras `#A8401E`, que são **laranja-escuras e não pretas**.
- **Leão:** base `#E0912E`, juba `#6E3E1E` e `#8A5226`.

## 3. Tipografia

- **Título:** **Caveat Bold** (manuscrita, OFL), "escrito" da esquerda para a direita com a ponta da pena, sublinhado em âmbar e estrelinha desenhada. Nunca centralizado sobre gradiente: no piloto, foi escrito na página do Diário da Criação, alinhado à esquerda e levemente inclinado.
- **Interface:** **Inter** (Black/ExtraBold/Bold), usada em legendas, rótulos, nome da série e subtítulo datilografado.
- Uma fonte de título e uma de interface; não misturar outras.

## 4. Personagens

- **Animais:** vetor chapado **sem contorno**, 2 ou 3 tons e pinceladas por cima (`brushStrokes`). Só as linhas de expressão (olhos, boca, bigodes do gato doméstico) têm traço.
- **Anatomia fiel por espécie:** proporções próprias, pupila redonda nos grandes felinos e em fenda no gato doméstico. Nunca reaproveitar o mesmo corpo trocando só a cor.
- **Rig:** pernas com IK, caminhada em sequência lateral, escápula que rola, cauda com balanço e mandíbula para rugidos (`js/bigcats.js`). Personagem de frente com cabeça, orelhas, pálpebras, pupilas, boca e cauda animáveis (`js/pingo.js`).
- **Pessoas (Lara, Miguel e outros):** desenhar **a partir das folhas de referência do usuário** (no piloto de Felinos: `FELINOS_PILOTO_V3/assets/ref_lara.png` e `ref_miguel.png`). O uniforme segue as referências oficiais, sem inventar insígnias, cores de lenço ou emblemas. Não inventar rostos sem referência.

## 5. Cenários

- Pintados em camadas com paralaxe (`camSet(ctx, cam, profundidade)`), traço de cenário mais suave que o dos personagens e textura de papel.
- Camadas estáticas pré-renderizadas em cache, que é memorização e não estado entre quadros.
- **Todo quadro começa com a tela limpa.** No piloto, a falta disso deixou restos do quadro anterior numa faixa da tela.

## 6. Movimento e montagem

- **Contrato:** `window.seek(t)` desenha o quadro do instante `t`, como função pura. Sem CSS transitions, `setTimeout` ou `requestAnimationFrame`, e sem `Math.random`: ruído só com semente (`mulberry32`, função `rnd(seed, i)`).
- Personagens **em dois** (`on2s(t)`) e câmera a 60 fps. Desfoque de movimento real (média de 4 subquadros) só em chicotes de câmera e mergulhos.
- Transições motivadas pela ação: olho → pupila, silhueta passando pela lente, chicote de câmera, corte seco na batida, mergulho através de uma pegada que vira janela para a cena seguinte.
- **Algo novo a cada 2–4 s.** No piloto houve troca de plano ou evento a cada ~1 s.
- **Proibido:** título centralizado sobre gradiente, tudo entrando com fade, etiquetas em cantos ou molduras, glow em interface, explosão genérica de partículas (confete, corações em leque).

## 7. Gancho e legendas

- **Primeiro quadro já com informação:** no piloto, a silhueta do Pingo em contraluz lilás com os olhos em fenda brilhando e "TUM" desenhado. Aos 0,5 s os olhos se abrem de uma vez com "TUM!".
- **Onomatopeias** (Caveat, creme com contorno ameixa e cópia âmbar deslocada, como impressão fora de registro) entram na batida com mola e tremem a cada desenho. No piloto: TUM, TUM!, miau..., BOING!, FIUUU!, ROOAAR!.
- **Legendas palavra por palavra** (Inter Black, 70 px, em 1490 px de altura):
  - cada palavra salta com mola e leve rotação;
  - a palavra falada fica 14% maior e em âmbar;
  - palavras-chave ficam em **caixas de gibi** âmbar com retícula e borda ameixa;
  - a frase dá um pulinho a cada palavra nova.
  - Sombra impressa sem desfoque, nunca glow. Nada de legenda sobre a página do título.
- **Rótulos de espécie:** nome em Inter Black e nome científico em itálico âmbar, digitados rapidamente, com linha-guia até o animal. Nunca no canto.
- **Todo texto de interface e os emblemas oficiais são desenhados depois do filtro**, para ficarem nítidos. Onomatopeias, título manuscrito e pegadas vão antes do filtro, para ganharem o acabamento pintado.

## 8. Filtro final (estilo Aranhaverso) — `js/post.js`

Sombreador WebGL determinístico aplicado depois da cena e antes da interface:
- Kuwahara de 4 quadrantes (amostras a cada 3 px), deslocado por um campo de fluxo (6 px).
- Cor fora de registro: vermelho e azul deslocados 4 px, mistura de 0,45.
- Retícula girada 30°, célula de 8 px, escurecendo até 30% nos meios-tons (L < 0,72).
- Hachura diagonal nas sombras profundas (L < 0,32).
- Papel (fbm), granulação e manchas de aquarela em escala grande.
- Saturação +18% e gradação quente.

## 9. Marca

- **Emblema oficial dos Desbravadores** (com o fundo branco removido por preenchimento a partir das bordas, sem tocar no branco interno) e **insígnia oficial da especialidade**: sempre os arquivos do usuário, nunca redesenhados. Ficam carimbados no corpo do quadro, junto com "SÉRIE ESPECIALIDADES DOS DESBRAVADORES" e "Especialidade XX-000", nunca em etiqueta de canto.

## 10. Som

- **Trilha e efeitos sintetizados em código** (`audio/instruments.py`, `audio/synth.py`), a não ser que o usuário forneça música.
- Ritmo de 120 bpm. A trilha acompanha os planos:
  - suspense: cordas graves e coração;
  - momento fofo: pizzicato e celesta;
  - salto: subida;
  - ação: percussão taiko e cordas;
  - impacto: tutti com coro e tímpano.
- **Batidas medidas** na trilha com librosa, com resolução de 6 ms e **ajuste linear** (a mediana falha porque os intervalos oscilam com a janela de análise). O resultado vai para `audio/beats.json`. Todos os efeitos são encaixados na batida ou meia batida medida mais próxima (`audio/acertos.json`).
- **Mixagem:** −14 LUFS, limitador próprio com lookahead (o Limiter do pedalboard aplica ganho de compensação) e teto de −2,6 dBFS no WAV, para o AAC ficar abaixo de −1,3 dBTP.
- **Narração:** só a voz gravada pelo usuário. As vozes sintéticas testadas (Kokoro e Piper) foram reprovadas. Com a voz real, a trilha recua 7,5 dB nas falas (`python3 audio/synth.py --com-voz`), e as legendas usam os tempos da transcrição.

## 11. Ciclo de qualidade (obrigatório antes de mostrar)

1. `node render.mjs --sheet`: um quadro por batida medida numa folha de contato. **Olhar a folha.**
2. Dar nota de 1 a 10 em: gancho nos 2 primeiros segundos, leitura em tela de celular, qualidade do movimento, variedade, fidelidade à marca e sincronia do som.
3. Corrigir os 3 piores problemas e repetir até todas as notas serem **8 ou mais**. No piloto foram 6 rodadas.
4. Só então rodar `node render.mjs` (H.264 yuv420p, CRF 16, 60 fps) e conferir:
   - quadros pretos e congelamentos (`blackdetect`, `freezedetect`);
   - −14 LUFS e o pico;
   - uma folha a 4 quadros/s.

## 12. Como começar uma nova especialidade

```sh
cp -r FELINOS_PILOTO_V3 <NOME>_PILOTO                    # sem frames/, out/, node_modules/
cd <NOME>_PILOTO && npm install                           # playwright 1.63.0 (Chromium já existe no ambiente)
pip install librosa pedalboard pyloudnorm soundfile scipy # se o ambiente não tiver
```

1. Colocar em `assets/` o roteiro, o emblema dos Desbravadores, a insígnia oficial da nova especialidade e as folhas de referência dos personagens.
2. Reescrever `timeline.js` (eventos na grade de 120 bpm, palavras da narração) e os planos em `js/film.js`, reaproveitando `core.js`, `post.js`, o rig dos personagens e as funções de interface (legendas, onomatopeias, rótulos, página do título).
3. Fazer o piloto (cena de abertura, 10 a 12 s), rodar o ciclo de notas, enviar e **esperar a aprovação**.
4. Depois da aprovação: narração do usuário → transcrição com tempos por palavra → legendas, `--com-voz` → vídeo completo com o mesmo ciclo.

## 13. Lições do piloto de Felinos

- O usuário reprovou o visual de "recorte" com contorno grosso (v1) e o 3D fofo com pelos (v2). Aprovou a mistura de 2D pintado com acabamento de impressão (v3).
- Filtro de pincel borra texto pequeno: interface sempre depois do filtro.
- Texto no limite da tela: medir antes. "UMA AVENTURA SELVAGEM!" a 66 px passou da borda; a 58 px coube.
- Onomatopeia e rótulo podem colidir: conferir os quadros das batidas fortes.
- Canvas reutilizado guarda o quadro anterior: limpar sempre.
