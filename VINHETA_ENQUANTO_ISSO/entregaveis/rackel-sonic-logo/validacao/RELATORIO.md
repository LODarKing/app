# Validação técnica — assinatura sonora

> Sem escuta neste ambiente: tudo abaixo é medição. A avaliação auditiva fica para você (de preferência no celular, com e sem fone).

| versão | arquivo | bits | dur_s | lufs | tp_dbtp | amostras_no_teto | trechos_silencio_100ms | corr_LR | mono_vs_estereo_LU | graves_<120Hz_dB | medios_graves_120-400_dB | presenca_1-5k_dB | celular_retém_dB | fator_crista_dB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| final | rackel-sonic-logo-final.wav | 24 | 4.5 | -14.0 | -1.3 | 0 | 4% | 0.942 | -0.16 | -3.8 | -8.7 | -9.3 | -3.1 | 15.2 |
| instrumental | rackel-sonic-logo-instrumental.wav | 24 | 4.5 | -14.0 | -1.3 | 0 | 4% | 0.941 | -0.16 | -3.8 | -8.8 | -9.4 | -3.1 | 15.1 |
| curta | rackel-sonic-logo-short.wav | 24 | 1.75 | -14.0 | -1.3 | 0 | 0% | 0.933 | -0.19 | -3.9 | -10.9 | -11.4 | -2.8 | 15.2 |
| estudo A | estudos/estudo-A-glam-electro.wav | 24 | 4.5 | -14.0 | -1.3 | 0 | 4% | 0.959 | -0.12 | -2.4 | -8.0 | -10.3 | -5.2 | 14.9 |
| estudo B | estudos/estudo-B-pop-signature.wav | 24 | 4.5 | -14.0 | -1.3 | 0 | 4% | 0.945 | -0.15 | -3.8 | -9.0 | -9.2 | -3.1 | 15.1 |
| estudo C | estudos/estudo-C-editorial-chic.wav | 24 | 4.5 | -14.0 | -1.3 | 0 | 4% | 0.938 | -0.16 | -4.3 | -8.4 | -10.8 | -2.7 | 15.1 |

**Leitura das colunas:** `celular_retém_dB` = energia que sobra depois de um filtro de alto-falante de celular (passa-altas 280 Hz, passa-baixas 9 kHz); quanto mais perto de 0, menos se perde. `mono_vs_estereo_LU` perto de 0 = soma mono sem cancelamento. `amostras_no_teto` = amostras em 0 dBFS (saturação digital).

## Melodia e baixo no celular
- Melodia sobre o resto da mixagem, 500 Hz–5 kHz: **+9.5 dB** (com filtro de celular: **+9.6 dB**). Positivo = a melodia é o elemento mais forte da faixa onde o ouvido é mais sensível, por isso continua audível em volume baixo.
- Baixo depois do filtro de celular: **-11.6 dB** em relação ao original — a saturação gera harmônicos (175–440 Hz) que o alto-falante reproduz; os fundamentais (Fá2 87 Hz, Ré♭2 69 Hz, Mi♭2 78 Hz) ficam para fone e caixa de som. No celular, o baixo responde por **-11.1 dB** da energia total que o alto-falante toca (entre -12 e -6 dB = presente sem embolar).

## Notas detectadas no stem de melodia
| t (s) | escrita | detectada | ok |
|---|---|---|---|
| 0.000 | C5 | C5 (72.01) | ✔ |
| 0.125 | F5 | F5 (76.95) | ✔ |
| 0.375 | Eb5 | Eb5 (75.03) | ✔ |
| 2.000 | C5 | C5 (72.01) | ✔ |
| 2.125 | F5 | F5 (76.95) | ✔ |
| 2.375 | Eb5 | Eb5 (75.03) | ✔ |
| 2.750 | Ab5 | Ab5 (79.98) | ✔ |
| 3.000 | F5 | F5 (77.04) | ✔ |
| 3.250 | Eb6 | Eb6 (87.0) | ✔ |
| 3.375 | Ab6 | Ab6 (91.98) | ✔ |
| 3.500 | F6 | F6 (89.01) | ✔ |

## Sincronia com a animação (onsets medidos no arquivo final)
| evento | t | medido | desvio |
|---|---|---|---|
| provocação: Dó5 + clique | 0.000 | -0.004 | -4.3 ms |
| provocação: Fá5 | 0.125 | 0.126 | +0.7 ms |
| batom toca o lábio (Mi♭5 + seda) | 0.375 | 0.376 | +0.7 ms |
| lábio superior | 0.688 | 0.691 | +3.2 ms |
| "mwah" afinado (Dó6) | 1.000 | 0.996 | -4.3 ms |
| batom começa o contorno | 1.250 | 1.251 | +0.7 ms |
| beijo no mapa = motivo nota 1 (Dó5) | 2.000 | 1.996 | -4.3 ms |
| "Enquanto" = Fá5 | 2.125 | 2.126 | +0.7 ms |
| "Isso" = Mi♭5 | 2.375 | 2.376 | +0.7 ms |
| "em" (estalo, melodia respira) | 2.500 | 2.501 | +0.7 ms |
| batom em "Amontada" = Lá♭5 sincopado | 2.750 | 2.746 | -4.3 ms |
| IMPACTO "Amontada" = Fá5 | 3.000 | 2.996 | -4.3 ms |
| reticência 1 = Mi♭6 | 3.250 | 3.251 | +0.7 ms |
| reticência 2 = Lá♭6 | 3.375 | 3.376 | +0.7 ms |
| reticência 3 = Fá6 (fim) | 3.500 | 3.501 | +0.7 ms |
