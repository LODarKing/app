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

## Cenas 02–07 (como foram produzidas)

| t (s) | Narração | Imagem |
|---|---|---|
| 10,5 | "O QR Code funciona…" | A câmera recua do macro; a trilha de bits recua até a palavra de código 0 (amarela, no canto inferior direito). |
| 12,75 | "…código secreto digital." | **TEXTO**: a mensagem real é digitada. 13,25: "não é criptografia: qualquer leitor lê". |
| 14,25 | "Seus quadradinhos…" | **DADOS CODIFICADOS**: 44 bits reais (modo `0100`, comprimento 51, "O", "l", "á") viram células; nota "ilustração: no código os bits são intercalados". |
| 16,25 | "…formam padrões…" | Os 8 primeiros bits voam até a palavra 0 e, ao pousar, assumem a cor real do módulo: **+ MÁSCARA → MÓDULOS**. |
| 17,25 | "…representam informações," | Onda ciano por todos os módulos de dados e correção; rótulo **64 PALAVRAS DE DADOS + 36 DE CORREÇÃO**. |
| 18,25 / 18,75 | "como textos e endereços de sites" | Fichas **Aa TEXTO** e **www SITE**. |
| 20,0 | "E sabe aqueles três quadrados…" | Título **COMO A CÂMERA ENCONTRA O CÓDIGO?**; os localizadores acendem um a um (20,5 / 21,0 / 21,5). |
| 21,75 | "…nos cantos?" | Linha amarela atravessa o localizador com a proporção **1 : 1 : 3 : 1 : 1**. |
| 22,5 | "Eles ajudam a câmera do celular…" | Moldura de celular; o código aparece girado −18°. |
| 24,25 / 25,0 | "…localizar e orientar…" | Miras nos três localizadores + triângulo (LOCALIZADORES 3/3); ORIENTAÇÃO conta de −18° a 0°. |
| 25,75 / 26,25 | "…para fazer a leitura." | **SINCRONISMO** e **ALINHAMENTO** em amarelo; pontos de amostragem no centro de cada módulo. |
| 26,75 | — | **CONTEÚDO IDENTIFICADO**: o texto real do código. |
| 28,5 | "Mas agora vem a parte mais surpreendente…" | Respiro: a interface sai, a música baixa. |
| 29,5 | "Alguns QR Codes…" | Os módulos se reorganizam na mesma mensagem em **nível H**: **33×33 → 41×41 · MAIS MÓDULOS PARA CORREÇÃO**. 31,25: LEITURA OK ✓. |
| 33,25 | "…está danificada." | **Dano A**: 185 módulos arrancados, contorno amarelo. |
| 34,5 | "Isso acontece graças…" | **ERROS POR BLOCO · LIMITE 14**: barras reais (7, 7, 7, 6). |
| 36,25 | "…correção de erros," | Os módulos voltam em ciano; **MENSAGEM RECUPERADA ✓** + texto + "o leitor corrige os dados (imagem ilustrativa)". Clímax musical. |
| 38,75 / 39,5 | "…dentro de certos limites." | **Dano B**: barras passam do limite (21, 19, 18, 16) → **✕ NÃO FOI POSSÍVEL LER**. |
| 41,0 | "E tem mais! Você nem precisa de internet…" | **LER O CÓDIGO ≠ ACESSAR A INTERNET**; à esquerda, o código com SEM INTERNET; 43,0: leitura → TEXTO LIDO ✓. |
| 44,25 / 45,25 | "…se ele contiver um link," | Celular com QR real de `https://example.com`; botão **ABRIR SITE?**. |
| 46,0 / 47,75 | "…precisará de conexão para abrir o site." | Ícone de rede ligado, barra de carregamento, página aparece; **PRECISA DE CONEXÃO**. |
| 48,75 | "Agora eu tenho um desafio para você!" | Título **CONSEGUE DESCOBRIR A MENSAGEM?** |
| 50,25 → 50,75 | "Pause o vídeo…" | O QR da mensagem se monta (localizadores, depois linhas) e fica **estático até 62 s**; **PAUSE E ESCANEIE COM OUTRO CELULAR**. |
| 52,75 / 54,75 | "…descobrir a mensagem secreta. Será que você consegue?" | Ícone de pausa pulsa; sublinhado amarelo. |
| 56,75 / 57,75 | "Além do Visível, o extraordinário está nos detalhes." | Assinatura **ALÉM DO VISÍVEL** / **O EXTRAORDINÁRIO ESTÁ NOS DETALHES.**, abaixo do código. |
