# Relatório de áudio — Educação Inclusiva

## 1. Material de entrada (preservado sem alterações)

`assets/original_audio/` guarda 9 arquivos M4A enviados pelo usuário, com checksums em `SHA256SUMS`:

| Arquivo | Cena(s) | Duração | Formato |
|---|---|---|---|
| Narrac_a_o_Educac_a_o_Inclusiva_01.m4a | 1 | 18,69 s | AAC-LC, 48 kHz, estéreo, ~114 kb/s |
| …_02.m4a | 2 | 26,43 s | idem |
| …_03.m4a | 3 | 24,32 s | idem |
| …_04.m4a | 4 | 24,06 s | idem |
| …_05.m4a | 5 | 25,56 s | idem |
| …_06.m4a | 6 | 26,73 s | idem |
| …_07.m4a | 7 | 28,07 s | idem |
| …_08.m4a | 8 | 20,31 s | idem |
| Narrac_a_o_09_e_10.m4a | 9 e 10 | 43,39 s | idem |
| **Total** | | **237,6 s** | bit depth: não se aplica (AAC com decodificação em ponto flutuante) |

## 2. Diagnóstico (antes de qualquer processamento)

Medições feitas com FFmpeg/FFprobe, NumPy/SciPy, librosa e pyloudnorm (`documentation/audio_diagnostic_raw.json`).

| Item | Resultado |
|---|---|
| Canais | **Mono duplicado** (L = R amostra a amostra; correlação 1,000). O processamento é feito em mono e a saída é estéreo dual-mono. |
| Loudness por tomada | −14,2 a −15,9 LUFS (alto para uma gravação bruta, provável AGC do celular) |
| Picos / clipping | Picos em 0 dBFS. **37 trechos com clipping** (205 amostras no total), com até 33 amostras de topo plano, por exemplo a 14,03 s da tomada 01 (`diag_take01.png`) |
| Ruído de fundo | Muito baixo: piso em frames de 20 ms ≈ −57 dBFS, SNR estimada de 37 a 45 dB. Entre frases o sinal chega quase a silêncio digital, sinal de supressão de ruído do próprio aparelho. A tomada 05 tem o piso mais alto (−52 dBFS) e um ruído de manuseio nos primeiros 0,7 s. |
| Zumbido elétrico | Não detectado (picos em 50/60/100/120 Hz ≤ 4,6 dB acima da vizinhança espectral) |
| Ventilador / ar-condicionado | Não detectado (espectro do ruído sem tons, decaindo com a frequência) |
| Reverberação | Baixa. Gravação próxima ao microfone; não foram vistas caudas reverberantes relevantes no espectrograma. **Não foi aplicada dereverberação**, para não introduzir artefatos. |
| Plosivas | Rajadas abaixo de 130 Hz em ataques de P/B (detectadas por frame) |
| Sibilância | Picos de energia 4,8–9,5 kHz até +18 dB acima da banda 300–3000 Hz em frames de "S" |
| Timbre (LTASS, 1/3 de oitava) | Ressonância "encaixotada" de +4 a 5 dB em 315–500 Hz e vale de cerca de −3 dB em 3,15–4 kHz, comparando com o espectro médio de fala de referência |
| Voz | f0 mediano 161 Hz (fundamentais quase sempre ≥ 110 Hz), o que permite passa-altas em 80 Hz |
| Repetições / reinícios / erros de leitura | **Nenhum.** Cada arquivo traz uma única tomada completa do seu trecho. Não houve escolha entre tomadas. |
| Pausas | Pausas entre frases já curtas (0,1 a 0,7 s). Há 1,4 s de silêncio no início da tomada 05 e silêncios de cabeça e cauda em todas as tomadas. |

## 3. Cadeia de restauração (`src/audio/process_voice.py`, `src/audio/dsp.py`)

