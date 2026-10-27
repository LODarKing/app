# FELINOS — Uma Aventura Selvagem! (episódio completo)

Este é o episódio da Especialidade de Felinos, no formato Reels 9:16 (1080×1920, 30 fps). Ele dura 9 min 06 s e segue as 18 cenas do roteiro, mais os créditos. Tudo foi desenhado em código, sem ferramentas de animação prontas: os felinos, a Lara, o Miguel, o Pingo, as figuras bíblicas, os cenários e a pintura. As vozes são as gravações originais, restauradas em `../FELINOS_AUDIO`.

## Como gerar

```bash
node audio/onomatopeias.mjs          # exporta as onomatopeias desenhadas (texto e tempo) para o som
python3 audio/montar_timeline.py     # recorta as falas e escreve timeline.js (cenas, eventos, vozes, palavras)
python3 audio/synth.py               # trilha, efeitos, batidas medidas (beats.json) e mixagem a -14 LUFS (mix.wav)
node render.mjs --sheet s05          # folha de contato: um quadro por batida da cena
node render.mjs --seg s01 cred       # renderiza as cenas em segmentos/ (4 páginas em paralelo)
node render.mjs --final              # junta os segmentos e o som em FELINOS_EPISODIO_COMPLETO.mp4
```

## Como funciona

- **Render.** `window.seek(t)` desenha o quadro do instante t como função pura do tempo. Não há transições de CSS, timers nem `requestAnimationFrame`. O ruído vem do mulberry32 com semente. A saída é H.264 yuv420p com CRF 16.
- **Pintura.** Cada personagem e cenário passa por um pincel com textura (`painterize`) e por um filtro de tinta a óleo (Kuwahara) sobre papel (`js/post.js`). A luz e a sombra vêm de `lightRig`, que soma luz principal, sombra e luz de recorte.
- **Cenas.** Ficam em `js/cenas/`. Os eventos de cada cena estão em `timeline.js`, gerado por `audio/montar_timeline.py`, e as legendas saem das palavras transcritas com a grafia corrigida.
- **Som.**
  - A trilha é sintetizada por trechos, na grade global de 120 bpm.
  - As batidas são medidas na trilha pronta (`audio/beats.json`).
  - Cada efeito cai na batida ou meia batida medida mais próxima (`audio/acertos.json`).
  - A trilha abaixa 9,5 dB sob as falas.
  - A mixagem fica em -14 LUFS.
- **Insígnias.** Só as oficiais: o emblema dos Desbravadores e a insígnia EN-024.

## Créditos

- Narração: Italo Marinho
- Lara: voz de Isabella Meneses
- Miguel: voz de Abner Araújo

Isabella e Abner fazem parte do Clube de Desbravadores Edwardo Schimidt.
