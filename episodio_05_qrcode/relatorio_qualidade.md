# Relatório de qualidade — PILOTO v2 (10,3 s, narração do usuário)

## Arquivo `piloto_10s.mp4`
- 1080×1920, H.264 yuv420p, CRF 16, 30 fps, 10,30 s; AAC 48 kHz estéreo, 256 kb/s.
- Volume medido **no MP4**: **-14,0 LUFS** integrados, pico real **-4,6 dBTP**. Sem clipping.
- QR de abertura lido direto do MP4 em 0,0 / 1,5 / 3,0 / 4,2 / 8,3 s: ✅ ZXing e ✅ OpenCV, texto idêntico.
- Narração: a do usuário, só com tratamento leve. Transcrita da mixagem final, sai idêntica.
- Grade medida: 120,03 BPM; eventos a ~25 ms da colcheia (menos de 1 quadro).

## Ciclo da folha de contato (v2)
| Critério | Nota | Observação |
|---|---|---|
| Gancho nos 2 s | 8 | código inclinado que se assenta + varredura que revela a grade, já no quadro 0 |
| Leitura em celular | 8 | título acima do código, legenda abaixo, nada cobre os localizadores |
| Qualidade do movimento | 8 | onda nos "quadradinhos", embaralhamento à deriva, mola na volta da ordem |
| Variedade | 8 | evento novo a cada 0,75–2,5 s |
| Fidelidade à marca | 8 | paleta oficial; Inter Display + JetBrains Mono |
| Sincronia do som | 8 | cada evento cai na palavra que ilustra |
Problema corrigido nesta rodada: o título ficava 7 s parado; agora se desmonta na palavra "Mas" (~4 s na tela).

---

## Histórico — piloto v1 (12,3 s, narração IA Kokoro sobre o roteiro do briefing)

## Arquivo `piloto_10s.mp4`
- 1080×1920, H.264 yuv420p, CRF 16, 30 fps, 12,30 s; AAC 48 kHz estéreo, 256 kb/s.
- Volume medido **no MP4**: **-14,0 LUFS** integrados, pico real **-6,7 dBTP** (limite: -1). Sem clipping.
- Por que 12,3 s e não 10 s: a pergunta "Como isso é possível?" termina em 11,4 s. Cortar em 10 s deixaria a frase pela metade, então o piloto termina antes de "O segredo…".

## Ciclo da folha de contato (1 quadro por batida)
| Critério | Rodada 1 | Rodada 2 | O que mudou |
|---|---|---|---|
| Gancho nos 2 s | 7 | 8 | código maior no quadro 0, inclinação 3D + varredura |
| Leitura em celular | 5 | 8 | fichas não encostam na legenda; título numa linha; título só entra depois que o localizador sai de cena |
| Qualidade do movimento | 7 | 8 | dano em módulos inteiros (borda amarela por aresta) no lugar de uma mancha |
| Variedade | 8 | 8 | evento novo a cada 1–2,5 s |
| Fidelidade à marca | 7 | 8 | paleta oficial, Inter Display + JetBrains Mono, rubrica maior |
| Sincronia do som | 8 | 8 | grade medida 120,01 BPM; eventos a ±23 ms da colcheia (`beats.json`) |

Precisão corrigida na rodada 1: as fichas acendiam os primeiros 32 módulos de dados como se fossem "a mensagem", mas esses bits são o indicador de modo e o comprimento. O vínculo foi removido.

## Voz
- A narração por IA local (Kokoro, pm_alex) transcrita de volta pelo Whisper sai **idêntica ao roteiro**, inclusive na mixagem com trilha e efeitos.
- Limitação: o ElevenLabs não pôde ser usado (chave recusada pela API). Veja `configuracao_voz.json`. A naturalidade é boa para um modelo local, mas fica abaixo do ElevenLabs em entonação de surpresa.

## Pendente para o vídeo final
QR final lido na resolução do vídeo, teste real da correção de erros (cena 5), revisão completa, descrição e tags.