1. **Declipping**: interpolação autorregressiva (ordem 32, mínimos quadrados) só nos trechos com |x| ≥ 0,97, preservando o sinal. Os 37 trechos foram reconstruídos e conferidos visualmente (`diag_declip.png`). Depois, ganho de −6 dB para criar headroom.
2. **Redução de ruído**: comparei quatro métodos medindo o piso nos silêncios, a perda de energia em fricativas (S/F/CH, 4–9 kHz), a perda de energia da fala e a "cintilação" espectral nos silêncios, um indicador de ruído musical (`denoise_comparison.json`):

   | Método | Piso no silêncio | Perda em fricativas | Cintilação |
   |---|---|---|---|
   | A — sem redução | −94,8 dB | 0,00 dB | 16,6 |
   | B — FFmpeg afftdn | −95,0 dB | **−0,45 dB** | 17,9 (pior) |
   | **C — subtração espectral conservadora (escolhido)** | **−103,8 dB** | **−0,02 dB** | **15,5** (melhor) |
   | D — RNNoise (arnndn, mix 0,6) | −99,2 dB | **−0,65 dB** | 16,3 |

   O método C usa redução máxima de 10 dB, piso de ganho e suavização tempo-frequência da máscara. Ele foi escolhido por reduzir o ruído sem tirar consoantes. RNNoise e afftdn foram descartados porque apagavam S/F/CH. DeepFilterNet não foi usado (exigiria PyTorch no ambiente). Com ruído de origem já baixo, o tratamento leve foi suficiente.
3. **Passa-altas** de 80 Hz, 12 dB/oitava.
4. **Controle dinâmico de plosivas**: a banda abaixo de 130 Hz é atenuada (até −10 dB) só quando a energia grave ultrapassa a energia da banda de fala.
5. **Equalização corretiva**, ajustada pela medição: −2 dB em 420 Hz (Q 1,2) contra a ressonância encaixotada, −1 dB em 160 Hz, +0,6 dB em 3,2 kHz e prateleira de −1,5 dB acima de 7,5 kHz.
   *Revisão feita durante a produção:* a primeira versão (+2,5 dB em 3,4 kHz) somada ao efeito do compressor clareava 3–6 kHz em cerca de +5 dB. Medi a contribuição de cada estágio e reduzi a equalização para evitar voz fina ou sibilante (§6).
6. **De-esser dinâmico em banda dividida** (4,8–9,5 kHz): atua só quando a banda passa a faixa média em mais de 4 dB, com no máximo −7 dB. Ficou ativo de 0,7 a 2,1 s por tomada.
7. **Compressão** 2,5:1, ataque de 12 ms, release de 140 ms, limiar relativo ao nível de fala. Redução média de cerca de 1,6 dB nos trechos ativos e máxima de cerca de 8 dB em picos isolados.
8. **Alinhamento de loudness por tomada** em −19 LUFS (mono).

`voice_chain_log.json` registra os parâmetros e as estatísticas por tomada.

## 4. Edição da narração (`src/audio/edit_voice.py`)

- **Transcrição** com Whisper large-v3-turbo (faster-whisper, int8, CPU) e marcação de tempo por palavra, com prompt de termos. Correções feitas na revisão: "Ellen Keller" → **Helen Keller**, "Mephibosete/Mephibozete" → **Mefibosete**, "Jônadas" → **Jônatas**, "2 Samuel" → "**Segunda** Samuel" (é o que o narrador fala), "porque" → "por que". As falas foram mantidas exatamente como gravadas ("a Convenção…" na cena 5 e "as suas próprias" na cena 3, diferentes do roteiro).
- **Limites de fala** por energia com histerese relativa ao pico e ao piso de cada tomada, em resolução de 10 ms. Uma região só conta como fala com pelo menos 80 ms de energia vozeada, o que excluiu o ruído de manuseio no início da tomada 05.
- **Pausas**: de 65 pausas, 28 foram encurtadas para um alvo por pontuação (vírgula 0,22 s, ponto 0,34 s, interrogação 0,42 s) e 37 mantidas como estavam. Economia total de 3,8 s; o narrador já falava com pausas curtas. Mudança de cena: 0,52 s.
- **Respirações**: 28 respirações antes de frases foram **preservadas** (−6 dB, com fades), em vez de removidas.
- **Ajuste de nível por frase**: corrige só a parte do desvio acima de ±1,5 dB (60%, limitado a ±2,5 dB), para manter a dinâmica expressiva.
- Cortes no ponto de menor energia, com **micro-crossfades de 12 ms (potência constante)** e cauda de 140 ms após o fim de cada palavra.

### 4.1 Duração e o limite de 180 s

| Versão | Duração |
|---|---|
| Fala bruta (soma das tomadas) | 237,6 s |
| Edição natural (pausas tratadas, sem mudar o andamento) | **208,25 s** (`voice_edited_natural_tempo.flac`) |
| Final | **178,2 s de voz + 1,8 s de cartela = 180,0 s** |

