# Validação dos QR Codes — EP. 05

Geração: **node-qrcode 1.5.4** (MIT), `projeto_remotion/scripts/gerar_qr.mjs`.
Leitura independente: **ZXing-C++** (`zxing-cpp`) e **OpenCV** (`QRCodeDetector`; o `QRCodeDetectorAruco` é usado só quando o clássico não acha o código). Nenhum dos dois tem relação com a biblioteca geradora.
Reprodução: `python3 ferramentas/testar_correcao.py` (danos) e `python3 ferramentas/validar_video.py` (quadros do MP4 final, resultado em `validacao_video.json`).

## 1. Conferência estrutural (bit a bit)
Para cada código, o script lê os módulos na ordem de posicionamento da norma (zigue-zague), desfaz a máscara, separa as palavras de código, desfaz a intercalação dos blocos e compara com o esperado: indicador de modo byte `0100` + comprimento em 8 bits + todos os bytes UTF-8 do texto.

| Código | Uso | Versão | Correção | Máscara | Palavras | Blocos (dados) | Fluxo de dados |
|---|---|---|---|---|---|---|---|
| abertura | cenas 1–4 e 6 | 4 (33×33) | M | 2 | 100 | 2 × 32 | ✅ confere |
| demoH | cena 5 | 6 (41×41) | H | 5 | 172 | 4 × 15 (+28 de correção cada) | ✅ confere |
| link | cena 6 | 2 (25×25) | M | 2 | 44 | 1 × 28 | ✅ confere |
| **mensagem** | **cena 7 (desafio)** | **5 (37×37)** | **M** | 3 | 134 | 2 × 43 | ✅ confere |

Os bits mostrados na cena 2 (`0100` · `00110011` = 51 bytes · "O" · "l" · "á") vêm desse fluxo conferido.

## 2. Código da mensagem secreta (`qrcode_mensagem.png` / `.svg`)
- Conteúdo: `Você descobriu a mensagem secreta! O extraordinário está nos detalhes.` (73 bytes UTF-8, modo byte)
- Nível **M** (≈15% das palavras de código), escolhido porque mantém a versão baixa (5), com módulos maiores na tela.
- Zona de silêncio de 4 módulos; módulos #090E1A sobre #F5F7FC; nada sobreposto.
- No vídeo: cartão de 810 px = **45 módulos × 18 px exatos**, alinhado à grade de pixels, de 50,75 s até 62,0 s (**11,25 s estático**).

### Leitura no arquivo final `video_final.mp4`
Quadros de 50,8 s até o último, a cada 0,5 s, em três escalas (tela cheia, 1/2 e 1/3, simulando a câmera de outro aparelho):
- **ZXing: 72/72** · **OpenCV: 72/72**, texto idêntico ao esperado.
- O código fica estático: diferença média de pixel entre 51,3 s e 60,3 s = 0,48 (de 0–255); só o ruído de compressão nas bordas passa de 20.
- Histórico: com 800 px (17,78 px/módulo), o OpenCV clássico falhava na tela cheia. Passar para 18 px exatos resolveu.

## 3. Demonstração da correção de erros (cena 5): teste real
Código demoH: a **mesma mensagem** em nível H (versão 6, 4 blocos de 43 palavras, 28 de correção por bloco → até 14 palavras com erro por bloco quando o leitor não sabe onde está o erro).
Cada dano é desenhado como no vídeo (o buraco mostra o fundo escuro). Os erros por bloco são contados de verdade: um módulo claro coberto pelo buraco vira escuro.

| Dano | Módulos perdidos | Erros por bloco | Teste em imagem | No MP4 final |
|---|---|---|---|---|
| A (buraco interno) | 185 (~11% da área) | [7, 7, 7, 6] | ✅ ZXing e ✅ OpenCV leem | ✅ 34 / 35 / 36 s: os dois leem o texto exato |
| B (A + rasgo grande) | 521 | [21, 19, 18, 16] | ❌ nenhum lê | ❌ 39,6 / 40 s: nenhum lê → o vídeo mostra **NÃO FOI POSSÍVEL LER** |

O dano A foi escolhido entre 8 candidatos testados. Um deles, com só 7 a 9 erros por bloco, **falhou** porque atingiu áreas estruturais. Por isso o vídeo não promete porcentagem de área: fala em "certos limites".
A volta dos módulos na tela é ilustração (o leitor corrige os dados, não a imagem). O vídeo diz isso na tela.

## 4. Outros códigos no vídeo final
- Abertura: lida em 0,0 s (ainda inclinada), 3,0 s e 8,3 s.
- Cena 4: em 27,25 s e 28,0 s, o código na tela é lido como `Olá! Esta mensagem estava escondida nos quadrados.`, exatamente o texto mostrado em CONTEÚDO IDENTIFICADO.
- Cena 6: o código da esquerda dá o mesmo texto; o do celular dá `https://example.com` (domínio reservado para exemplos, RFC 2606).
- Distorções (embaralhamento na cena 1, transições, danos) são ilustração e não se apresentam como código funcional.
