# Relatório de qualidade — Episódio 06 · Voyager 1

## Fase 1 — Piloto (`piloto_10s.mp4`) · aguardando aprovação

### Narração recebida
| Item | Resultado |
|---|---|
| Arquivo | `narracao_original/Voyager .mp3`, preservado byte a byte (MD5 `46fb3aefe127e792544777b1e9e28eed`) |
| Formato | MP3, 128 kbps, 44,1 kHz, mono, **65,306 s** |
| Integridade | Decodificação completa sem erros (ffmpeg); −21,9 LUFS; pico real −4,6 dBTP |
| Identificação | Arquivo único no pacote: narração completa, sem trilha nem efeitos |
| Transcrição | faster-whisper large-v3. Uma repetição espúria em 55 s ("atravessando. Atravessando") foi descartada após passada isolada com dois modelos |
| Tempos | Alinhamento forçado CTC (wav2vec2 XLSR-53 pt). O Whisper adiantava as palavras em 100–500 ms ("dois": 2,54 s no Whisper; 2,94 s no alinhamento e no espectrograma) |

### Tratamento da voz (`narracao_tratada.wav`)
Passa-altas de 60 Hz e −2 dB em 250 Hz, ambos de fase zero. De-esser de no máximo −4 dB. Compressão 2:1 com redução máxima de 4,7 dB. Limitador só nos picos. Resultado: −16,1 LUFS, pico −1,8 dBFS.
**A duração é idêntica à do original (65,306 s)**, com correlação de 0,987 com o original. Não há corte, mudança de andamento, de altura nem de timbre.

### Piloto
| Item | Resultado |
|---|---|
| Duração | **12,57 s** (377 quadros). Termina depois de "…um marco histórico." (12,32 s), para não cortar a frase no meio. Em 10 s exatos a fala seria cortada em "2026," |
| Vídeo | H.264 High, 1080×1920, yuv420p, 30 q/s, CRF 16 |
| Áudio | AAC LC, 48 kHz, estéreo, 256 kbps |
| Loudness | **−14,0 LUFS** integrado; pico real **−2,2 dBTP** (meta ≤ −1); sem clipping |
| Voz × trilha | voz 16,8 dB acima da trilha nos trechos falados (a trilha abaixa 9 dB sob a voz) |
| Narração dentro do MP4 | correlação cruzada com o original: **atraso de 0,00 ms** em todos os trechos de 2 s (correlação 0,955–0,983, com a trilha por baixo); **35/35 palavras** presentes |
| Grade musical | sintetizada a 101,5 bpm; **medida em 101,578 bpm** (fase 146,8 ms; resíduo máx. 20 ms). 47 efeitos a no máx. **39 ms** da grade medida (`audio/acertos.json`) |
| Remotion | Quadro 330 renderizado pelo Remotion **idêntico pixel a pixel** (diferença 0) ao do `render.mjs` |

### Ciclo de folhas de contato (um quadro por batida)
| Rodada | Gancho | Celular | Movimento | Variedade | Marca | Som | Correções |
|---|---|---|---|---|---|---|---|
| v0 (testes) | — | — | — | — | — | — | Textos sobrepostos em 3,1 e 7,3 s. Terra procedural com cara de desenho (trocada pela textura NASA). Céu deslocando junto com a câmera (fantasma circular). Lua fora do quadro |
| v1 | 5 | 7 | 7 | 8 | 8 | 8 | (1) gancho: câmera colada na digitação, recuando desde o 1º quadro, e a mensagem "decola"; (2) hodômetro mostrava 382 milhões de km no ponto de luz e encostava na Terra; (3) sonda invadia a legenda; rótulos de 32 → 38–40 px |
| v2 | 8 | 8 | 8 | 8 | 8 | 8 | silhueta da sonda legível (luz de apoio); abertura ainda mais próxima |

Folha final: `documentacao/folha_piloto_v2.jpg`.

### Pendências para o vídeo completo
- **Símbolo AV do canal:** não veio nos arquivos. O encerramento usa apenas o nome em tipografia, até o arquivo original ser enviado (não será redesenhado).
- Confirmar 1979/1980 (Júpiter/Saturno) numa página oficial.
- Verificar atualizações da NASA sobre o problema de dados antes da publicação.
