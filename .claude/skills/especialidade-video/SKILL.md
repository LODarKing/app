---
name: especialidade-video
description: Produz um episódio animado (Reels 9:16, 180 s) da Série Especialidades dos Desbravadores no estilo aprovado pelo usuário (v3 "Educação Inclusiva", Remotion + personagens vetorizados das folhas de referência). Use para qualquer nova especialidade, piloto ou ajuste de episódio.
---

# Série Especialidades dos Desbravadores — estilo aprovado (v3)

Referência completa e aprovada: `EDUCACAO_INCLUSIVA_WORK/` (episódio "Educação Inclusiva — Ninguém fica de fora!").

Para uma nova especialidade, **copie essa estrutura** para `<NOME>_WORK/` e reaproveite o código. Não recomece do zero e não volte ao Three.js puro nem a personagens desenhados "de cabeça": o usuário rejeitou esses dois caminhos.

## Regras do usuário (obrigatórias)

- **Idioma:** comunicação, relatórios e documentação em **português**, explicando os processos de forma clara.
- **Piloto antes do vídeo completo:** primeiro um piloto dos ~10 s iniciais, terminado numa pausa da fala, nunca no meio de uma palavra. O vídeo completo só é feito depois da aprovação.
- **Personagens:** vêm **das folhas de referência enviadas pelo usuário**, vetorizadas com `tools/vectorize.py`.
  - Precisam parecer desenhados à mão e vetorizados, sem nada genérico.
  - Uniforme exatamente como nas folhas: camisa cáqui, lenço amarelo com prendedor, insígnias nos lados corretos, calça ou saia verde.
  - Sem recortes visíveis: as áreas escondidas atrás de membros são preenchidas (`inpaint_under`), as pernas continuam por baixo do quadril (`shared`) e braços e mangas são peças inteiras desenhadas (`ArmSpec` em `chars/rigs.tsx`).
- **Primeiros segundos muito chamativos:**
  - palavra gigante letra a letra sobre raios girando;
  - emblema da especialidade entrando girando com o título da série;
  - flash;
  - câmera seguindo o personagem com linhas de velocidade;
  - revelação com confete.
- **Legendas dinâmicas palavra por palavra** (`full/Captions.tsx`):
  - palavra falada em amarelo;
  - palavras-chave em selos coloridos, com tremor para palavras negativas e brilhos para positivas.
- **Animação fluida e elaborada em todo o vídeo:** nunca deixe a tela quase vazia por mais de ~1 s. Cada frase da narração tem um elemento visual próprio (cartões, selos, carimbos, ícones, mapas, gráficos).
- **Respeito na representação:**
  - ninguém empurra cadeira de rodas sem consentimento; o personagem se movimenta com autonomia;
  - sem vendas nos olhos;
  - não inventar sinais de Libras;
  - a cura não é condição de dignidade;
  - insultos só como rabiscos e símbolos;
  - não inventar emblemas nem logos (usar o emblema oficial que o usuário enviar);
  - não inventar rostos de personagens sem referência.
- **Voz:** só a narração do usuário (restaurada); nada de voz sintética; não inventar falas.
- **Commits e push:** frequentes no branch designado; nada de identificador de modelo nos commits.

## Ferramentas

- **Remotion 4** (React + SVG) para toda a animação, em `<WORK>/remotion/`.
  - `remotion.config.ts` aponta para o Chromium em `/opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell`.
  - **Concorrência máxima 4.**
- **Vetorização:** Python com `opencv-python-headless` e `potracer` (`pip install opencv-python-headless potracer`).
- **Áudio:** numpy, scipy, pyloudnorm, pedalboard, faster-whisper e rubberband.
- **Geração de fundos/planos com Runway ou Higgsfield:** só se houver chave no ambiente (`RUNWAYML_API_SECRET`, `HIGGSFIELD_API_KEY`/`HIGGSFIELD_API_SECRET`). Nunca peça a chave no chat. Sem chave, o cenário é ilustração vetorial em camadas com paralaxe (`scene/Clubhouse.tsx` como modelo).
- **Mapas:** Natural Earth 1:110m (`assets/geo`, `tools/geo_paths.py`).