Mesmo sem nenhuma pausa, a fala ocupa cerca de 193 s. Por isso **não era possível caber em 180 s só com edição**. Medi a velocidade de articulação: **4,48 sílabas/s (cerca de 109 palavras/min)**, uma leitura lenta e pausada; a leitura em português brasileiro costuma ficar em 5–6 sílabas/s. Apliquei aceleração uniforme com **preservação de pitch e de formantes** (Rubber Band 3.3, motor R3 "finer"), fator **×1,168**, o que dá cerca de 5,2 sílabas/s (cerca de 128 palavras/min), ainda um ritmo calmo. A frase "perdeu a visão e a audição" ficou com ×1,05 por mapa de tempo, porque no fator uniforme "e a" se fundia (a confiança do Whisper caiu para 0,74). O resto absorveu a diferença.
**Esta é uma intervenção perceptível no andamento** e está registrada como limitação. A versão sem aceleração foi preservada (`voice_edited_natural_tempo.flac`, 208 s) para quem preferir publicar acima de 3 minutos.

## 5. Masterização

| Arquivo | Loudness integrado | LRA | Pico verdadeiro |
|---|---|---|---|
| voice_original.wav (tomadas originais concatenadas) | −15,1 LUFS | 5,1 LU | 0,0 dBTP |
| voice_clean.wav (tratada, sem edição) | −16,0 LUFS | 3,6 LU | −1,5 dBTP |
| voice_edited.wav (final) | −16,0 LUFS | 2,1 LU | −1,5 dBTP |
| **master.wav (voz + trilha + efeitos)** | **−14,0 LUFS** | 2,0 LU | **−1,3 dBTP** |

Medições do filtro `ebur128=peak=true` do FFmpeg. O limitador de pico verdadeiro foi escrito para o projeto: detecção com oversampling 4×, look-ahead de 3 ms e **sem ganho de compensação**. O `Limiter` do Pedalboard foi descartado porque aplica ganho implícito, que levou a voz a −10,7 LUFS no primeiro teste.
A queda de LRA (5,1 → 2,1 LU) vem principalmente da retirada de silêncios e do encurtamento de pausas: janelas de 3 s com menos silêncio têm loudness menos variável. É um valor normal para locução editada.

**Mixagem** (`src/audio/mix.py`): a trilha fica em −24 LUFS sozinha e sofre *ducking* pela voz (−7,5 dB, ataque de cerca de 60 ms, release de cerca de 450 ms), ficando cerca de 15 LU abaixo da narração. A trilha tem um corte de −4 dB em 2 kHz para abrir espaço à inteligibilidade. Os efeitos ficam em −2 dB relativos. O limitador do master atua acima de 1 dB por só 0,28 s no total.

## 6. Comparação A/B e verificação de qualidade

- `voice_comparison.wav`: 4 trechos (tomadas 01, 04, 07 e 05). **1 bipe = original, 2 bipes = tratado**, ambos ajustados para −19 LUFS, de modo que a comparação não favorece quem está mais alto.
- `audio_before_after.png`: espectrogramas do mesmo trecho e espectro médio de longo prazo antes e depois. Diferença final por banda, depois de igualar o loudness: −1,2 dB em 400 Hz, +1,8 dB em 2 kHz, +3,6/+4,0 dB em 3,15/4 kHz, +2,6 dB em 6,3 kHz e +2,8 dB em 10 kHz. Esse ganho recupera o vale de presença medido no original e fica próximo do espectro médio de fala de referência.
- **Inteligibilidade objetiva (Whisper):**

  | Sinal | Palavras | Confiança média | Palavras < 0,5 |
  |---|---|---|---|
  | Tomadas originais | 374 | 0,983 | 4 |
  | Tomadas tratadas | 375 | 0,985 | 3 |
  | Voz final editada (×1,17) | 375 | **0,985** | **0** |
  | **Master final (com trilha e efeitos)** | 375 | 0,980 | 2, com **97,9%** das palavras idênticas à transcrição de referência; as diferenças são só grafia de nomes próprios e numerais |

**Limitação de escuta:** neste ambiente não tenho como ouvir os áudios. A avaliação de artefatos, timbre e naturalidade foi feita com medidas objetivas (espectrogramas, LTASS, confiança de reconhecimento por palavra, piso e cintilação de ruído, medições de loudness e de pico) e não com escuta crítica. **É recomendável uma escuta humana do `voice_comparison.wav` e do vídeo final antes de publicar**, com atenção à aceleração ×1,17.
