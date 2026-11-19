# Identidade sonora — "Enquanto Isso em Amontada…" · Rackel Sousa

**Conceito:** GLAM POP NEWS. Uma pergunta curta e sem resposta no primeiro segundo; a resposta completa quando "Amontada" aparece.

## O DNA (para qualquer adaptação futura)

| | |
|---|---|
| Andamento | **120 BPM** (batida = 0,5 s · semicolcheia = 0,125 s) |
| Tonalidade | **Fá menor** (eólio) |
| Motivo | **Dó5 → Fá5 → Mi♭5 · (pausa) · Lá♭5 → Fá5** (MIDI 72 77 75 80 77) |
| Ritmo | semicolcheias **0, 1, 3, 6, 8**: duas notas coladas, uma terceira solta, **silêncio de colcheia**, a 4ª nota **sincopada** (no "e" do 2º tempo) e a 5ª **resolvendo no tempo forte** |
| Intervalos | 4ª justa ↑ · 2ª maior ↓ · 4ª justa ↑ · 3ª menor ↓ (dois saltos de 4ª "com atitude" e uma queda de 3ª menor que fecha) |
| Harmonia | Fm(add9) · cadência de expectativa **D♭maj7 → E♭(add9) → Fm** · a 4ª nota (Lá♭) é tocada sobre baixo Ré♭ e a 5ª (Fá) sobre Fá: a resolução é ouvida no baixo e na melodia ao mesmo tempo |
| Encerramento | eco do fim do motivo uma oitava acima: **Mi♭6 · Lá♭6 · Fá6** (a última nota, Fá6, é a "nota de assinatura" para fechar outros conteúdos) |

Notação rápida (uma semicolcheia por coluna):
```
tempo:   1 . . . 2 . . . 3 . . .
motivo:  C F . E♭. . A♭. F─────── 
```

## O timbre-assinatura
Cada nota da melodia é a soma de três camadas, sintetizadas (`lead_signature` em `audio/sonic_logo.py`):
1. **"pock"** — estalo curto afinado na própria nota (lembra a tampa do batom saindo). É o "clique elegante" do primeiro instante e dá ataque nítido em qualquer volume.
2. **vidro FM** — corpo brilhante com índice de modulação que cai rápido.
3. **pulso quente** — onda de pulso filtrada, com glide de 12 ms vindo da nota anterior (o "jeito" da melodia) e vibrato tardio só nas notas longas.

Apoios: baixo curto e saturado (2º e 3º harmônicos reforçados para aparecer no celular), palma + estalo + **beijo (lip smack)** no impacto, shaker com swing leve, acorde glam de serras desafinadas, sinos no brilho final.

## Como a música conversa com a animação

| s | animação | música |
|---|---|---|
| 0,000 | boca + batom entra | **provocação**: "pock" + Dó5, Fá5 — bumbo e baixo curtos |
| 0,375 | batom toca o lábio | Mi♭5 (3ª nota) — a frase fica **sem resolver** |
| 0,375–1,0 | batom nos lábios | o gesto vira **ritmo**: grãos de seda afinados em fusas (Fá6→Dó7 subindo no lábio inferior, arco descendo no superior), panorâmica segue o batom |
| 1,000 | "mwah" + câmera recua | estalo labial **afinado em Dó6**, arpejo D♭maj7 começa |
| 1,25–2,0 | batom desenha o contorno | **traço ressonante** que sobe de Dó5 a Sol6 em semicolcheias + tiques de caneta + E♭(add9) com filtro abrindo + subida para o beijo |
| 2,000 | beijo no mapa | **motivo completo, nota 1** (Dó5) + estalo do beijo |
| 2,125 / 2,375 | "Enquanto" / "Isso" | notas 2 e 3 (Fá5, Mi♭5) |
| 2,500 | "em" | só um estalo — **a melodia respira** (síncope = expectativa) |
| 2,750 | batom entra em "Amontada" | **Lá♭5 sincopado** + grãos de seda + baixo Ré♭ |
| 3,000 | "Amontada" completa | **IMPACTO**: Fá5 (com oitava abaixo) + baixo Fá + bumbo + palma/beijo + acorde Fm(add9) + sinos |
| 3,25 · 3,375 · 3,5 | as três reticências | eco Mi♭6 · Lá♭6 · **Fá6** — fim |
| 3,5–4,3 | leitura + saída | cauda curta, passada de ar na saída; silêncio a partir de 4,45 s para a fala entrar limpa |

