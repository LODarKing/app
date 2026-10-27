# Estilo aprovado — Série Especialidades dos Desbravadores

**Referência oficial:** episódio completo **FELINOS — Uma Aventura Selvagem!**, na pasta `FELINOS_EPISODIO/`.
- Vídeo final: `FELINOS_EPISODIO_FINAL.mp4`, com 9 min 06 s, 1080×1920 e 30 quadros/s.
- Aprovado e publicado pelo usuário em out/2026.

Cada nova especialidade parte do código dessa pasta e das vozes tratadas como em `FELINOS_AUDIO/`. As regras gerais (contrato de render, padrões proibidos, som e ciclo de notas) estão no `CLAUDE.md` da raiz; este arquivo trata do **visual, do som e do processo**.

> **Comunicação:** sempre em português, explicando os processos de forma clara.
> **Aprovação:** o usuário revisa e aprova um piloto antes do vídeo completo.
> **Ferramentas:** sem Remotion, HyperFrames ou geradores prontos. Tudo é desenhado do zero em código (canvas 2D + WebGL), a partir das referências do usuário.

---

## 1. Referências que formam o estilo

| Referência | O que tirar dela |
|---|---|
| **"Brilhante"** (curta 2D de 2021, canal Happy Kappy) | Paleta lilás, malva e pêssego; cenários pintados com textura suave; luz como parte da história; título escrito à mão. |
| **Felinos vetoriais do exemplo do usuário** (só referência, nunca copiar) | Animais chapados **sem contorno**, 2 ou 3 tons, ventre claro, perna do lado oposto mais escura e anatomia fina e esguia. |
| ***Gato de Botas 2*** | Pinceladas sobre as formas, animação **em dois** (12 desenhos/s), quadros de impacto e efeitos 2D desenhados. |
| ***Aranhaverso*** | Filtro final com pinceladas, retícula, hachura, cor fora de registro e papel, mais as onomatopeias desenhadas. |

## 2. Paleta (uma cor de destaque só)

| Papel | Cor |
|---|---|
| Destaque (único) | `#F2B451` âmbar |
| Tinta escura de interface e texto | `#3B2A45` ameixa |
| Claro de interface | `#F6EEE4` creme |
| Céu de entardecer | `#8F86B8` → `#C9A3BE` → `#EDC3A4` |
| Vegetação | `#7E9C82` / sombra `#5F7A6E` |
| Impacto | `#E0306A` (só no quadro de impacto) |

Animais usam cores naturais por espécie. Por exemplo, as listras do tigre são laranja-escuras e não pretas. Os uniformes seguem as referências oficiais.

## 3. Tipografia

- **Título:** **Caveat Bold**, escrito da esquerda para a direita, levemente inclinado. Também nas referências bíblicas ("Juízes 14:5–6").
- **Interface:** **Inter**, nos pesos Black, ExtraBold, Bold e Bold Italic. O itálico fica reservado ao **nome científico**.
- Só essas duas famílias. Sempre definir `textAlign` antes de cada texto, porque o canvas herda o alinhamento do quadro anterior.

## 4. Personagens (todos desenhados do zero, em código)

- **Pessoas da série (Lara e Miguel)** — `js/people.js`, função `drawPerson`:
  - construídas a partir das folhas de referência do usuário (`assets/ref_lara.png`, `ref_miguel.png`);
  - olhos abertos com piscadas e olhar que se mexe; boca sincronizada pelo envelope da voz; balanço da cintura, respiração e atraso da cabeça;
  - luz da cena via `lightRig`: luz principal, sombra e luz de recorte;
  - uniforme oficial, com o emblema e a insígnia reais (imagens do usuário, nunca redesenhadas). Sem inventar insígnias.
- **Gato guia (Pingo)** — `js/pingo.js`: de frente com orelhas, pálpebras, pupilas, cauda e miado; de perfil pelo motor dos felinos.
- **Felinos e raças** — `js/bigcats.js`, um motor guiado por dados (`SPEC`):
  - marcas próprias por espécie, nunca o mesmo corpo com outra cor;
  - pernas com IK, andar e galope, pose deitada (`lie`) e cauda com balanço.
  - **Fase da passada sempre pela distância percorrida**: `walk: distância / catStep(espécie, escala)`. Para andar de um lado para o outro, usar `paceDist`. Assim a pata apoiada não patina.
