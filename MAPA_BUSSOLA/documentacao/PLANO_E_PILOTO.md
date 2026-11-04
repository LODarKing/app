# Mapa e Bússola (AR-021): plano do episódio e relatório do piloto

## 1. Fonte do conteúdo (MDA Wiki, conferido em 04/11/2026)
Área: Atividades Recreativas. Código: AR-021. Nível: 1. Ano: 1956. Origem: Associação Geral.

| # | Requisito oficial | Cena(s) |
|---|---|---|
| 1 | Quais são os 8 pontos cardeais? | 2 (cardeais + colaterais, com a mesma ressalva de nomenclatura do roteiro) |
| 2 | O que é um mapa topográfico e quais são as suas principais utilidades? | 3 |
| 3 | Como as distâncias são definidas? | 4 |
| 4 | O que é um mapa ortofoto? | 5 |
| 5a | O que é azimute | 6 |
| 5b | O que é desvio e como corrigir isto? | 7 |
| 6 | Saber chegar ao Norte, Sul, Leste e Oeste na bússola | 8 |
| 7 | Seguir uma pista com mapa e bússola com pelo menos 10 pontos de controle | 9 (só simulação; a prática fica para o clube) |

## 2. Linguagem visual
- Cartografia editorial em 2,5D, toda procedural (canvas 2D, vetorial). Um único terreno fictício serve de floresta vista de cima e de mapa topográfico. Assim, as passagens floresta → mapa são cortes de correspondência, e o relevo, a escala e o percurso de 10 pontos usam a mesma geografia em todas as cenas.
- Copas das árvores (`js/copas.js`): sprites ilustrados criados uma vez com semente fixa. São três tipos: folhosa (7 a 12 tufos com contorno lobado, três tons de luz vinda de cima à esquerda, textura de folhas e sombra interna), palmeira (folhas radiais com folíolos) e araucária emergente (galhos em verticilo com tufos de agulhas). Há quatro famílias de verde e 34 variantes. As copas do primeiro plano do mergulho usam versões em alta resolução, com mais textura. Cada árvore projeta a sombra da própria silhueta.
- Paleta: verde-floresta `#173022` a `#56875A`, areia `#E9DFC6`, amarelo `#F2C230` (único destaque), branco e preto.
- Tipografia: **Barlow Condensed ExtraBold** nos títulos e palavras-chave; **Inter** na interface e nas legendas. As duas fontes têm licença OFL e estão em `fonts/`.
- Palavras-chave usam um marca-texto amarelo que corre por trás do texto preto. Nada entra com fade. Não há título centralizado sobre gradiente, etiquetas nos cantos, glow ou explosão de partículas.
- Área segura do Instagram: legendas centradas em x = 500 (fora da coluna de botões) e com linha de base em y = 1440 (acima da área da legenda do post).

## 3. Storyboard (tempos de referência; o tempo real virá da narração)
| Cena | Tempo | Quadros-chave |
|---|---|---|
| 1 Hook | 0–13 s | Mergulho de drone entre copas → marcador "VOCÊ ESTÁ AQUI" → celular perde rede, GPS e mapa → trilha bifurca em 3 caminhos com "?" → a floresta vira mapa topográfico a partir do marcador → bússola entra e a agulha assenta. **(piloto)** |
| 2 Rosa dos ventos | 13–30 s | A bússola sai de cena e o limbo se abre numa rosa grande. Entram 4 cardeais (N, L, S, O) e depois 4 colaterais (NE, SE, SO, NO), cada um na posição geográfica exata. O traço amarelo gira no sentido horário. |
| 3 Topografia | 30–49 s | As curvas do mapa sobem em camadas 2,5D até formar o relevo. Comparação lado a lado de curvas próximas (íngreme) e afastadas (suave), com perfil de corte. Montanha, vale e rota segura pelo vale. |
| 4 Escala | 49–66 s | Régua sobre o mapa: barra 1:25.000; 1 cm = 250 m; 4 cm = 1.000 m. A linha reta (distância no mapa) é comparada com a trilha sinuosa (percurso), mostrando as duas medidas. |
| 5 Ortofoto | 66–80 s | Foto aérea oblíqua procedural (estrada, rio, casas em perspectiva) "deita" e se corrige até virar ortofoto. A grade do mapa encaixa e a régua mede a mesma distância nos dois. |
| 6 Azimute | 80–99 s | Círculo de 360° com N 0/360, L 90, S 180 e O 270. Um arco amarelo sempre no sentido horário a partir do Norte para em 60°, entre N e L. |
| 7 Desvio e correção | 99–119 s | Dois eixos: Norte verdadeiro (NV) e Norte magnético (NM). O ângulo δ é genérico, sem valor local. Regra mostrada: Rv = Rm + δ (δ a Leste é positivo e a Oeste, negativo). Texto: "consulte a declinação do local e da data na carta ou no modelo geomagnético". |
| 8 Uso da bússola | 119–137 s | Bússola horizontal, com aviso de metais. O limbo fica em 0° e a pessoa gira o corpo até a agulha (ponta Norte amarela) entrar na seta de orientação. A **seta de direção de marcha** (impressa na placa) é rotulada à parte. Depois aparecem N, L, S e O. |
| 9 Simulação | 137–162 s | Percurso fictício com 10 pontos ligados em ordem. Três exemplos ampliados mostram leitura do mapa, azimute em graus e distância em metros. Cada ponto ganha um ✓ de "simulado". Selo fixo: "Simulação. A prática é com seu clube." |
| 10 Encerramento | 162–175 s | Rota completa no mapa, título "Mapa e Bússola · AR-021" e crédito "Narração: Ítalo Marinho". Emblema **só** com arquivo oficial enviado pela produção. |

