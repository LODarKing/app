# Storyboard — EP. 05 "A mensagem escondida nos quadrados"

Fio condutor: uma câmera que nunca corta. Ela parte do código inteiro, entra nos módulos, descobre a estrutura e volta para o código inteiro do desafio.
Os tempos vêm da narração gerada (`audio/frases.json`). Os eventos visuais caem na grade de colcheias de 120 BPM, a no máximo 0,25 s da palavra que ilustram.

## Cena 01 — O mistério (0–12,3 s) · **PILOTO RENDERIZADO**

| t (s) | Narração | Imagem | Som |
|---|---|---|---|
| 0,00 | "Este quadrado…" | O QR real (versão 4-M, "Olá! Esta mensagem estava escondida nos quadrados.") já está na tela, inclinado em 3D. Uma mola o deixa chapado enquanto uma linha ciano varre a matriz e deixa a grade de módulos à mostra. | varredura + impacto grave |
| 1,50 | "…parece uma bagunça." | Os módulos se embaralham (deslocamento e giro com semente fixa). **Os três localizadores não se mexem**: pista para a cena 3. | blips de dados embaralhados |
| 2,50 | "Mas ele pode guardar…" | A ordem volta com mola e a grade some. | travamento (2 cliques + grave) |
| 3,75 | "…uma mensagem," | Ficha **Aa MENSAGEM** sai de baixo do código. | blip + clique |
| 4,75 | "…um endereço de internet…" | Ficha **www ENDEREÇO**. | blip + clique |
| 6,50 | "…continuar funcionando…" | As fichas recolhem, nova leitura ciano e a câmera se aproxima. | pulso de leitura |
| 9,00 | "…está danificada!" | Módulos inteiros são arrancados um a um; contorno amarelo só na borda do buraco e tremor curto da câmera. | ruído quantizado + grave |
| 10,25 | "Como isso é possível?" | Mergulho macro até o canto inferior direito. | descida + grave |
| 10,75 | — | O título monta em degraus: ALÉM DO VISÍVEL · EP. 05 / COMO ISSO GUARDA / **INFORMAÇÕES?** | clique duplo |
| 11,00 | — | **Ordem real dos bits**: os módulos acendem na sequência de posicionamento da norma (zigue-zague), uma palavra de código (8 módulos) por semicolcheia, com o contador "PALAVRA nn/100". | um tique por palavra |

## Cenas seguintes (planejadas, aguardando aprovação do piloto)

- **02 · Os dados escondidos (12,5–21 s).** A câmera recua pela trilha de bits e cada palavra de código vira um bloco de 8 células. Uma tira mostra **TEXTO → DADOS CODIFICADOS → QR CODE** com os bytes reais da mensagem (modo byte, indicador de modo e comprimento tirados de `qrcode.create`). Um selo "REPRESENTAÇÃO DIDÁTICA" aparece onde a máscara e a correção são simplificadas.
- **03 · Os três quadrados (21–27 s).** O código inteiro volta. Os três localizadores acendem em ciano, um de cada vez. Uma interface de câmera vetorial traça as linhas entre eles e acha a orientação mesmo com o código girado. Depois mostra, por um instante, os padrões de sincronismo e o de alinhamento: os localizadores não fazem a leitura sozinhos.
- **04 · A decodificação (27–37 s).** Um celular estilizado enquadra o código. As palavras de código passam pelo processamento e aparece **CONTEÚDO IDENTIFICADO** com o texto real decodificado. Em "endereço de internet", o celular oferece "Abrir site?".
- **05 · A correção de erros (38–54 s, o clímax).** Um código de demonstração (nível documentado) é danificado. A barra de "capacidade de correção" enche, o decodificador real recupera a mensagem (testado com ZXing e OpenCV antes do render) e os módulos perdidos se reconstroem. Em "existe um limite", um segundo dano maior **falha de verdade** e a tela marca **NÃO FOI POSSÍVEL LER**.
- **06 · Internet ou não? (55–60 s).** Tela dividida: à esquerda, a decodificação com o ícone de rede cortado; à direita, o site carregando só com a conexão. Texto: **LER O CÓDIGO ≠ ACESSAR A INTERNET**.
- **07 · O desafio (61–75 s).** A câmera se afasta da interface. O QR da mensagem secreta (versão 5-M) aparece escuro sobre claro, com 4 módulos de silêncio, estático e inteiro por pelo menos 8 s. Textos: CONSEGUE DESCOBRIR A MENSAGEM? / PAUSE E ESCANEIE COM OUTRO CELULAR. A assinatura fica fora do código.