- **Personagens históricos ou bíblicos** — `js/figuras.js`, função `bibFigure`:
  - corpo de ~7,5 cabeças, pernas com joelho (IK), ciclos de andar e correr sem patinar (`figStep`);
  - túnica com pregas que balançam, manto com atraso, cabelo e barba, objetos na mão (cajado, lança, cordeiro);
  - rosto de perfil, sereno e simples, sem feições inventadas;
  - o anjo é uma figura de luz suave, sem asas nem efeitos fantasiosos.
- Personagens são pintados (`painterize`, só na área do personagem) e recebem a luz da cena (`lightRig`). Nada tem contorno.

## 5. Cenários e câmera

- Pintados em camadas com **paralaxe**, em cache pré-pintado (`cachedPainted`): textura de pincel e lavagens de cor, presa à máscara do desenho.
- **Atmosfera sempre viva** (`js/atmos.js`): sombras de folhas, raios de sol, partículas na luz, nuvens em deriva, árvores balançando, folhagem em primeiro plano e vinheta.
- **Câmera:** acompanha quem anda, aproxima nos momentos fortes e treme no impacto (com semente). Um close no meio de plano longo resolve trechos parados. Use a função `camera(ctx, zoom, fx, fy, desenho)` de `js/cenas/historias.js`.
- **Transições motivadas:** mergulho na página do livro, íris, virada de página ilustrada (`pageTurn`), chicote de câmera.

## 6. Movimento e montagem

- **Contrato:** `window.seek(t)` é função pura do tempo. Sem CSS transitions, `setTimeout` ou `requestAnimationFrame`, e ruído só com semente (`rnd(seed, i)` / mulberry32).
- Personagens **em dois** (`on2s(t)`, 12 desenhos/s); câmera e vídeo a **30 quadros/s**.
- **Algo novo a cada 2–4 s.** Planos parados por mais de 4 s ganham close, rótulo ou ação.
- **Proibido:** título centralizado sobre gradiente, tudo entrando com fade, etiquetas nos cantos, glow em interface, explosão genérica de partículas.

## 7. Legendas, rótulos e fotos reais

- **Legendas palavra por palavra** (`captions` em `js/episode.js`):
  - Inter Black 66 px, largura máxima de 840 px;
  - palavra falada em âmbar e maior; palavras-chave em caixa de gibi;
  - grafia corrigida em `audio/montar_timeline.py`: `FIX` vale para todas as falas, `FIX_AT` só para uma fala específica, para não trocar palavra certa em outro lugar.
  - Cada cena define `capY`: a altura muda para não cobrir rostos, e `null` desliga a legenda (tela de identidade).
- **Onomatopeias** em Caveat, desenhadas antes do filtro. Cada uma ganha automaticamente o seu som (`audio/onomatopeias.mjs` → `synth.py`).
- **Fotos reais em PIP** (`js/fotos.js`, função `photoPip`), quando a narração cita um animal:
  - cartão de foto com borda creme, selo **FOTO REAL** e Ken Burns lento;
  - ao lado: nome popular, **nome científico em itálico âmbar** e uma linha de apoio;
  - posição: canto superior esquerdo, fora das áreas de botões do Reels;
  - **crédito sempre visível** na borda da foto.
- **Origem das fotos:**
  - Wikimedia Commons com licença livre, baixadas por `fotos/baixar.py` com autor e licença. O site limita as requisições; o script espera e tenta de novo.
  - Ou fotos enviadas pelo usuário, com crédito "Foto enviada pela produção".
  - **Nunca** usar imagem com marca d'água de banco de imagens (Shutterstock e similares), nem cortar a marca.
  - Fotos ficam fora do git (`assets/fotos/`); só os créditos entram (`documentacao/fotos_creditos.json`).
- Interface, fotos e emblemas oficiais são desenhados **depois** do filtro, para ficarem nítidos.

## 8. Filtro final — `js/post.js` (o aprovado)

É o shader WebGL em 3 passadas do piloto aprovado: papel calculado uma vez, Kuwahara em meia resolução e composição. Ele inclui:
- pinceladas Kuwahara de 4 quadrantes (amostras a cada 3 px, campo de fluxo de 6 px);
- cor fora de registro: vermelho e azul deslocados 4 px;
- retícula a 30° nos meios-tons e hachura nas sombras;
- papel e aquarela, saturação +18% e gradação quente.