Pela contagem de palavras do roteiro (cerca de 380), a narração deve ficar entre 150 e 165 s, abaixo do limite de 180 s. Não há conteúdo cortado.

## 4. Lista de assets
| Asset | Origem | Situação |
|---|---|---|
| Terreno, floresta, trilhas, curvas de nível | procedural (`js/mundo.js`, semente fixa) | pronto |
| Bússola de placa base (placa, régua, seta de marcha, limbo, seta de orientação, agulha) | vetor (`js/bussola.js`) | pronta |
| Celular / interface de GPS genérica | vetor (`js/cena01.js`) | pronto |
| Rosa dos ventos, círculo de azimute, eixos NV/NM, régua de escala, ortofoto procedural, percurso de 10 pontos | vetor/procedural | a fazer após aprovação |
| Fontes Barlow Condensed e Inter | Google Fonts / sistema (OFL) | prontas |
| Trilha e efeitos | sintetizados em código (`audio/trilha.py`), sem amostras de terceiros | piloto pronto |
| **Narração de Ítalo Marinho** | enviada pela produção | **aguardando** |
| **Emblema oficial AR-021** | arquivo oficial da produção | **aguardando (sem ele, o encerramento não terá emblema)** |

## 5. Piloto (10 s): o que foi entregue
- Arquivos: `entregas/MAPA_BUSSOLA_PILOTO_10s.mp4` e a folha de contato `entregas/PILOTO_folha_de_contato.png`.
- Formato: 1080×1920, 30 fps, H.264 High yuv420p CRF 16 e AAC 48 kHz. Loudness medido no MP4: −14,1 LUFS, pico real −1,8 dBTP.
- **Sem voz:** a narração chega depois do piloto. As legendas seguem uma **guia de tempo provisória** (`timeline.js`). No vídeo completo, cada palavra virá do alinhamento do áudio real, e os acertos visuais serão reposicionados na fala.
- Batidas: a trilha foi sintetizada a 96 BPM, e a grade foi **medida** na própria música (fluxo espectral + autocorrelação), dando 96,03 BPM com desvio máximo de 3,6 ms (`audio/beats.json`). Todos os acertos visuais e de efeito caem nessas batidas.

### Ciclo de notas (folha de contato, uma imagem por batida)
| Critério | v1 | v2 | v3 (entregue) |
|---|---|---|---|
| Gancho nos 2 primeiros s | 6 | 8 | 8 |
| Leitura em tela de celular | 7 | 8 | 8 |
| Qualidade do movimento | 7 | 8 | 8 |
| Variedade | 8 | 8 | 8 |
| Fidelidade à marca/paleta | 7 | 8 | 8 |
| Sincronia do som | 8 | 8 | 8 |

Correções entre as versões:
- v1 → v2: o quadro 0 deixou de ser só um close das copas e ganhou um mergulho de drone com abertura sobre o marcador; a chamada "VOCÊ ESTÁ AQUI" saiu de baixo dos botões do Instagram; "BÚSSOLA" se afastou da legenda; a primeira legenda entra no quadro 0.
- v3 → v4 (pedido do usuário): as copas deixaram de ser círculos e passaram a ser copas ilustradas e detalhadas; a faixa livre ao longo das trilhas foi alargada para que continuem legíveis.
- v2 → v3: "MAPA" e "BÚSSOLA" passaram a entrar junto com as palavras faladas; o pico real ficou abaixo de −1 dBTP depois do AAC.

## 6. Precisão técnica (registrada para as próximas cenas)
- Azimute: medido a partir do Norte, sempre no sentido horário (N 0°, L 90°, S 180°, O 270°).
- Declinação: Rv = Rm + δ, com δ positivo a Leste e negativo a Oeste. Nenhum valor local é inventado; o vídeo manda consultar a carta ou um modelo geomagnético (por exemplo, o calculador da NOAA/WMM) para o local e a data.
- Escala 1:25.000: 1 cm = 25.000 cm = 250 m; 4 cm = 1.000 m.
- Bússola: a agulha magnética (ponta Norte amarela) é sempre distinta da seta de direção de marcha (impressa na placa) e da seta de orientação (dentro do limbo).
- Prática: a cena 9 é rotulada como simulação e o texto não diz que a especialidade foi cumprida.

## 7. Como renderizar
```
cd MAPA_BUSSOLA
python3 audio/trilha.py                  # trilha + efeitos + batidas medidas + mix -14 LUFS
node render.mjs --sheet out/folha.png    # folha de contato (um quadro por batida)
node render.mjs --video entregas/MAPA_BUSSOLA_PILOTO_10s.mp4
```
