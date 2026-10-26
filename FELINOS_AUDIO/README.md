# Vozes do episódio FELINOS — restauração e edição

Gravações originais: 50 tomadas de celular (narrador Italo Marinho; Lara, voz de Isabella Meneses; Miguel, voz de Abner Araújo).
Elas ficam fora do git (`originais_wav/`). No repositório entram só as falas prontas, em `falas/*.flac` (48 kHz, mono, 24 bits).

## Como roda
```
python3 transcrever.py          # transcrição com tempo de cada palavra (faster-whisper medium)  -> documentacao/transcricao_originais.json
python3 diagnostico.py          # picos, ruído de fundo, volume de cada gravação                 -> documentacao/diagnostico_originais.json
python3 restaurar.py [nomes]    # restauração + cortes                                            -> falas/*.flac, documentacao/edicao.json
python3 verificar.py [nomes]    # transcreve de novo as falas prontas e confere cada palavra       -> documentacao/transcricao_editada.json
```

## Cadeia de restauração ("som de estúdio")
1. **Picos estourados reconstruídos.** A maioria das tomadas chegou a +1,6 a +3,4 dBFS, ou seja, estourada. As amostras acima de 0,9 são refeitas por interpolação autorregressiva (32 coeficientes, 400 amostras de contexto).
2. **Redução de ruído por rede neural.** Usa o DeepFilterNet 3 em 48 kHz, com atenuação limitada a 30 dB para a voz não ficar "embaixo d'água".
3. **Limpeza de frequências.** Passa-altas em 80 Hz, de 4ª ordem. Controle de plosivas ("p" e "b" estourados) pela razão entre graves e médios.
4. **EQ corretiva.** Corpo a +1 dB em 120 Hz, tira o som de caixa (-2,5 dB em 350 Hz), presença a +2 dB em 3,5 kHz e ar a +1,5 dB acima de 10 kHz.
5. **De-esser e compressão.** De-esser em banda dividida (4,8 a 9,5 kHz) e compressão 3:1 com limiar relativo à fala.
6. **Respirações removidas.** Um trecho conta como respiração quando reúne quatro condições:
   - não tem voz, ou seja, não é periódico;
   - dura de 150 ms a 1 s;
   - fica 18 dB abaixo da fala;
   - tem espectro de sopro, com centroide entre 1,2 e 4,2 kHz.
   
   O "s" no fim das palavras fica acima de 4,2 kHz e é preservado.
7. **Pausas encurtadas.** O tamanho de cada pausa segue a pontuação:
   - 0,42 s depois de ponto ou interrogação;
   - 0,26 s depois de vírgula;
   - 0,13 s nos outros casos.
   
   Os cortes caem só no silêncio, com transição de 15 ms.
8. **Volume.** Cada fala fica em -18 LUFS, com pico real até -1,5 dBTP. A mixagem final do vídeo fica em -14 LUFS.

As gravações com Lara e Miguel juntos são separadas por personagem no silêncio entre as frases. Elas viram `Miguel_Felinos_D0n` e `Lara_Felinos_D0n`.

## Conferência
- Resultado: 474 s gravados viraram 435 s, com 69 respirações removidas.
- A nova transcrição das 53 falas prontas não perdeu nenhuma palavra. As diferenças apontadas pelo `verificar.py` são só de grafia do reconhecedor: "4" por "quatro", "MineCon" por "Maine Coon" e "pulma" por "puma".
- `documentacao/comparacoes/` traz:
  - `antes_e_depois_piloto.mp3`, com o original e a versão pronta, no mesmo volume;
  - os espectrogramas das falas usadas no piloto.
