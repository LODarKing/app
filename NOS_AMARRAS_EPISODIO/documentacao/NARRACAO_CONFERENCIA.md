# Conferência da narração recebida (03/11/2026)

**Arquivo recebido:** `N_S_E_AMARRAS.rar`, com 9 gravações (`Cena01` … `Cena09`, AAC 48 kHz). A ordem está clara pelos nomes. A "Cena 08" tem um espaço a mais no nome.

**Transcrição:** feita com faster-whisper medium, com o tempo de cada palavra, em `narracao/transcricao_originais.json`. O texto gravado segue o roteiro, com as diferenças abaixo.

## Duração

| Cena | Arquivo | Fala (1ª a última palavra) | Ritmo | Orçamento do roteiro |
|---|---|---|---|---|
| 1 | 12,6 s | 11,4 s | 2,46 pal/s | 7 s |
| 2 | 30,1 s | 28,7 s | 1,92 | 20 s |
| 3 | 61,2 s | 58,9 s | 1,83 | 47 s |
| 4 | 43,3 s | 42,3 s | 1,58 | 28 s |
| 5 | 18,7 s | 17,3 s | 2,03 | 14 s |
| 6 | 25,3 s | 22,6 s | 1,82 | 19 s |
| 7 | 18,6 s | 17,1 s | 2,39 | 17 s |
| 8 | 17,6 s | 15,4 s | 2,01 | 13 s |
| 9 | 19,3 s | 18,0 s | 2,17 | 17 s |
| **Total** | **246,7 s** | **231,7 s** | **1,92** | **182 s** |

- **A fala sozinha passa 51,7 s do limite de 180 s**, e ainda faltam as pausas para ver as formas, a abertura e o encerramento.
- As pausas internas já são curtas: encurtando todas as maiores que 0,5 s, a fala chegaria a 228 s. **Não há como caber sem regravar ou cortar texto.**
- Não acelerei nem cortei nada, como você pediu.

## Diferenças em relação ao roteiro

- **Cena 1:** frase nova — "Eu me chamo Ítalo, Distrital de Amontada, e sejam muito bem-vindos à especialidade de Nós e Amarras." Ela ocupa 6,4 s.
- **Cena 8:** gravado "não se **arrebenta**". A ARA diz "não se **rebenta** com facilidade". Como a citação aparece literal na tela, a voz deveria dizer igual.
- **Cena 7:** "começar **uma** amarra" (o reconhecedor ouviu "um amarras"). Está certo.
- **Cena 6:** confirmado na escuta automática: "desgaste" e "como o fabricante orienta".

## Qualidade técnica (tratamento leve, sem mudar a voz)

- Picos em 0 dBFS, com 2 a 36 amostras estouradas por arquivo: dá para recuperar por interpolação.
- **Pedido para a próxima gravação:** volume do microfone um pouco mais baixo.
- Ruído de fundo entre −45 e −49 dBFS: bom. Uma redução leve resolve.
- Volume de −18 a −23 LUFS: vou igualar todas em −18 LUFS, e o vídeo final fica em −14.

## O que pode ficar sem regravar

- **Cena 1, primeira frase:** "Antes de aprender um nó, você precisa entender a corda." (4,8 s). A frase de apresentação vira crédito na tela: "Narração: Ítalo — Distrital de Amontada". **Precisa da sua autorização.**
- **Cena 2, sem a frase "Cada torção gira ao contrário da anterior, e isso trava tudo."**, que vira texto na tela junto com as setas de giro. Fica com cerca de 23 s. **Precisa da sua autorização.**

## O que precisa ser regravado

Cenas 3 a 9, com o roteiro enxuto em `ROTEIRO_NARRACAO_v2.md`: 297 palavras.

| Ritmo | Cenas 3 a 9 | Total com as cenas 1 e 2 aproveitadas | Cabe em 180 s? |
|---|---|---|---|
| ~2,2 palavras/s (o ritmo das suas cenas 1 e 7) | ~135 s | ~163 s | Sim, com ~15 s para pausas visuais e encerramento. |
| Ritmo atual (1,92 pal/s) | ~155 s | ~183 s | Não. |
