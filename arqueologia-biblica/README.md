# Arqueologia Bíblica: Os Segredos Enterrados da Bíblia (AM-032)

Vídeo vertical da Série Especialidades dos Desbravadores: 1080×1920, 30 q/s, até 180 s. Esta pasta está na **etapa piloto** (10 s).

> **Situação (14/11/2026)**
> - **Imagem, trilha, efeitos e legendas do piloto:** prontos.
> - **Locução (ElevenLabs):** bloqueada. A credencial salva no ambiente é o *ID* da chave, não a chave `sk_…`.
> - **Prévia:** `export/previa_SEM_VOZ_arqueologia_biblica_10s.mp4`, só para avaliar a direção de arte. Os tempos são estimados e não há narração. **Não é o piloto final.**
> - **Piloto final:** `export/piloto_arqueologia_biblica_10s.mp4` sai assim que a voz for gerada (comandos abaixo).

## Tecnologia (e por que não Remotion)
O projeto usa o motor de render próprio da série: Canvas 2D desenhado do zero em código, com Playwright/Chromium e FFmpeg.
- Os vetores são caminhos SVG originais (`src/vetores.js`), exportados como `.svg` editáveis em `assets/vetores/`.
- O render é determinístico: `window.seek(t)` desenha o quadro do instante t.
- Essa escolha segue o estilo aprovado da série (`ESTILO_APROVADO/especialidades.md`, sem Remotion). Ela também dá controle total sobre a textura de papiro, os pivôs do recorte e o render quadro a quadro.

## Pastas
| Caminho | Conteúdo |
|---|---|
| `BIBLIA_DE_ARTE.md` | paleta, tipografia, linguagem de recorte, regras de movimento e som |
| `roteiro_e_matriz_requisitos.md` | storyboard do piloto com tempos, roteiro provisório completo e matriz dos 9 requisitos |
| `REFERENCIAS_E_FONTES.md` | o que foi conferido (com data), o que falta conferir, créditos de fontes |
| `src/config.js` | design system: cores, fontes, textos, legendas |
| `src/nucleo.js` | papiro, peças de recorte (contorno, sombra, textura), câmera, traço de tinta |
| `src/vetores.js` | vetores SVG das peças (origem no pivô) |
| `src/personagem.js` | egípcio articulado (IK nas pernas, braço que aponta, olhar e piscada) |
| `src/objetos.js` | estela, lupa, pincel, areia, nuvem, mapa, carimbo, rolo, frisos |
| `src/cenas/piloto.js` | os 5 planos do piloto |
| `src/legendas.js` | legendas por palavra (ocre = palavra falada; azul-lápis = palavras-chave) |
| `src/tempos.js` | GERADO: linha do tempo pelas palavras da locução |
| `audio/` | `gerar_locucao.py` (ElevenLabs), `trilha_piloto.py`, `timbres.py`, `mix_piloto.py` |
| `audio/piloto/` | `beats.json` (batidas medidas), `acertos.json` (efeitos na grade), `ancoras.json`, `mix_medicao.json` |
| `revisao/` | folhas de contato (um quadro por batida), quadros de conferência e notas do ciclo de qualidade |
| `material_de_apoio/` | relatório, glossário, 10 fichas e 5 escavações: **só após a aprovação** |
| `export/` | prévia e piloto (vídeo completo só após a aprovação) |

## Como liberar a locução (uma vez)
1. Em elevenlabs.io → Developers → API Keys, crie ou faça a rotação de uma chave. Copie o valor que começa com `sk_`.
2. No Claude Code na nuvem: menu do ambiente (barra de título) → **Editar** → **Network secrets**. Troque o valor salvo de `api.elevenlabs.io` (cabeçalho `xi-api-key`) pela chave `sk_…`. **Não cole a chave no chat.**
   No computador local, a alternativa é criar `.env` com `ELEVENLABS_API_KEY=sk_…`. O `.env` é ignorado pelo git.

## Pipeline do piloto (a partir desta pasta)
```sh
python3 audio/gerar_locucao.py --vozes          # lista as vozes da conta (não gasta créditos)
python3 audio/gerar_locucao.py --voz "<nome ou ID da sua voz salva>"
python3 audio/gerar_locucao.py --gerar          # 1 take (~95 caracteres), com tempos por caractere
python3 audio/gerar_locucao.py --posicionar     # sem custo: frases nas pausas, voz sem acelerar
node ferramentas/montar_tempos.mjs              # cortes e legendas pelas palavras reais
python3 audio/trilha_piloto.py                  # trilha + efeitos na batida medida
python3 audio/mix_piloto.py                     # voz à frente, -14 LUFS, pico verdadeiro <= -1,5 dBTP
node render.mjs --sheet revisao/folha_contato.png        # ciclo de notas: um quadro por batida
node render.mjs --video out/piloto_video.mp4 0 10
node render.mjs --mux out/piloto_video.mp4 audio/piloto/mix_piloto.wav export/piloto_arqueologia_biblica_10s.mp4
```
Outros comandos:
- `node render.mjs --frame saida.png T`: um quadro;
- `node render.mjs --stills saida.png T1 T2 …`: quadros seguidos;
- `node ferramentas/exportar_svg.mjs`: exporta os vetores.

Dependências:
- Node 22 com Playwright e o Chromium do ambiente;
- FFmpeg;
- Python 3 com numpy, scipy, soundfile e pyloudnorm.
