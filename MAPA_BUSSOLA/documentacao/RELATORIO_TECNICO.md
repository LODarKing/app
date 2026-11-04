# Mapa e Bússola (AR-021): relatório técnico do vídeo completo

## Entregas (`MAPA_BUSSOLA/entregas/`)
| Arquivo | Conteúdo |
|---|---|
| `MAPA_E_BUSSOLA_AR021.mp4` | Vídeo final: 1080×1920, 30 fps, H.264 High yuv420p CRF 16, AAC 48 kHz estéreo |
| `MAPA_E_BUSSOLA_AR021.srt` | Legendas: os mesmos blocos de 2 a 5 palavras da tela, com tempo por palavra |
| `MAPA_BUSSOLA_PILOTO_10s.mp4` | Piloto aprovado (sem voz) |
| projeto editável | A pasta `MAPA_BUSSOLA/` inteira: código das cenas, áudio, timeline e scripts (ver "Como refazer") |

## Duração e sincronia
- A duração total é de 178,65 s (limite de 180 s). Nenhum trecho do roteiro foi cortado e não há pausas artificiais entre as cenas: cada cena dura o mesmo que a sua fala, e o encerramento segura 1,3 s depois da última palavra.
- Os tempos de cena saem da fala real (`timeline.js`, gerado por `audio/montar_timeline.py`):

| Cena | Início | Duração |
|---|---|---|
| 1 Hook | 0,00 | 13,96 |
| 2 Rosa dos ventos | 13,96 | 19,26 |
| 3 Topografia | 33,22 | 18,69 |
| 4 Escala | 51,91 | 19,47 |
| 5 Ortofoto | 71,37 | 15,16 |
| 6 Azimute | 86,53 | 19,65 |
| 7 Declinação | 106,18 | 21,31 |
| 8 Uso da bússola | 127,49 | 15,98 |
| 9 Simulação | 143,47 | 18,89 |
| 10 Encerramento | 162,36 | 16,29 |

- Cada acontecimento visual está preso à palavra que o motiva (por exemplo, "Leste" → o arco vai a 90°). O instante é encaixado na colcheia mais próxima da grade de batidas, a no máximo 0,16 s da palavra. O efeito sonoro de cada acerto sai do mesmo instante: são 146 acertos, listados em `audio/acertos.json`.
- A grade de batidas foi medida na própria trilha: 96,00 BPM, 288 batidas, desvio máximo de 0,5 ms (`audio/beats.json`).

## Verificação final
| Item | Resultado |
|---|---|
| Arquivo | 1080×1920, 30 fps, H.264 High yuv420p e AAC-LC 48 kHz estéreo; 178,63 s; decodifica sem erros |
| Loudness medido no MP4 | −14,1 LUFS integrados, pico real −1,6 dBTP |
| Sincronia das legendas (`audio/verificar.py`) | Detalhes abaixo |

**Sincronia.** A voz, como está na timeline, foi transcrita de novo e comparada com as legendas:
- 374 das 382 palavras casaram.
- Erro médio de 46 ms; 95% das palavras ficam abaixo de 147 ms.
- As 8 palavras sem par são só diferenças de grafia do reconhecedor ("cardiais", "No", etc.). Nenhuma fala foi perdida.

O MP4 final tem 167 MB e não entra no git, que tem limite de 100 MB. Ele é regenerado pelos comandos de "Como refazer".

## Narração (voz original de Ítalo Marinho; nada sintetizado)
- Entrada: 10 gravações, uma por cena, em AAC 48 kHz e 195,7 s ao todo.
- Cadeia de tratamento (`audio/restaurar.py`, adaptada do tratamento aprovado no episódio Felinos):
  1. picos estourados refeitos por interpolação;
  2. ruído e reverberação reduzidos pela rede DeepFilterNet 3, com atenuação limitada a 30 dB para preservar o timbre;
  3. passa-altas em 80 Hz e controle de plosivas;
  4. EQ corretiva;
  5. de-esser e compressão 3:1 moderada;
  6. 25 respirações atenuadas;
  7. pausas encurtadas pela pontuação: 0,30 s depois de ponto, 0,18 s depois de vírgula, 0,08 s nos outros casos.
- Os cortes caem apenas no silêncio, com transição de 15 ms. Nenhuma sílaba é cortada.
- Resultado: 195,7 s viraram 177,3 s de fala.
- Transcrição: faster-whisper "medium", com tempo por palavra. Os tempos das palavras são reprojetados através de cada corte.

### Revisão do texto (legendas)
- **Grafia:** "cardiais" virou "cardeais"; "norte" virou "Norte" quando é ponto cardeal; "Mapa e Bússola" no nome da especialidade; e a pontuação de exclamação e dois-pontos do roteiro foi restaurada.
- **Palavras de baixa confiança do reconhecedor:** seguem o roteiro "Num mapa", "Com seu instrutor", "desenvolver atenção" e "aplique a correção".
- **Palavras faladas com clareza e diferentes do roteiro:** mantidas como foram ditas: "é chamada **de** declinação" e "é **a** sua vez".

**Vale ouvir:** em 2:03 o reconhecedor ouviu "aplica a correção". A legenda usa "aplique", como no roteiro.

## Trilha e efeitos (licença própria)
- Tudo foi sintetizado em código (`audio/sintese.py`, `audio/mix.py`), sem amostras nem músicas de terceiros. Por isso não há restrição de licença.
- Trilha documental de aventura a 96 BPM: pad, ostinato dedilhado, baixo, taiko e shaker. Harmonia e textura mudam por cena, e o cartão final termina em Fá maior.
- Ducking automático: a trilha baixa até 11 dB sob a voz (ataque de 40 ms, soltura de 450 ms).

