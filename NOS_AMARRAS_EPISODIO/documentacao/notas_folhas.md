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

## Episódio completo — folhas por cena (`node render.mjs --sheet out/folha_sNN.png sNN`)

### Problemas encontrados e corrigidos
| Cena | Problema | Correção |
|---|---|---|
| s2 | A torcida e a trança apareciam devagar demais e a trança tinha voltas demais. Os cartões de fibra estouravam a borda. | Revelação mais rápida, 2,3 voltas e cartões redimensionados. |
| s3 | A morfose da corda reta para o seio criava um cruzamento passageiro (corda atravessando corda). | Troca: a ponta recolhe a corda reta e volta guiando o seio. Nada atravessa nada. |
| s3 | O selo "fixa" aparecia em "ponta fixa" (palavra errada). | Âncora na 2ª ocorrência. |
| s3 | Volta do fiel pequena demais para ler. | Escala 1,55 e mastro mais grosso. |
| s3 | A alça de azelha saía estreita. | Laço redondo no prolongamento da perna do seio. |
| s7 | O título ficava atrás dos mastros, a volta do fiel longe da travessa e a ponta passava por trás da travessa. | Título por cima, volta do fiel logo abaixo da travessa e a ponta passando por cima dela. |
| s8 | O cordão de cima cobria a referência bíblica. | Referência e citação foram para baixo do cordão. |
| todas | Legendas de 3 linhas. | Blocos de até 54 caracteres, com quebras forçadas nas frases longas. |

### Notas finais (autoavaliação)
| Critério | Nota |
|---|---|
| Gancho nos 2 primeiros segundos | 8 |
| Leitura em tela de celular | 8 — legenda de 54 px em até 2 linhas, nomes dos termos em 64 px. Alguns textos de apoio têm 30–32 px. |
| Qualidade do movimento | 8 |
| Variedade | 8 — algo novo a cada 2–4 s; o maior trecho parado é na s2, com ~3,6 s, enquanto os fios se abrem. |
| Fidelidade à marca | 8 — paleta da insígnia (verde e branco-prata) com destaque amarelo, Zilla Slab e Inter, insígnia oficial no fim. |
| Sincronia do som | 8 — tudo ancorado nas palavras da narração; 71 efeitos na semicolcheia medida (desvio máximo de 74 ms); voz 17 dB acima da trilha. |
