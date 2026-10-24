# Relatório de controle de qualidade

## 1. Teste dos personagens (§15)

`renders/character_tests/character_test.mp4` (10 s, 60 fps, renderizado pelo HyperFrames) mostra personagem parado (respiração e piscar), caminhada com pés plantados (IK, sem deslizar), aceno, expressões (sorriso, surpresa, preocupação, fala), interação entre dois personagens (Lucas cumprimenta Ana), interação com objetos (cartão de instruções, tablet de CAA), propulsão de cadeira de rodas manual (mão presa ao aro durante o impulso e recuperação em arco, roda girando conforme a distância percorrida, sem patinar), bengala longa com toque em dois pontos (ponta no chão a cada passo) e cadeira motorizada com joystick.

Defeitos encontrados nos testes e corrigidos antes das cenas:

| Defeito | Causa | Correção |
|---|---|---|
| Pequenas pontas no contorno dos joelhos | Pontos duplicados nas cápsulas geravam normais degeneradas no contorno deslocado | `dedupe()` antes de triangular e de deslocar o contorno |
| Roda pequena para a escala de um adolescente | Raio de 0,56 | Raio de 0,66 e assento recalibrado |
| Braço "atravessando o peito" em vista 3/4 | Ombro próximo à câmera fixo na lateral do tronco | Trapaça 3/4: o ombro próximo desliza para o centro e o tronco estreita 12% |
| Detalhes do peito parados quando o personagem se vira | Lenço, bolsos e placa fixos | Grupo `chest` desloca com o giro (facing) |

## 2. Controle por cena (§16)

Para cada cena foram feitas folhas de quadros de prévia (`renders/scene_previews/sNN_sheet.png`), uma varredura de 1 fps do filme inteiro (`scan_0/1/2.png`), uma folha das 9 transições a 8 fps (`transitions_sheet.png`) e uma prévia em movimento em baixa resolução (`motion_preview.mp4`, 8 fps). Depois da renderização final, `tools/qc_final.py` gera as folhas `renders/scenes/cena_NN_qc.png` com o primeiro quadro, 25%, 50%, 75%, o último quadro e os dois quadros de transição, além dos clipes individuais `renders/scenes/cena_NN.mp4`.

Problemas encontrados na inspeção e corrigidos:

| Cena | Problema | Correção |
|---|---|---|
| 1 | Personagens pequenos no quadro vertical; degraus baixos demais para parecerem barreira; plano final muito aberto | Zoom 2,0–2,4; varanda a 0,92 com 4 degraus; dois personagens no plano final |
| 1 | Ana cobrindo o apoio de pés de Pedro | Novo espaçamento e profundidade |
| 2 | **Ana atrás da cadeira podia parecer que estava empurrando** (vetado pelo briefing) | Ana passa a caminhar à frente, olhando para Pedro, com as mãos longe da cadeira |
| 2 | Infográfico pequeno; escala sobrescrita no update | Conteúdo ×1,6 com nova distribuição |
| 2 | Tijolos visíveis antes de cair | `outBack(0)` retornava cerca de 2e‑16, maior que 0. Limiar de visibilidade passou a > 0,001 |
| 3 | Bandeira e cartão cortados; foto do grupo cortando quem estava nas pontas | Reenquadramento e grupo mais compacto |
| 4 | Ana e Lucas entravam no plano do bullying; João e a diretora na borda | Cenário mais largo (BX = 6) e novas posições |
| 5 | Quadro vazio por cerca de 1 s (8,6–9,7 s) | Documento fica até a entrada dos ícones |
| 6 | Jesus "ajoelhado" ainda alto demais; um líder fora do quadro | Ajoelhar a uma perna (IK) com descida de 1,08×coxa e túnica que se acomoda; reenquadramento |
| 7 | Banquete sem fundo; corações perdidos no palácio; reverência pouco clara | Palácio replicado no banquete; corações ocultos fora do banquete; **ajoelhar** (2 Sm 9:6) |
| 8 | Bomba d'água incoerente (bica longe da mão de Helen); escritora de pé | Bomba espelhada (bica à esquerda, alavanca à direita, Anne bombeia e soletra); Helen sentada |
| 9 | Ícones sobre a faixa de legendas; teto preto; rótulos sobrepostos | Ícones e mapa reposicionados; sala com 14 de altura; rótulos separados |
| 10 | Atores de outras etapas visíveis no plano de abertura | Visibilidade controlada por etapa |
| 3, 9, 10 | **Braço erguido cobrindo o rosto** (Pedro, Theo) | O sinal de rotação estava trocado para o braço esquerdo/direito da tela. Corrigido e verificado na capa e nos três planos |
| Todas | **Cenas mais escuras durante as transições** | O compositor lia render targets sRGB (decodificados para linear) sem recodificar a saída. Incluído `colorspace_fragment` |

## 3. Respeito e representação (§7)

- A barreira é o objeto destacado em vermelho, não a pessoa (cena 1).
- Ninguém empurra cadeira de rodas: Pedro impulsiona a própria cadeira e Theo usa cadeira motorizada.
- Clara usa a bengala longa branca com técnica coerente. Sem vendas nos olhos e sem óculos escuros estereotipados.
- Rafael usa aparelho auditivo e se comunica por sinalização com bandeiras e legendas. **Não foram criados gestos de Libras**, e o vídeo não afirma ter tradução em Libras.
- Bia (deficiência intelectual) não tem traços caricatos; a acessibilidade aparece como instruções em imagens, e ela conduz a montagem da barraca.
- Theo (deficiência múltipla) participa com CAA (tablet de pictogramas), responde ao quiz e faz a contagem do hasteamento.
- Lia: deficiência oculta, indicada só pelo cordão de girassol (símbolo previsto na Lei 14.624/2023).
- No bullying, os insultos são rabiscos e símbolos, nunca palavras; não há tom de piada; os colegas interrompem e procuram uma adulta responsável.
- Na composição final todos aparecem lado a lado; as duas pessoas em cadeira de rodas ficam na fileira da frente, no centro.
- Bíblia: a cura não é apresentada como condição de dignidade. A narração e o quadro final destacam a atenção à pessoa ("Olhar para as pessoas"). Mefibosete não recebe dispositivo de mobilidade inventado. Jesus não tem auréola e usa figurino do século I.
- Helen Keller: cena da bomba d'água com o alfabeto manual tátil, como relatado em *The Story of My Life*, e formatura em Radcliffe, 1904. O foco está em educação acessível e apoio, não em "superação individual".

## 4. Áudio (§17)

Detalhes em `AUDIO_REPORT.md`. Resumo: master a −14,0 LUFS e −1,3 dBTP; inteligibilidade objetiva do master com 97,9% das palavras idênticas à referência e confiança média de 0,980. A voz foi reequalizada depois de medir que a primeira cadeia clareava 3–6 kHz em cerca de +5 dB; o tempo das palavras ficou idêntico, com desvio de 0,0 s nas fronteiras de cena. **Limitação:** a avaliação foi objetiva; não houve escuta humana.

## 5. Arquivo final

Veja `QC_FINAL.json`, gerado por `tools/qc_final.py` a partir dos MP4 entregues: resolução, fps, codec, duração, bitrate, loudness e pico verdadeiro da faixa AAC, detecção de quadros pretos e de congelamentos, e deslocamento áudio/vídeo medido por correlação com o `master.wav`.
