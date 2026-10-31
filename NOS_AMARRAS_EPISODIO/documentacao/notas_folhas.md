# Ciclo de notas — folhas de contato (um quadro por batida medida)

## Piloto (10 s, 100 bpm, 17 batidas) — `node render.mjs --sheet out/folha_piloto.png`

### Rodada 1 — problemas encontrados
| Critério | Nota | Problema |
|---|---|---|
| Gancho (0–2 s) | 5 | Quadro 0 vazio; corda fina e distante. |
| Leitura no celular | 5 | No mergulho, as letras gigantes do título invadiam o quadro, e "3 CORDÕES" ficou acima da margem de 120 px. |
| Movimento | 6 | A ponta da corda chegava a um cruzamento antes de ele ser resolvido. Havia um meio-disco escuro na ponta (junção arredondada de segmento nulo). |
| Variedade | 7 | — |
| Fidelidade à marca | 6 | As cores dos cordões viravam preto (`shade()` não lia cor em `rgb()`). |
| Sincronia do som | — | Ainda sem som. |

**Correções:**
- Câmera começa perto da ponta e recua enquanto o nó se forma.
- Corda termina numa curva abaixo do título, e o mergulho acontece numa área livre.
- O cruzamento é resolvido quando a cabeça se aproxima.
- Leitura de cor `rgb()` corrigida.
- Rótulos reposicionados dentro das margens.

### Rodada 2
| Critério | Nota | Observação |
|---|---|---|
| Gancho | 7 | Quadro 0 ainda simples. |
| Leitura | 7 | Faixa da corda de cima cortada no topo durante o mergulho (parecia moldura). |
| Movimento | 7 | O trecho final da corda saía levemente curvo, e no zoom de 7× não casava com os cordões retos. |
| Variedade | 8 | — |
| Marca | 8 | — |
| Som | 8 | Acertos na semicolcheia medida, desvio máximo de 50 ms. |

**Correções:**
- Cabeça já entra curvando no quadro 0.
- A linha de "AMARRAS" foi afastada da janela do mergulho.
- O trecho final ganhou pontos colineares.
- A nota '"3 fios" = 3 cordões' agora sobe junto com o rótulo.
- FIBRAS ficou sem seta, porque fibra não é torcida.

### Rodada 3 (versão entregue)
| Critério | Nota |
|---|---|
| Gancho nos 2 primeiros segundos | 8 — corda já em movimento e curvando no quadro 0; o nó oito está formado em 1,8 s. |
| Leitura em tela de celular | 8 — legenda de 54 px, rótulos de 62 px, nota de 42 px, tudo dentro das margens. |
| Qualidade do movimento | 8 — revelação pela ponta, sem corda atravessando corda; zoom contínuo; formas paradas antes de nomear. |
| Variedade | 8 — nó → título → mergulho → camadas. |
| Fidelidade à marca | 8 — marinho, creme e amarelo; cordões em petróleo, amarelo e coral fixos; Zilla Slab e Inter. |
| Sincronia do som | 8 — 12 acertos na grade medida (100,00 bpm, resíduo 0 ms). |

**Conferências do vídeo:**
- Sem quadros pretos (`blackdetect`).
- Congelamentos só nas pausas de leitura previstas: título de 3,9 a 4,8 s e camadas de 8,7 a 10 s.
- −14,0 LUFS, pico −2,2 dBTP.
