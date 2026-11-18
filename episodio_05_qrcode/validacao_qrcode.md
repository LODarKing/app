# Validação dos QR Codes

Geração: **node-qrcode 1.5.4** (MIT), `scripts/gerar_qr.mjs`. Leitura independente: **ZXing-C++** (`zxing-cpp`) e **OpenCV** `QRCodeDetector`, duas implementações sem relação com a biblioteca geradora.

## Código da mensagem secreta (cena 7) — `qrcode_mensagem.png` / `qrcode_mensagem.svg`

| Item | Valor |
|---|---|
| Conteúdo | `Você descobriu a mensagem secreta! O extraordinário está nos detalhes.` |
| Modo | byte (UTF-8, 73 bytes) |
| Versão | 5 (37×37 módulos) |
| Correção de erros | **M** (≈15% das palavras de código; o nível que a DENSO WAVE diz ser o mais usado). Mantém a versão baixa, com módulos maiores na tela do celular. |
| Máscara | 3 (escolhida pelo algoritmo, pela menor penalidade) |
| Zona de silêncio | 4 módulos |
| Cores | módulos #090E1A sobre #F5F7FC |
| Leitura ZXing | ✅ texto idêntico, nível M informado pelo decodificador |
| Leitura OpenCV | ✅ texto idêntico |
| Leitura na resolução final do vídeo | ⏳ fica para o render final (cena 7), com quadros extraídos do MP4 |

## Código de abertura (piloto, cenas 1–4)

| Item | Valor |
|---|---|
| Conteúdo | `Olá! Esta mensagem estava escondida nos quadrados.` |
| Versão / EC / máscara | 4 (33×33) / M / 2 |
| Leitura no **MP4 do piloto** | quadros em 0,0 s (ainda inclinado), 3,2 s, 5,5 s e 8,5 s: ✅ ZXing e ✅ OpenCV, texto idêntico. Em 1,2 s (grade de varredura sobreposta): ✅ ZXing, ❌ OpenCV. |

No piloto, as distorções (embaralhamento em 1,5–2,5 s e dano em 9 s) são **ilustração**: não se apresentam como código funcional. A matriz desenhada sai do mesmo `qr_dados.json` gerado pela biblioteca.

## Estruturas preservadas (conferidas em `qr_dados.json`)

Localizadores, separadores, sincronismo, alinhamento, formato e versão são marcados pelo `reservedBit` da própria biblioteca. A ordem dos bits de dados percorre exatamente 807 módulos (v4) e 1079 (v5), o que bate com a norma.
