# Além do Visível · Episódio 06 — Voyager 1: 48 horas para uma resposta

Shorts 1080×1920, 30 q/s. 100 % motion design programático (three.js + canvas 2D), dirigido pela narração original recebida.
Contrato de render: `window.seek(t)` desenha o quadro do instante t (função pura do tempo; ruído com semente mulberry32).

## Pastas
| Caminho | Conteúdo |
|---|---|
| `narracao_original/` | Arquivo recebido, intacto |
| `narracao_tratada.wav` | Voz com tratamento técnico leve (48 kHz, mesma duração) |
| `transcricao_narracao.txt`, `mapa_sincronizacao.json`, `legendas.srt` | Transcrição, mapa de sincronização (frases, palavras, pausas, intensidade, revelações, efeitos, cenas) e legendas |
| `componentes_animacao/` | Motor e cenas em TypeScript: `core.ts` (tempo, cores, fontes, texto), `espaco3d.ts` (estrelas, Via Láctea, Terra, Lua), `voyager.ts` (modelo 3D), `cenas_abertura.ts`, `legendas.ts`, `filme.ts` |
| `remotion/` | Projeto Remotion editável, que usa os mesmos componentes (`npm run studio`) |
| `audio/` | Transcrição, alinhamento, mapa, tratamento da voz, síntese da trilha e dos efeitos, batidas medidas e acertos |
| `assets/nasa/`, `fonts/` | Texturas NASA (domínio público) e fontes OFL, com as licenças |
| `storyboard.md`, `fontes_nasa.md`, `relatorio_qualidade.md` | Documentação |

## Comandos (a partir desta pasta)
```sh
python3 -I audio/transcrever.py "narracao_original/Voyager .mp3" documentacao/transcricao_bruta.json
python3 -I audio/analisar_narracao.py         # pausas, intensidade, altura; corrige a transcrição
python3 -I audio/alinhar.py                   # alinhamento forçado -> documentacao/alinhamento.json
python3 -I audio/montar_mapa.py               # mapa_sincronizacao.json, legendas.srt, transcricao_narracao.txt, componentes_animacao/dados/tempos.json
python3 -I audio/tratar_narracao.py           # narracao_tratada.wav
python3 -I audio/som.py 12.55 audio/mix_piloto.wav   # trilha + efeitos + voz, -14 LUFS; beats.json e acertos.json
npm install && npm run build                  # dist/filme.js
node render.mjs --sheet out/folha.png 0 12.55 # um quadro por batida
node render.mjs --video out/piloto_video.mp4 0 12.55
node render.mjs --mux out/piloto_video.mp4 audio/mix_piloto.wav piloto_10s.mp4
python3 -I audio/verificar_sincronia.py piloto_10s.mp4 12.4
```
Dependências: Node 22, Playwright com o Chromium do ambiente, FFmpeg; Python 3 com numpy, scipy, soundfile, pyloudnorm, librosa, faster-whisper, torch/torchaudio e transformers (só para o alinhamento).
