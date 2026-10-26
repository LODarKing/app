# FELINOS_WORK

Série Especialidades dos Desbravadores — episódio **Felinos: uma aventura selvagem!** (Especialidade EN-024, Distrito de Desbravadores de Amontada).
Reels 9:16 · 1080×1920 · 60 fps. Estilo aprovado da v3 de "Educação Inclusiva" (Remotion + SVG), reaproveitando o código de `EDUCACAO_INCLUSIVA_WORK/`.

## Estado atual: piloto (0–10 s) aguardando aprovação

O piloto segue a Cena 01 do roteiro ("O segredo do gatinho"):

| Tempo | Plano |
|---|---|
| 0,0–1,8 s | Tela escura, batimento, dois olhos verdes se abrem com o brilho do *tapetum lucidum*; miado; a luz chega, as pupilas viram fenda e a câmera entra no olho. |
| 1,8–4,4 s | Corte: a câmera se afasta e revela o Pingo na mesa de estudos (Diário da Criação, lupa, caderno, cantil, mochila). Ele inclina a cabeça, faz a piscada lenta (corações + efeito divertido) e se agacha para saltar. |
| 4,4–5,0 s | Salto em câmera lenta na direção da lente; a silhueta cobre a tela e revela a floresta. |
| 5,0–6,0 s | Onça-pintada caminhando na floresta tropical (paralaxe, folhas em primeiro plano). |
| 6,0–7,0 s | Chicote de câmera: tigre no bambuzal asiático. |
| 7,0–8,1 s | Leão sobre a rocha na savana levanta a cabeça e ruge (tremor de câmera). |
| 8,1–10,0 s | O rugido vira impacto: quatro pegadas atravessam a tela, título FELINOS letra a letra, "UMA AVENTURA SELVAGEM!", "Especialidade EN-024", série; a câmera atravessa a pegada e entra na área de estudos. |

- **Narração:** ainda não há áudio do usuário. As legendas dinâmicas usam tempos **provisórios** (`remotion/src/words_all.json`) e serão refeitas pela transcrição da voz original quando ela chegar. Nenhuma voz sintética foi usada.
- **Áudio do piloto:** trilha original e efeitos sintetizados (miado, batimento, vento, floresta, passos, rugido, impacto, pegadas), −14 LUFS, pico −1,3 dBTP: `src/audio/pilot_mix_felinos.py` (`--com-voz` aplica o ducking de −7,5 dB quando a narração entrar).

## Personagens

- **Pingo** (`remotion/src/felinos/Pingo.tsx`): vetor paramétrico (cabeça, orelhas independentes, pálpebras, pupilas que dilatam, boca de miado, cauda listrada, agachar, pose de salto com coxins). Não havia folha de referência do Pingo; se o usuário enviar uma, ela substitui este desenho via `tools/vectorize.py`.
- **Onça-pintada, tigre e leão** (`remotion/src/felinos/BigCat.tsx`): rig em perfil comum (pernas com IK, caminhada em sequência lateral, escápula que rola, mandíbula para o rugido), com proporções, cabeça e pelagem próprias de cada espécie (rosetas com pintas internas; listras finas e irregulares com peito branco; pelagem lisa, juba e tufo na cauda). Pupilas redondas nos grandes felinos, fenda vertical no gato doméstico.
- **Lara e Miguel** não aparecem no piloto. Para o vídeo completo é preciso definir a referência deles (folhas de personagem do usuário).

## Comandos

```sh
cd FELINOS_WORK
python3 src/audio/pilot_mix_felinos.py                 # áudio do piloto
cd remotion && npm install
node stills.mjs Piloto out/folha.png 0.5 2.6 5.4 9.4   # quadros de conferência
npx remotion render src/index.ts Piloto out/piloto_raw.mp4 --codec=h264 --crf=16 --concurrency=4
```

Os tempos de todos os eventos ficam em `remotion/src/felinos/timing.json`, lido tanto pela animação quanto pela mixagem.