> Existe uma variante "anisotrópica" (pinceladas que seguem as bordas, grão e gradação ameixa/quente), testada no episódio de Felinos. O usuário preferiu **manter o filtro aprovado**. Só trocar se ele pedir.

## 9. Marca, créditos e conteúdo

- **Emblema dos Desbravadores e insígnia oficial da especialidade:** sempre os arquivos do usuário, carimbados no corpo do quadro, nunca em etiqueta de canto. Encerramento com "ESPECIALIDADE DE …", "DISTRITO DE DESBRAVADORES DE AMONTADA" e o lema manuscrito.
- **Créditos ao fim:** narração e vozes dos personagens com os nomes informados pelo usuário e o clube a que pertencem. No episódio de Felinos:
  - Narração: Italo Marinho;
  - Lara: voz de Isabella Meneses;
  - Miguel: voz de Abner Araújo;
  - os dois do Clube de Desbravadores Edwardo Schimidt.
- **Histórias bíblicas:**
  - cenas reverentes, com a referência bíblica manuscrita;
  - confrontos heroicos **sem violência gráfica** (contraluz, poeira, silhuetas na parede);
  - leões que se acalmam e deitam;
  - fidelidade ao texto (Jz 14:5–6; 1Sm 17:34–37; 2Sm 23:20; Dn 6:16–23).
- **Precisão científica:** conferir cada dado com a narração (ex.: o velocímetro precisa mostrar "perto de 100 km/h"; leão é leão, não leoa).

## 10. Som

- **Vozes:** só as gravações do usuário, restauradas em "som de estúdio" pelo processo de `FELINOS_AUDIO/` (detalhes no `README.md` de lá):
  - picos reconstruídos e ruído removido com DeepFilterNet 3;
  - equalização, de-esser e compressão;
  - respirações removidas e pausas encurtadas pela pontuação;
  - −18 LUFS por fala;
  - nova transcrição para conferir palavra por palavra.
- **Trilha sintetizada em código** (`audio/instruments.py`, `audio/synth.py`), a 120 bpm, sempre na grade global:
  - **tema principal** de 8 compassos em Ré maior, que volta nos momentos-chave: título, chegada dos felinos, mapa, encerramento e créditos;
  - estudo: pizzicato, harpa e celesta; aventura: taiko e cordas; desfile: groove; quiz: marimba;
  - histórias bíblicas: cordas cheias (`ensemble`), coro natural (`choir2`), tímpano, trompa e um coral sacro em Ré menor que resolve em maior;
  - instrumentos longos em cache, para a trilha de 9 min sintetizar em ~4 min.
- **Efeitos:** um para cada onomatopeia desenhada, mais os acentos de eventos (cortes, chegadas, revelações). Encaixados na **semicolcheia da batida medida** (`audio/beats.json`, `audio/acertos.json`), com desvio máximo de ~60 ms.
- **Mixagem:**
  - trilha recua 9,5 dB sob as falas, e a voz fica ~17 dB acima do fundo;
  - −14 LUFS, teto de −2,6 dBFS no WAV.
- Conferir também o volume de cada cena: nada de silêncio sem motivo e créditos com trilha presente.

## 11. Ciclo de qualidade (obrigatório antes de mostrar)

1. `node render.mjs --sheet sNN`: um quadro por batida em folha de contato. **Olhar a folha.**
2. Dar nota de 1 a 10 em seis critérios:
   - gancho;
   - leitura no celular;
   - movimento;
   - variedade;
   - fidelidade à marca;
   - sincronia do som.

   Corrigir os 3 piores e repetir até tudo ficar **≥ 8**. Registrar as notas em `documentacao/notas_folhas.md`.
3. **Movimento:** tiras de 6 quadros seguidos (`--stills out.png sNN:t sNN:t+0.033 …`) para conferir passadas sem patinar e câmera contínua.
4. **Texto:** comparar as legendas com o roteiro palavra por palavra.
5. **Vídeo pronto:**
   - nenhum quadro preto nem congelado (`blackdetect`, `freezedetect`);
   - −14 LUFS;
   - durações de imagem e som iguais;
   - varredura de 1 quadro/s.