| Medida | Valor |
|---|---|
| Voz | −16 LUFS |
| Leito musical | cerca de −25 LUFS antes do ducking |
| Efeitos | cerca de −27 LUFS |
| Mix final (ver verificação abaixo) | −14 LUFS integrados, pico real ≤ −1 dBTP |

## Conteúdo técnico (requisitos oficiais do MDA Wiki, todos cobertos)
1. **8 direções:** os 4 cardeais (N, S, L, O) e os 4 colaterais (NE, SE, SO, NO), cada um na posição geográfica exata. Ressalva de nomenclatura: o requisito oficial diz "8 pontos cardeais", mas o vídeo explica, como o roteiro, que são 4 cardeais + 4 colaterais.
2. **Mapa topográfico:** curvas de nível do mesmo terreno se transformam em relevo 2,5D. Um corte A–B com perfil mostra que curvas próximas significam terreno íngreme e curvas afastadas, terreno suave. A cena também mostra montanha, vale e uma rota mais segura contra uma rota direta.
3. **Escala 1:25.000:** 1 cm = 250 m e 4 cm = 1.000 m, com uma régua sobre a grade. A reta A–B tem exatamente 1.000 m (4 cm na régua). O percurso pela trilha mede cerca de 1,5 km, calculado da própria trilha.
4. **Ortofoto:** uma foto oblíqua, com perspectiva e prédios inclinados pelo deslocamento do relevo, é ortorretificada. Depois disso a cena mostra a grade de 100 m, uma coordenada, uma distância medida e os vetores do mapa coincidindo com estrada e rio.
5. **Azimute:** contado a partir do Norte e sempre no sentido horário (N 0°/360°, L 90°, S 180°, O 270°). O exemplo de 60° fica entre N e L.
6. **Declinação (desvio) e correção:** NV e NM aparecem com o ângulo δ, sem valor local. A regra mostrada é Rv = Rm + δ, com δ positivo a Leste e negativo a Oeste. O vídeo orienta a consultar o valor para o local e a data, na margem da carta ou num modelo geomagnético. No desenho, δ está a Oeste, então Rm > Rv, de forma coerente.
7. **Uso da bússola:** horizontal, longe de metais (um canivete desvia a agulha). O corpo gira até a agulha entrar na seta de orientação. Agulha, marca do Norte e seta de direção de marcha são rotuladas separadamente. Em seguida aparecem N, S, L e O, e o rumo planejado de 60° é seguido.
8. **Pista com 10 pontos de controle:** partida e controles de 1 a 10 ligados em ordem. A etapa 1 é ampliada com a leitura do mapa, o rumo de 053° e a distância de 320 m, todos calculados do desenho. Os pontos recebem ✓ com o selo "SIMULAÇÃO". No fim tudo volta a ficar em aberto, com "AGORA É SUA VEZ – pratique em campo com seu clube". O vídeo não afirma em nenhum momento que a prática foi cumprida.

## Visual e legendas
- Motion editorial procedural (canvas 2D, vetorial). Um único terreno fictício serve à floresta, ao mapa, ao relevo, à escala, à simulação e ao encerramento.
- Paleta: verde-floresta, areia, amarelo (único destaque), branco e preto.
- Fontes: Barlow Condensed nos títulos e Inter na interface e nas legendas, ambas com licença OFL.
- **Emblema:** nenhum emblema aparece, porque não há arquivo oficial. O encerramento traz o título, o chip AR-021 e "Narração: Ítalo Marinho".
- **Legendas:** blocos de 2 a 5 palavras que aparecem palavra a palavra, com os termos-chave em amarelo e texto branco com contorno escuro.
- **Área segura:** as legendas ficam centradas em x = 500, com linha de base em y = 1440. Os elementos essenciais ficam entre y = 220 e 1340, fora da coluna de botões.

## Ciclo de notas (CLAUDE.md)
Foi feita uma folha de contato por cena, com um quadro por batida (288 quadros, `out/folha_sNN.png`). Entre as correções:
- a rosa dos ventos começa sem tela vazia;
- rótulos cortados ou fora da área segura foram reposicionados nas cenas 3, 5, 7, 8 e 9;
- a câmera da cena 4 não passa mais da borda do terreno;
- a régua da cena 4 se alinha à reta A–B;
- a pista da cena 9 foi compactada para não invadir as legendas.

| Critério | Nota |
|---|---|
| Gancho | 8 |
| Leitura no celular | 8 |
| Movimento | 8 |
| Variedade | 8 |
| Marca | 8 |
| Sincronia do som | 8 |

## Como refazer
Todos os comandos rodam a partir de `MAPA_BUSSOLA/`.
```
python3 audio/transcrever.py <modelo>        # transcrição das gravações (tempo por palavra)
python3 audio/restaurar.py                   # voz tratada -> audio/voz/MBnn.flac
python3 audio/montar_timeline.py             # timeline.js + SRT
node render.mjs --acertos                    # acertos de som tirados das cenas
python3 audio/mix.py                         # trilha + efeitos + voz + ducking + -14 LUFS -> audio/mix.wav
node render.mjs --sheet out/folha_s03.png s03   # folha de contato de uma cena
node render.mjs --video entregas/MAPA_E_BUSSOLA_AR021.mp4
```
