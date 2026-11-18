# Storyboard — EP. 05 "A mensagem escondida nos quadrados"

Fio condutor: uma câmera que nunca corta. Ela parte do código inteiro, entra nos módulos, descobre a estrutura e volta para o código inteiro do desafio.
Os tempos vêm da narração gerada (`audio/frases.json`). Os eventos visuais caem na grade de colcheias de 120 BPM, a no máximo 0,25 s da palavra que ilustram.

## Cena 01 — O mistério (0–10,3 s) · **PILOTO RENDERIZADO** (narração do usuário)

| t (s) | Narração | Imagem | Som |
|---|---|---|---|
| 0,00 | "Você já parou para pensar…" | O QR real (versão 4-M, "Olá! Esta mensagem estava escondida nos quadrados.") já está na tela, inclinado em 3D. Uma mola o deixa chapado e uma linha ciano varre a matriz, deixando a grade de módulos à mostra. | varredura + impacto grave |
| 2,25 | "…esses pequenos quadradinhos…" | Uma onda diagonal atravessa o código: cada módulo encolhe e volta e fica ciano por um instante (são peças separadas). | tiques subindo de altura |
| 3,25 | "…guardar tanta informação?" | O título monta em degraus: ALÉM DO VISÍVEL · EP. 05 / COMO ISSO GUARDA / **INFORMAÇÕES?** | clique duplo; chimbal entra |
| 4,75 | "Parece apenas um desenho sem sentido, não é?" | Os módulos se embaralham e continuam à deriva. **Os três localizadores não se mexem**: pista para a cena 3. | blips de dados embaralhados |
| 7,25 | "Mas existe…" | A ordem volta com mola e o título se desmonta em degraus (~4 s na tela). | travamento; arpejo entra |
| 8,00 | "…uma tecnologia incrível…" | Nova leitura ciano. | pulso de leitura |
| 8,75 | "…escondida aqui!" | Mergulho macro até o canto inferior direito. | descida + grave |
| 9,25 | — | **Ordem real dos bits**: os módulos acendem na sequência de posicionamento da norma (zigue-zague), uma palavra de código por semicolcheia, com o contador "PALAVRA nn/100". | um tique por palavra |

## Cenas seguintes (planejadas sobre a narração do usuário, aguardando aprovação do piloto)

- **02 · Os dados escondidos (10,4–19,6 s).** A câmera recua pela trilha de bits. "Código secreto digital": a mensagem vira bytes reais (modo byte, indicador de modo e comprimento tirados de `qrcode.create`) e a tira **TEXTO → DADOS CODIFICADOS → QR CODE** se monta, com selo de representação didática onde a máscara e a correção são simplificadas. Em "textos e endereços de sites" entram as fichas **Aa TEXTO** e **www SITE**.
- **03 · Os três quadrados (20,0–27,1 s).** "Três quadrados maiores nos cantos?": os localizadores acendem em ciano, um de cada vez. "Localizar e orientar": a interface de câmera vetorial traça as linhas entre eles e corrige o giro do código. "Fazer a leitura": sincronismo e alinhamento aparecem por um instante e a decodificação mostra **CONTEÚDO IDENTIFICADO** com o texto real.
- **05 · A correção de erros (27,1–40,2 s, o clímax).** "Parte mais surpreendente…": silêncio curto e mergulho. "Danificada": módulos arrancados de um código de demonstração (nível documentado). "Correção de erros": o decodificador real recupera o texto (testado antes do render) e os módulos se reconstroem. "Dentro de certos limites": um dano maior **falha de verdade** e aparece **NÃO FOI POSSÍVEL LER**.
- **06 · Internet ou não? (40,4–48,1 s).** Tela dividida: leitura no aparelho com o ícone de rede cortado e, ao lado, o site que só carrega com conexão. **LER O CÓDIGO ≠ ACESSAR A INTERNET**.
- **07 · O desafio (48,6–60 s + respiro).** O QR da mensagem secreta (versão 5-M) aparece escuro sobre claro, com 4 módulos de silêncio, estático e inteiro de ~50,4 s até o fim (≥ 10 s). CONSEGUE DESCOBRIR A MENSAGEM? / PAUSE E ESCANEIE COM OUTRO CELULAR. A assinatura fica fora do código. Duração total estimada: ~62 s.