## 12. Render

- Saída: H.264 yuv420p, CRF 16, 30 quadros/s, AAC 256k. Versão para publicar: CRF 22 com `+faststart`.
- `node render.mjs --seg s01 sNN`: 4 páginas em paralelo por cena, em `segmentos/`. Rende ~2 quadros/s neste ambiente sem placa de vídeo, ou seja, **~1 h 30 para um episódio de 9 min**.
- Tarefas em segundo plano têm limite de 2 h: dividir o episódio em 2 ou 3 partes.
- `node render.mjs --part sNN a b [fps]` refaz **só um trecho** da cena e emenda no segmento existente. Serve para ajustes rápidos.
- `node render.mjs --final` junta os segmentos com `audio/mix.wav`.
- **Prazo de publicação:** perguntar o horário com antecedência. Reaproveitar segmentos que não mudaram. Se o tempo não der, oferecer opções ao usuário (ex.: trechos a 15 quadros/s) e, depois, uma versão final uniforme a 30 quadros/s.
- Vídeos, mixagem e fotos ficam **fora do git** (limite de 100 MB do GitHub). O código regenera tudo.

## 13. Como começar uma nova especialidade

```sh
rsync -a --exclude segmentos --exclude out --exclude node_modules --exclude '*.mp4' \
      --exclude assets/fotos --exclude audio/vozes --exclude audio/mix.wav \
      FELINOS_EPISODIO/ <NOME>_EPISODIO/
cd <NOME>_EPISODIO && npm install            # playwright (o Chromium já existe no ambiente)
```

1. **Material do usuário:**
   - roteiro;
   - emblema dos Desbravadores e insígnia oficial da especialidade;
   - folhas de referência dos personagens;
   - gravações das vozes;
   - nomes para os créditos.
2. **Vozes:** copiar `FELINOS_AUDIO/` para `<NOME>_AUDIO/`. Rodar `transcrever.py`, `diagnostico.py`, `restaurar.py` e `verificar.py`.
3. **Linha do tempo:** reescrever `SCENES` em `audio/montar_timeline.py` (eventos por cena, falas e cortes, correções de grafia) e gerar `timeline.js`.
4. **Cenas:** uma por arquivo em `js/cenas/`, com `CENAS[id] = { draw, ui, sfx, capY }`. Reaproveitar:
   - pessoas, felinos, figuras, cenários e atmosfera;
   - mapa, livro e mesa;
   - fotos em PIP, legendas e onomatopeias;
   - virada de página.

   Novos animais ou objetos: desenhar do zero com o mesmo acabamento (sem contorno, pintado, com luz da cena).
5. **Fotos reais** dos animais citados: `fotos/baixar.py` com a lista nova, ou fotos enviadas pelo usuário.
6. **Piloto** (abertura, 10 a 20 s), ciclo de notas, envio ao usuário e **esperar a aprovação**.
7. **Episódio completo:**
   - `node audio/onomatopeias.mjs` e `python3 audio/synth.py`;
   - folhas de contato e notas;
   - render em partes e `--final`;
   - verificação e envio.

   Commit e push frequentes.

## 14. Lições do episódio de Felinos

- O usuário reprovou o visual de "recorte" com contorno grosso e o 3D fofo com pelos. Aprovou o **2D pintado com acabamento de impressão**.
- O usuário pediu personagens **criados do zero, a partir das referências**, sem skills prontas. Também pediu olhos que se mexem, luz e sombra e cenário com movimento.
- **Histórias bíblicas:** silhuetas chapadas foram consideradas fracas. O aprovado são personagens pintados, cenários em camadas, câmera e luz contando a história.
- **Fotos reais com nome científico** deixam o episódio mais educativo. O usuário escolheu fotos melhores quando as do Wikimedia não agradavam (ex.: close do tigre).
- **Folhas de contato pegaram:**
  - planos parados;
  - legendas sobre o rosto;
  - leoa no lugar de leão;
  - velocímetro contra a narração;
  - pés patinando;
  - correção de grafia aplicada no lugar errado ("dentes" × "desses").
- Comandos `pkill -f` com um padrão que aparece no próprio comando matam o shell que o roda. Usar `pkill -f "render[A]..."` (classe de caractere) para não casar consigo mesmo.
