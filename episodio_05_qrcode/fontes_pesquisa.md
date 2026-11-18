# Fontes da pesquisa — EP. 05 (QR Code)

Páginas consultadas em 18/11/2026. Todas carregaram.

| Fonte | O que confirma | Onde entra no vídeo |
|---|---|---|
| DENSO WAVE, *About QR Code* — https://www.qrcode.com/en/about/ | Existem 40 versões; a correção de erros permite restaurar os dados de um código sujo ou danificado; leitura em 360°. | Cenas 1 e 5 |
| DENSO WAVE, *Error correction* — https://www.qrcode.com/en/about/error_correction.html | Quatro níveis (L, M, Q, H). A taxa de restauração é dada sobre o **total de palavras de código** (não sobre a área visível). Usa Reed-Solomon, adequado a erros concentrados em rajada. "O nível M (15%) é o mais escolhido." | Cena 5; nível M dos códigos |
| DENSO WAVE, *Standards* — https://www.qrcode.com/en/about/standards.html | L ≈ 7%, M ≈ 15%, Q ≈ 25%, H ≈ 30% das palavras de código; norma ISO/IEC 18004 (jun. 2000); de 21×21 a 177×177 módulos. | Cena 5 e relatório |
| DENSO WAVE, *Version* — https://www.qrcode.com/en/about/version.html | Versões de 1 (21×21) a 40 (177×177), com +4 módulos por lado a cada versão. | Cena 3 |
| DENSO WAVE, *How to use* — https://www.qrcode.com/en/howto/code.html | A zona de silêncio exige margem de 4 módulos em todos os lados. | Cena 7 e arquivos `qrcode_mensagem.*` |
| node-qrcode — https://github.com/soldair/node-qrcode | Licença MIT; `create()` devolve `modules`, `version`, `errorCorrectionLevel`, `maskPattern`, `segments`; nível padrão M; margem padrão 4. "QR Code" é marca registrada da DENSO WAVE. | Geração de todos os códigos |
| YouTube, monetização — https://support.google.com/youtube/answer/1311392 | Vídeo com valor próprio: roteiro, animação, demonstração funcional e indicação de conteúdo sintético quando a plataforma pedir. | Diretrizes e descrição |

## Fatos usados e como foram verificados no próprio código

- **Contagem de módulos de dados + correção.** Versão 4: 100 palavras de código × 8 bits + 7 bits de sobra = 807. Versão 5: 134 × 8 + 7 = 1079. Os dois números batem com o que `scripts/gerar_qr.mjs` contou ao percorrer a matriz real fora das áreas reservadas.
- **Ordem real dos bits.** O zigue-zague em pares de colunas, da direita para a esquerda, pulando a coluna 6 (padrão de sincronismo), segue a ISO/IEC 18004. A contagem acima confirma o percurso: ele cobre exatamente todos os módulos não reservados.
- **"PALAVRA nn/100" no piloto.** Versão 4-M tem 100 palavras de código no total (64 de dados + 36 de correção). O contador mostra as palavras na ordem em que são posicionadas.

## Cuidados do roteiro

- Não diz que cada módulo escuro é um bit 1. Os módulos visíveis já passaram por máscara e incluem padrões de função, formato e correção.
- Não diz que "qualquer QR Code funciona com 30% removido". A cena 5 vai usar um exemplo testado com decodificador real.
- "Ler um QR Code não exige internet" vale para a decodificação, feita no aparelho. Abrir o site decodificado exige conexão.
- O inventor e o ano não aparecem no vídeo: as páginas consultadas não trazem esse dado e ele não foi completado de memória.
