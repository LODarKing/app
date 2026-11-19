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

---

## Fase 2 — Episódio completo (`video_final.mp4`) · piloto aprovado em 19/11/2026

### Propriedades do MP4 exportado (conferidas no arquivo final)
| Item | Resultado |
|---|---|
| Duração | **66,000 s**: narração de 65,31 s mais 0,7 s de cauda sob a assinatura. Sem vinheta longa |
| Vídeo | H.264 High, 1080×1920, yuv420p, 30 q/s, CRF 16; **1.980 quadros**; decodificação completa sem erros |
| Áudio | AAC LC, 48 kHz, estéreo, 256 kbps, 66,000 s |
| Loudness | **−14,0 LUFS** integrado; LRA 3,7 LU; **pico real −1,6 dBTP** (meta ≤ −1); sem clipping |
| Voz × trilha | voz 16,7 dB acima da trilha nas falas |
| Narração | atraso de **0,00 ms** nos 33 trechos de 2 s (correlação ≥ 0,955 com o original); **181/181 palavras** presentes; nenhuma frase cortada |
| Arquivo | 46,8 MB |

### Som
- Trilha sintetizada em 101,5 bpm e **medida em 101,513 bpm** (fase 142,8 ms; 143 ataques na grade; resíduo máx. 9,2 ms).
- 118 efeitos encaixados na semicolcheia medida. O maior desvio em relação ao evento visual é 68 ms (passagem da régua pela heliopausa). Nos acertos ligados a palavras, o desvio é ≤ 59 ms (2 quadros). Detalhes em `audio/acertos.json`.
- Progressão: suspense (drone e pulsos) → crescimento na viagem → **ponto alto em "26 bilhões"** (a única passagem com bateria) → pulsos do sinal → **recuo quase ao silêncio no problema** → a harmonia volta na linha do tempo → piano contemplativo → resolução em Fá(add9) sob a assinatura.
- Nenhum som de explosão, vento ou "som do espaço": efeitos tonais e de interface, usados como linguagem de cinema.

### Ciclo de folhas de contato (episódio inteiro, um quadro por batida: 112 quadros)
| Rodada | Gancho | Celular | Movimento | Variedade | Marca | Som | Correções |
|---|---|---|---|---|---|---|---|
| e0 (testes por cena) | — | — | — | — | — | — | "1 DIA-LUZ" cortado na borda; sonda pequena demais no diagrama; resposta hipotética colidindo com a coluna do contador; linha do tempo em "S" poluída (refeita como eixo vertical); "2026" aparecia depois do fim da cena; mergulho final ampliava a cena inteira |
| e1 | 8 | 7 | 8 | 9 | 8 | 8 | (1) rótulos da régua, do painel e do diagrama de 30–36 → 38–42 px; (2) anos futuros visíveis e apagados na linha do tempo (o topo ficava vazio); (3) "DISTÂNCIA DA TERRA" restava sob o "1 DIA-LUZ" |
| e2 | 8 | 8 | 8 | 9 | 8 | 8 | conferência das emendas no MP4: a data sumia de um quadro para o outro em 12,58 s → saída contínua; nova renderização |

Folhas: `documentacao/folha_episodio_0s.jpg`, `…17s.jpg`, `…34s.jpg`, `…51s.jpg`.

### Revisão científica e de conteúdo
- Unidades: km, UA, horas e km/s conferidos. **25,9 bilhões de km** na tela; "quase 26" na fala. 24 h + 24 h = 48 h. Luz ≈ 300 mil km/s. Distâncias da régua em escala logarítmica, **rotulada**. Escala real (km) na saída da Terra.
- Datas: 18/11/2026 (marco); 14/11/2026 (dados); 1977, 5/3/1979, 12/11/1980 e 2012, confirmadas na NASA/NSSDCA.
- Problema de dados: "DADOS NÃO RECEBIDOS" e "SINAL DE RÁDIO (PORTADORA) DETECTADO" mostrados separadamente. **Nenhuma causa inventada.** Não diz que a sonda está incomunicável. Painel rotulado "REPRESENTAÇÃO DIDÁTICA", com selo "situação em 19/11/2026 · fonte: NASA/JPL".
- Resposta: rotulada "RESPOSTA HIPOTÉTICA · supondo resposta imediata". Não sugere que a NASA tenha recebido uma resposta.
- Atualizações: nenhuma publicação da NASA/JPL posterior a 19/11/2026 sobre os dados (checado em 19/11/2026). **Conferir de novo antes de publicar.**

### Modelo da Voyager 1
Conferidos no 3D: antena de alto ganho de 3,7 m (branca, nervurada, com sub-refletor sobre 4 hastes), barramento decagonal com mantas térmicas e o Disco de Ouro, lança com os 3 RTGs aletados, lança de ciência com a plataforma de varredura (duas câmeras), lança do magnetômetro (~13 m) e as duas antenas de plasma/rádio em "V". Iluminação fisicamente coerente: a 173 UA, o Sol e a Terra estão praticamente na direção da antena (+Z), por isso a revelação é em contraluz quando vista por trás.

### Legendas
32 blocos gerados da transcrição alinhada (`legendas.srt`), revisados quanto a grafia e acentuação. Destaques: ciano para sinal e sonda ("dois dias", "Voyager 1", "24 horas", "interestelar"); amarelo para datas e distâncias ("18 de novembro de 2026", "dia-luz", "26 bilhões de quilômetros", "14 de novembro", "1977", "2012", "50 anos"). Posição: x 110–910, y ≈ 1330–1420, fora da coluna de botões e da faixa de descrição do Shorts. Os dois últimos blocos ficam só no SRT, porque a assinatura na tela mostra o mesmo texto.

### Licenças dos recursos
| Recurso | Licença |
|---|---|
| Narração | arquivo do usuário (ElevenLabs), preservado |
| Trilha e efeitos | sintetizados em código para este episódio |
| Fontes Archivo e IBM Plex Mono | SIL OFL 1.1 |
| Texturas da Terra (Blue Marble 2002) e da Lua (LRO/LROC) | NASA, domínio público (`assets/nasa/LICENCA.md`) |
| Voyager, Júpiter, Saturno, nuvens, estrelas e Via Láctea | modelados/gerados em código |
| Vídeos ou fotos de terceiros | **nenhum** |

### Pendências
- **Símbolo AV:** não foi fornecido. A assinatura usa só o nome do canal em tipografia, sem redesenhar a marca. Se o arquivo original for enviado, ele entra acima de "ALÉM DO VISÍVEL" (`componentes_animacao/cenas_final.ts`, cena 7).
- Rever a situação da sonda na NASA antes de publicar (ver `fontes_nasa.md`).
