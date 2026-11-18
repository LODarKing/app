# Relatório de qualidade — EPISÓDIO COMPLETO (`video_final.mp4`)

## Arquivo (medido no MP4 final)
- 1080×1920 (9:16), H.264 yuv420p, CRF 16, 30 fps, **62,0 s**; AAC 48 kHz estéreo, 256 kb/s; 10,6 MB.
- Áudio: **-14,0 LUFS** integrados, pico real **-4,6 dBTP** (limite -1), LRA 0,7 LU, sem clipping.
- A transcrição da mixagem final (Whisper medium) bate frase a frase com a narração: a voz fica clara sobre a trilha.
- A trilha medida (`beats.json`) dá 120,00 BPM; os 47 eventos sonoros e visuais ficam a no máximo 25,5 ms da colcheia (menos de 1 quadro).

## Revisão técnica e editorial (checklist do briefing, item 15)
| Pergunta | Resposta |
|---|---|
| O QR Code final pode ser decodificado? | ✅ 72/72 leituras no ZXing e 72/72 no OpenCV, quadros do MP4 de 50,8 s ao fim, em 3 escalas |
| A mensagem reconstruída é exatamente a esperada? | ✅ "Você descobriu a mensagem secreta! O extraordinário está nos detalhes." |
| O exemplo de correção de erros funciona? | ✅ Dano A lido pelos dois decodificadores nos quadros do MP4; dano B falha nos dois e o vídeo mostra a falha |
| Os padrões de posicionamento estão corretos? | ✅ Matrizes da node-qrcode; fluxo de dados conferido bit a bit (`validacao_qrcode.md`) |
| As informações técnicas foram verificadas? | ✅ `fontes_pesquisa.md`; números exibidos (64+36 palavras, 33×33→41×41, limite 14 por bloco, erros por bloco) calculados do próprio código |
| O vídeo tem explicação autoral? | ✅ Roteiro visual próprio: bits reais voando para a palavra 0, proporção 1:1:3:1:1, erros por bloco reais |
| As animações ajudam a entender? | ✅ Cada cena ilustra a frase falada; as simplificações são marcadas como ilustração |
| A voz soa natural? | ✅ Narração enviada pelo usuário, só com tratamento leve (sem efeitos de voz) |
| As legendas estão sincronizadas? | ✅ 50 grupos alinhados palavra a palavra; somem quando entra a assinatura (56,5 s) |
| Todos os textos estão corretos? | ✅ Acentuação revisada; textos na tela conferidos com a narração |
| A trilha está equilibrada? | ✅ Revisada após retorno do usuário ("fundo musical um pouco alto"): música -4,3 dB e abaixamento de ~9 dB sob a voz → música 16,3 LU abaixo da voz durante a fala (antes: 10 LU); respiro em 28,25 s, clímax na recuperação (36,25 s), corte na falha (38,75 s) |
| A logo original foi preservada? | ⚠️ Não há logo AV no repositório e ela não foi enviada. O encerramento usa só a assinatura em texto, fora do QR |
| Há imagens ou músicas sem licença? | ✅ Nenhuma: tudo vetorial ou sintetizado em código; fontes Inter (OFL) e JetBrains Mono (OFL); node-qrcode (MIT) |
| A exportação está em 1080×1920? | ✅ |
| O MP4 reproduz corretamente? | ✅ ffprobe sem erros; quadros extraídos ao longo de todo o arquivo |

## Ciclo da folha de contato (1 quadro por batida, 124 quadros)
| Critério | Rodada 1 | Rodada 2 |
|---|---|---|
| Gancho nos 2 primeiros segundos | 8 | 8 |
| Leitura em tela de celular | 6 | 8 |
| Qualidade do movimento | 7 | 8 |
| Variedade | 8 | 8 |
| Fidelidade à marca | 8 | 8 |
| Sincronia do som | 8 | 8 |

Corrigido entre as rodadas:
1. Textos de interface de 20–26 px subiram para 28–40 px, com frases mais curtas.
2. Cena 6 ampliada: código maior, celular maior, legendas internas maiores.
3. Transições: o código girado da cena 3 cabe no celular; o título do desafio entra em 48,75 s (sem quadro vazio); sublinhado afastado do texto.
4. Cena 2: a nota "não é criptografia" não encosta mais no texto de duas linhas.
5. Depois do render: QR final com 18 px exatos por módulo (o OpenCV clássico falhava com 17,78 px).

## Revisão de áudio (retorno do usuário)
- Pedido: fundo musical um pouco alto. Mudança: `MUSICA = 0.55` (era 0,9) e abaixamento sob a voz de ~-7 para ~-9 dB em `ferramentas/trilha.py`; efeitos sonoros inalterados.
- Resultado medido: música 16,3 LU abaixo da voz durante a fala; arquivo final ainda em -14,0 LUFS e -4,6 dBTP. Só o áudio foi trocado (vídeo copiado sem recodificar), então as validações do QR continuam valendo.

## Notas editoriais
- "Código secreto digital" (narração) é uma metáfora. A cena 2 deixa claro na tela: "não é criptografia: qualquer leitor lê".
- "Alguns QR Codes" + correção de erros: todo QR tem correção (níveis L/M/Q/H). O vídeo usa a mesma mensagem em nível H para mostrar mais módulos de correção.
- Transparência: a descrição informa narração gerada com IA. Se a plataforma pedir, marque "conteúdo alterado ou sintético" no upload.

---

# Histórico — PILOTO v2 (10,3 s, narração do usuário)

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
