# Piloto v4 — FELINOS, cena 02 "O Diário da Criação" (21,5 s, 9:16, 60 fps)

Mostra o narrador, a Lara, o Miguel e o Pingo com as vozes gravadas e restauradas (`../FELINOS_AUDIO`), no estilo aprovado no piloto v3 (`../ESTILO_APROVADO/especialidades.md`).

## Novidades em relação ao v3
- **Felinos mais pintados.** `painterize()` aplica três camadas:
  - textura de pincel presa ao corpo, em luz suave;
  - lavagem de luz e sombra;
  - borda mesclada com o fundo.
  
  As sombras internas ficaram desfocadas, como pintura, e nenhum contorno é desenhado.
- **Cenários mais artísticos.** `cachedPainted()` passa textura de pincel e manchas de cor em todos os fundos.
- **Lara e Miguel.** São bonecos de recorte feitos das folhas de referência (`js/kids.js`). Têm:
  - boca guiada pelo envelope da voz gravada;
  - piscadas, sobrancelhas, olhar, cabeça acompanhando a fala;
  - braços e mãos animáveis.
- **Profundidade de campo.** Quando a câmera chega no livro, as crianças desfocam.
- **Legendas.** Seguem os tempos reais das palavras gravadas, transcritas de novo depois da edição.

## Roteiro do piloto (grade de 120 bpm)
| tempo | o que acontece |
|---|---|
| 0–1,75 | Gancho: o Diário treme com luz escapando, a pata do Pingo pousa (TAP!), a pegada acende, a capa abre e as páginas correm |
| 1,75–5 | Plano médio: ilustrações saem do livro e voam. Miguel: "Ei, Lara, o que está acontecendo com esse livro?" |
| 5–7,5 | Câmera vai para a Lara: "Eu acho que alguém quer nos mostrar alguma coisa." Ela aponta o Pingo |
| 7,5–9 | Miau!, o Pingo mergulha na página (PLOFT!) e a câmera entra na ilustração |
| 9–21,5 | Narrador, por cima de quatro planos: onça, tigre, leão e a família reunida. O Pingo cai na frente e "Família Felidae" é escrito à mão |

## Como roda
```
python3 audio/montar_timeline.py   # timeline.js: eventos + vozes + palavras + envelopes de boca
python3 audio/synth.py             # trilha e efeitos sintetizados, batidas medidas, vozes, mix a -14 LUFS
node render.mjs --sheet out/folha.png      # um quadro por batida
node render.mjs                            # FELINOS_PILOTO_v4.mp4 (H.264 yuv420p, CRF 16)
```

## Rodadas de nota (CLAUDE.md)
| rodada | gancho | celular | movimento | variedade | marca | som | correções |
|---|---|---|---|---|---|---|---|
| 1 | 6 | 8 | 6 | 8 | 8 | 8 | livro parado no 1º quadro e pata em forma de bastão; família de felinos amontoada; mergulho mostrando o tronco do Miguel, com gestos que não se liam |
| 2 | 7 | 8 | 7 | 8 | 8 | 8 | luz escapando do livro desde o 1º quadro; cabeça das crianças acompanha a fala; câmera empurrando no leão |
| 3 | 8 | 8 | 8 | 8 | 8 | 8 | render completo |

**Som:**
- batidas medidas a 120,00 bpm, com resíduo de 6 ms;
- acertos a no máximo 16 ms da grade;
- voz 12 dB acima do fundo durante as falas;
- mixagem final a -14 LUFS.
