# Relatório de qualidade — Piloto (episódio 07)

## 1. Narração recebida — ⚠️ arquivo incompleto
- O zip enviado (969.539 bytes) está **truncado**: o cabeçalho declara 1.035.027 bytes comprimidos, e faltam o fim e o diretório central (por isso `unzip` falha).
- A descompressão parcial recuperou **982.826 de 1.049.296 bytes** do MP3 "Narração Dia da Consciência negra .mp3" (mono, 44,1 kHz, 128 kb/s): **60,37 s de ~65,6 s**.
- A fala corta no meio de "enxergamos o pr…". Faltam **"presente. Além do Visível. O extraordinário está nos detalhes."**
- O trecho 0–12 s, usado no piloto, está íntegro. A voz não foi regenerada, acelerada nem alterada no timbre.
- **Para o vídeo completo é preciso reenviar o arquivo** (de preferência o MP3/WAV direto, sem zip).

## 2. Transcrição e sincronia
- faster-whisper medium com tempos por palavra (`documentacao/transcricao_whisper.json`). Bate com o roteiro oficial palavra a palavra no trecho recebido.
- `mapa_sincronizacao.json`: 20 frases e 43 blocos de legenda, com as palavras casadas em ordem (o script para se houver diferença).
- Legendas: `legendas.srt` (até 60,3 s) e `legendas_piloto.srt`. Números falados por extenso aparecem em algarismos ("20 de novembro", "13 de maio", "1971").

## 3. Piloto — `piloto_10s.mp4`
| Item | Resultado |
|---|---|
| Duração | **11,87 s** (356 quadros). Passa de 10 s para terminar no silêncio depois de "Em 1971," (fala termina em 11,76 s, "durante" começa em 11,94 s), sem cortar palavra. |
| Vídeo | 1080×1920, H.264, yuv420p, CRF 16, 30 q/s |
| Áudio | AAC 48 kHz estéreo, 256 kb/s |
| Loudness | **−14,0 LUFS** integrado, pico verdadeiro **−1,2 dBTP** (medido no MP4 final) |
| Decodificação | completa, sem erros (ffmpeg) |
| Grade sonora | 93 BPM medido; todos os inícios detectados na grade (resíduo máx. 8,1 ms). Acertos em `audio/acertos.json`. |

## 4. Ciclo de notas (folha de contato um quadro por batida)
| Critério | v1 | v2 | v3 | final | O que mudou |
|---|---|---|---|---|---|
| Gancho nos 2 primeiros s | 3 | 6 | 8 | 8 | v1: quadros quase vazios (a parte do plano atrás da câmera era projetada invertida e cobria tudo). Corrigido com corte por profundidade, mais contraste e rastro de luz. |
| Leitura no celular | 6 | 7 | 8 | 8 | Legenda 54→58 px com faixa escura própria; cartões 2,45→2,8×; etiquetas 30→34–36 px. |
| Qualidade do movimento | 5 | 7 | 7 | 8 | "PORQUE" sem espaço corrigido; contador com algarismos pela metade na pausa (agora encaixam); numeral "20" sumia sobre o cartão dourado entre 8,4 e 8,5 s (agora sai azul-escuro e esquenta para dourado). |
| Variedade | 7 | 8 | 8 | 8 | Algo novo a cada 0,6–2,5 s: cursor, dourado, arco de câmera, anel, cartões, título, etiquetas, queda, linha, 2024, recuo, 1971, mapa, ponto. |
| Fidelidade à marca | 7 | 8 | 8 | 8 | Paleta do briefing; sem logo AV (arquivo não fornecido, ver item 6). |
| Sincronia do som | 7 | 7 | 8 | 8 | 2024 movido para a grade (b14.5); teclas no "2026" e nas etiquetas. |
Folhas: `documentacao/folha_piloto_v1.png`, `documentacao/folha_piloto_v3_final.png`; tiras de movimento: `documentacao/tiras_movimento_v3.png`, `documentacao/tira_cartao_linha_corrigida.png`.

## 5. Conferência histórica do piloto
- Calendário de 2026 com dias da semana reais (20/11/2026 = sexta).
- "LEI ÁUREA · 13·05·1888" correto. O cartão do 13 de maio tem o mesmo peso visual do 20.
- "2024 — FERIADO NACIONAL" correto (Lei 14.759/2023, primeiro feriado em 2024).
- Marcas ciano sem texto em 2011 e 1978, que serão nomeadas na cena 05.
- Contorno do Brasil: Natural Earth 1:50m. O ponto de Porto Alegre está nas coordenadas reais.
- Sem retratos, documentos, manchetes ou falas inventadas.

## 6. Pendências e limitações (antes do vídeo final)
1. **Áudio completo da narração** (arquivo recebido truncado).
2. **Logo AV original do Além do Visível**: não está no repositório nem no envio. Não redesenhei nem criei uma logo; a identidade no piloto vem só da paleta e da tipografia. Envie o arquivo (SVG ou PNG transparente).
3. **Tecnologia:** o projeto é Remotion + React + TypeScript (`remotion/`), e cada quadro é função pura de `frame/30`, o equivalente ao `window.seek(t)` do estúdio. O `render.mjs` na raiz faz a folha de contato, o vídeo e a junção com o som.
4. **Escuta:** a mixagem foi conferida por medição (LUFS, pico, grade, ausência de corte), não por audição humana. Vale ouvir o piloto com fone.
5. **Trilha:** original, sintetizada em código (piano abafado, pad, sinos FM, tiques, teclas, papel). Sem ritmos afro-brasileiros usados como decoração. Na cena 06, qualquer elemento percussivo será sóbrio e justificado.
6. **Transparência:** narração em voz sintética; avaliar o rótulo de conteúdo sintético do YouTube (ver `titulo_descricao_tags.txt`).