## Fluxo de produção

1. **Referências:** copie as folhas do usuário para `assets/researched_references/<personagem>/` e o emblema para `assets/official_logos/`. Em seguida, recorte o emblema (fundo transparente → `remotion/public/emblema_recortado.png`).
2. **Áudio da narração:**
   - diagnóstico;
   - restauração (declip, redução de ruído conservadora, HPF 80 Hz, EQ corretiva, de-esser, compressão leve);
   - edição de pausas;
   - ajuste para 180 s com Rubber Band, preservando tom e formantes;
   - transcrição com tempos por palavra (faster-whisper);
   - fronteiras das cenas.

   Scripts em `src/audio/`. A saída `documentation/scene_bounds.json` gera `remotion/src/words_all.json` e `scenes.json`.
3. **Vetorização dos personagens:** cada personagem ganha uma entrada em `tools/vectorize_configs.py` com:
   - partes por polígono e pivôs;
   - `repaint` dos olhos e da boca com a cor da pele (eles são redesenhados animáveis em `chars/Face.tsx`);
   - `exclude`, `only`, `shared` e `inpaint_under` quando necessário;
   - `upsample: 2` e `bilateral` para referências com degradês suaves.

   Confira lado a lado com a referência (`tools/svg2png.cjs`) antes de animar.
4. **Rigs:**
   - personagens de frente: `chars/FrontKid.tsx` + `chars/rigs.tsx` (olhos, sobrancelhas, boca, braços inteiros, mão aberta);
   - cadeira de rodas: `chars/Theo.tsx` (IK do braço, mão no aro, roda girando pela distância);
   - atuação reutilizável: `full/acting.ts` (acenar, apresentar, pensar, pular, empurrar a cadeira, expressões por chaves de tempo).
5. **Piloto:** `Pilot.tsx` com a abertura chamativa (`hook/Hook.tsx`) e a mixagem do piloto (`src/audio/pilot_mix.py`). Envie ao usuário e espere a aprovação.
6. **Vídeo completo:**
   - uma cena por arquivo em `full/scenes/SNN.tsx`;
   - kit gráfico em `full/fx.tsx` (TitleBurst, Chip, Card, Stamp, Burst, Confetti, MotionBG, Icon);
   - livro ilustrado em `full/story.tsx` para histórias bíblicas e históricas;
   - transições `wipe`/`iris`/`page` em `full/Full.tsx`.

   Confira os quadros-chave de cada cena com `npx remotion still ... --props='{"only":N}'`.
7. **Mixagem completa** com `src/audio/full_mix.py`:
   - efeitos sintetizados sincronizados com cada elemento visual;
   - música com *ducking* de −7,5 dB;
   - −14 LUFS e pico de −1,3 dBTP.
8. **Renderização** (~50 min por versão, em segundo plano): `Completo` e `CompletoSemLegendas`.
9. **Controle de qualidade:**
   - varredura de 1 quadro por segundo e quadros de todas as transições;
   - `tools/finalize_v3.sh` (codificação, quadros pretos, congelamentos, volume, sincronia).

   Trechos vazios ou parados são corrigidos e re-renderizados só no intervalo afetado (`--frames=A-B`), com emenda exata por contagem de quadros.
10. **Entregas** em `deliverables/`:
    - FINAL e SEM_LEGENDAS (.mp4);
    - CAPA (.png);
    - `final.srt` (`tools/make_srt_v3.py`);
    - `voice_edited.wav` e `voice_comparison.wav`;
    - relatório em português;
    - PROJETO.zip (`tools/make_zip.sh`).

    Depois: commit, push e envio ao usuário.

## Paleta da série

| Cor | Hex |
|---|---|
| Navy | `#211C55` |
| Roxo profundo | `#190C3C` |
| Royal | `#2851D8` |
| Turquesa | `#13B9C5` |
| Amarelo | `#FFEB00` |
| Verde | `#70C94A` |

Fonte: **Poppins** (Black/ExtraBold/Bold), em `remotion/public/`. Os títulos levam contorno grosso no roxo profundo e sombra sólida.
