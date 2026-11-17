# Relatório de qualidade: etapa do PILOTO (v2, voz ElevenLabs)

> **v2 (17/11/2026):** o piloto foi refeito com a narração do ElevenLabs enviada pelo usuário. Ela foi montada sem mudar a velocidade (65,7 s no total) e a linha do tempo foi reencaixada na fala nova. Piloto com **17,2 s**, até "A Terra é quase esférica." Medições da v2: −14,0 LUFS, pico real −1,3 dBTP, yuv420p, AAC 48 kHz. Notas finais: todas 8. Mudanças desta versão: o avião cruza a rota inteira até "caminho mais curto?", a rota ciano é destacada com o rótulo "O CAMINHO MAIS CURTO?" e a esfera se fecha dentro do piloto. A versão Kokoro está em `audio/kokoro/`.
> As medições abaixo são da v1.

## Arquivo: `piloto_10s.mp4`
| Item | Medido |
|---|---|
| Vídeo | H.264 High, 1080×1920, 30 fps, yuv420p (faixa TV, BT.709), CRF 16 |
| Áudio | AAC-LC 256 kb/s, 48 kHz, estéreo |
| Duração | 13,6 s (ver nota) |
| Loudness | **−14,0 LUFS** integrados (ebur128), LRA 2,2 LU |
| Pico real | **−3,1 dBTP** (limite −1); 0 amostras com clipping |

> **Nota de duração:** o briefing pede cerca de 10 s, mas o piloto termina em 13,6 s para fechar a frase "A Terra é redonda." (12,8 s). Cortar antes deixaria a frase pela metade, e o pedido inclui o início da transformação.

## Ciclo de revisão (CLAUDE.md): um quadro por batida
Três rodadas de folha de contato. As versões estão em `remotion/out/folha_batidas.png` e `piloto_folha_de_contato.png`.

| Critério | Rodada 1 | Rodada 2 | Final |
|---|---|---|---|
| Gancho nos 2 primeiros segundos | 5 | 7 | **8**: as cidades estão no quadro 0 e o arco ciano com avião aparece completo em 1,9 s |
| Leitura em tela de celular | 7 | 8 | **8**: título com 128/232 px, legendas com 60 px e contorno, rótulos com 31–36 px |
| Qualidade do movimento | 6 | 8 | **8**: transformação contínua com a rota sempre grande e centrada |
| Variedade (algo novo a cada 2–4 s) | 7 | 8 | **8**: 0 s cidades, 0,5 s rotas, 3,1 s título, 4,4 s arco do título, 5 s desvio, 6,9 s círculos, 8,1 s recuo, 8,8 s transformação |
| Fidelidade à marca | 8 | 8 | **8**: cores da marca, uma fonte de título (Barlow Condensed) e uma de interface (Inter), sem brilho nem molduras |
| Sincronia do som | n/a | n/a | **8**: acertos a ±10 ms da grade medida; sons de entrada gradual começam na batida |

**Problemas corrigidos ao longo das rodadas:**
1. Gancho fraco: o quadro 0 só tinha o mapa.
2. Recuo excessivo da câmera, que deixava a rota pequena.
3. Etapa equirretangular isolada, que achatava os círculos.
4. Título curvo invadindo a primeira linha.
5. Fim do piloto pegando parte da frase seguinte.
6. Grade de batidas medida nos contratempos: corrigida medindo abaixo de 1,5 kHz.
7. Limitador com ganho de compensação: −10,9 LUFS virou −14,0.
8. Legenda quebrada em "avião no / mapa".
9. Vídeo em faixa completa (yuvj420p): convertido para yuv420p padrão.

## Revisão editorial (até aqui)
- **Círculo máximo:** correto. Distância em esfera de R = 6.371 km; SLERP entre vetores unitários.
- **Linha reta no Mercator:** tratada como **loxodromia** (rumo constante), não como "menor caminho". As fontes estão em `fontes_pesquisa.md`.
- **Círculos de Tissot:** são círculos geográficos reais de 500 km de raio. Os fatores exibidos (×1,0 a ×3,2) são sec φ, o fator de escala linear do Mercator.
- **Distâncias em pixels:** nenhuma é usada como distância real.
- **Rota:** não é um voo real. Coordenadas das cidades conforme a Wikipédia.
- **Narração:** texto integral do briefing, velocidade natural (1,0 e 0,97), sem aceleração. Conferida pelo Whisper; a única diferença é de tokenização em "lembre-se".

## Pendências conhecidas
1. **Voz:** narração do ElevenLabs entregue pelo usuário. ⚠ "tempestades" soa como "tentestades" (cena 5). O roteiro difere do briefing (ver `roteiro_final.txt`). O ID e os parâmetros da voz ainda não foram registrados.
2. **Símbolo AV original:** ausente do repositório; necessário para a cena 6.
3. **Fonte da FAA:** inacessível (403). Será substituída por referência oficial antes da cena 5.
4. **Cena 4:** sem frase própria no roteiro (ver storyboard).
5. **Render:** WebGL via SwiftShader (`gl: swangle`), cerca de 3 min para 13,6 s. O episódio completo deve levar cerca de 15 min.