## Os três estudos (em `estudos/`)
Mesma estrutura e mesmos tempos; muda o motivo, o timbre e a percussão.

| | A — Glam Electro | B — Pop Signature | C — Editorial Chic |
|---|---|---|---|
| motivo | Lá♭4 Dó5 Sol5 · Mi♭5 Fá5 | **Dó5 Fá5 Mi♭5 · Lá♭5 Fá5** | Fá5 Dó5 Mi♭5 · Ré5 Dó5 (termina na dominante, "em aberto") |
| melodia | serras desafinadas + campana | pock + vidro + pulso | marimba sintética |
| ritmo | bumbo mais presente, palmas | bumbo nos tempos 1 e 3, palma+estalo+beijo, shaker | aro, estalos, tique de caneta, bumbo macio |
| harmonia | pads e acorde de serras | acordes em plucks de vidro | piano elétrico FM |
| celular (energia retida) | -5,2 dB | **-3,1 dB** | -2,7 dB |
| espectrograma | melodia borrada pelas serras (densa) | **harmônicos da melodia nítidos e separados** | limpo, mas a madeira some rápido |

**Comparação (técnica + intenção; sem escuta):**
- *Originalidade:* B tem o desenho mais pessoal (dois saltos de 4ª e queda de 3ª menor com pausa sincopada); A soa mais "gênero" (electro-pop de catálogo); C é elegante, mas a resolução na dominante enfraquece o fechamento.
- *Reconhecimento imediato:* B é o único cujo primeiro segundo já toca o início do motivo com um ataque próprio (o "pock"); em A o ataque se confunde com as serras, em C com a percussão de madeira.
- *Clareza no celular:* C e B retêm mais energia; B mantém a melodia +9,5 dB acima do resto entre 500 Hz e 5 kHz.
- *Sincronia:* igual nos três (mesma grade).
- *Personalidade do quadro:* B tem atitude sem cair em "propaganda de maquiagem"; C é o mais "jornalístico"; A, o mais "festa".

**Escolha: B como base**, com o **acorde glam e o pad que abre** de A (o brilho no impacto e a expectativa no mapa) e os **tiques de caneta** de C no traço do mapa (o toque editorial, sem soar telejornal).

## Arquivos
| arquivo | o que é |
|---|---|
| `rackel-sonic-logo-final.wav` | versão principal, 4,5 s (música termina aos ~4,3 s; silêncio a partir de 4,45 s) — PCM 24 bits, 48 kHz, estéreo |
| `rackel-sonic-logo-final.mp3` | prévia, 320 kbps |
| `rackel-sonic-logo-instrumental.wav` | sem os efeitos ligados à animação (seda do batom, "mwah", traço, beijos, whooshes) |
| `rackel-sonic-logo-short.wav` | 1,75 s: só o motivo + impacto — para transições, fins de vídeo, cortes |
| `rackel-sonic-logo-stems/` | melodia, harmonia, baixo, percussão, efeitos (24 bits, mesmo ganho da master; a soma difere da master só pelo limitador) |
| `estudos/` | os três estudos |
| `validacao/` | relatório técnico, espectrogramas e formas de onda |

Masterização: passa-altas 28 Hz, compressão de barramento 2:1 (limiar -16 dB), limitador com sobreamostragem 4× (teto -1,3 dBTP), **-14 LUFS integrado** (padrão de vídeo em redes sociais).

## Reaproveitar
- **Versão longa:** repetir a cadência D♭maj7 → E♭(add9) → Fm em compassos de 2 s, motivo a cada 4 compassos, eco Mi♭6 Lá♭6 Fá6 no fim.
- **Transição curta:** `rackel-sonic-logo-short.wav`, ou só "pock" + Dó5 Fá5 (os 0,25 s iniciais), ou só o Fá6 final.
- **Outro andamento:** manter as proporções em semicolcheias (0, 1, 3, 6, 8) e as notas; tudo é gerado por `audio/sonic_logo.py` a partir de `src/timeline.json`.

## Limitação
Não há escuta neste ambiente. Tudo foi verificado por medição (`validacao/RELATORIO.md`): notas detectadas iguais às escritas, sincronia dentro de ±5 ms, loudness, pico verdadeiro, ausência de saturação, compatibilidade mono e simulação de alto-falante de celular. A aprovação do timbre e do "caráter" depende da sua escuta — de preferência no celular.
