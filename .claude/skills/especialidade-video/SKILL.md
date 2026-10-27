---
name: especialidade-video
description: Produz um episódio animado (Reels 9:16, 1080×1920) da Série Especialidades dos Desbravadores no estilo aprovado no episódio FELINOS — Uma Aventura Selvagem! (canvas 2D + filtro WebGL pintado, personagens desenhados do zero a partir das referências, fotos reais em PIP com nome científico, trilha sintetizada, vozes reais restauradas). Use para qualquer nova especialidade, piloto ou ajuste de episódio.
---

# Série Especialidades dos Desbravadores — estilo aprovado (Felinos)

**Projeto de referência:** `FELINOS_EPISODIO/`. O vídeo final é `FELINOS_EPISODIO_FINAL.mp4`, com 9 min 06 s, aprovado e publicado.
**Guia completo:** `ESTILO_APROVADO/especialidades.md`. Leia antes de começar e siga-o. O `CLAUDE.md` da raiz traz as regras de render, visual, som e o ciclo de notas.
**Vozes:** processo de `FELINOS_AUDIO/` (ver o `README.md` de lá).

> O estilo antigo (v3, Remotion + personagens vetorizados, em `EDUCACAO_INCLUSIVA_WORK/`) foi substituído.
> **Não usar Remotion, HyperFrames nem skills/geradores prontos**: tudo é desenhado do zero em código.

## Regras do usuário (obrigatórias)

- **Português** em toda a comunicação, explicando os processos.
- **Piloto antes do vídeo completo**, e esperar a aprovação.
- **Vozes:** só as gravações do usuário, restauradas em "som de estúdio" (sem respirações, pausas encurtadas). Nada de voz sintética nem falas inventadas.
- **Personagens criados do zero a partir das referências do usuário:**
  - olhos que se mexem;
  - luz, sombra e recorte;
  - movimento corporal;
  - cenário com movimento e luz.
- **Marca:** só o emblema e a insígnia oficiais enviados pelo usuário. Nada de insígnias inventadas.
- **Créditos:** com os nomes e o clube informados pelo usuário.
- **Fotos reais em PIP** com nome científico quando a narração cita um animal:
  - Wikimedia Commons com licença livre e crédito visível, ou fotos enviadas pelo usuário;
  - nunca imagem com marca d'água de banco de imagens.
- **Conteúdo bíblico:** reverente, fiel ao texto, sem violência gráfica, anjo respeitoso.
- **Precisão científica:** conferir cada dado com a narração.
- **Legendas:** legíveis em todas as falas, fora das áreas de botões do Instagram.
- **Git:** commits e push frequentes no branch designado, sem identificador de modelo. Vídeos, mixagem e fotos ficam fora do git.
- **Chaves de API:** nunca pedir no chat.

## Como fazer

1. Copiar o projeto (comando em `ESTILO_APROVADO/especialidades.md`, §13) para `<NOME>_EPISODIO/` e a pasta de áudio para `<NOME>_AUDIO/`.
2. Restaurar e transcrever as vozes. Depois montar a linha do tempo em `audio/montar_timeline.py` → `timeline.js`.
3. Escrever as cenas em `js/cenas/` (`CENAS[id] = { draw, ui, sfx, capY }`), reaproveitando:

   | Arquivo | O que reaproveitar |
   |---|---|
   | `people.js` | Lara e Miguel |
   | `bigcats.js` / `pingo.js` | animais |
   | `figuras.js` | personagens históricos e bíblicos |
   | `sets.js` / `atmos.js` | cenários e atmosfera |
   | `fotos.js` | PIP com foto real |
   | `episode.js` | legendas e onomatopeias |
   | `mapa.js` | mapa |
   | `mesa.js` | mesa de estudos |
   | `historias.js` | câmera e virada de página |

   Animais com a fase da passada pela distância (`catStep`/`figStep`), nunca pelo tempo.
4. Trilha: `node audio/onomatopeias.mjs`, depois `python3 audio/synth.py`. O resultado é o tema recorrente com os efeitos na batida medida, em −14 LUFS.
5. Ciclo de notas com folhas de contato (`node render.mjs --sheet sNN`) até tudo ficar ≥ 8, mais tiras de quadros seguidos para o movimento.
6. Render a 30 quadros/s com o filtro aprovado (`js/post.js`):
   - `--seg` em partes de até ~1 h 30;
   - `--part` para refazer só um trecho;
   - `--final` para juntar com o som.

   Por fim, a versão de publicação em CRF 22.
7. Verificar o vídeo pronto (quadros pretos e congelados, LUFS, duração, varredura de quadros), enviar e explicar em português.
