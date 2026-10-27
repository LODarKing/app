# Felinos — Piloto v2 (motor próprio em canvas)

Segundo piloto da abertura de **Felinos: uma aventura selvagem!** (Especialidade EN-024), refeito do zero depois que o primeiro (Remotion + SVG chapado) não foi aprovado.
Não usa Remotion, HyperFrames nem a skill da série: é um motor de animação escrito para este vídeo.

## Como funciona

- `piloto.html` carrega o motor e desenha cada quadro num canvas 1080×1920 em função do tempo `t`, de forma determinística.
- `js/lib.js` é a base: ruído procedural, curvas suaves, IK, camadas, **pelo nas bordas**, **luz de contorno**, grão de filme e vinheta.
- `js/pingo.js`: o Pingo com volume (luz principal, oclusão, listras macias), olhos detalhados (fibras da íris, pupila em fenda, reflexos, sombra da pálpebra), salto com os coxins à mostra.
- `js/bigcats.js`: onça-pintada, tigre e leão em perfil.
  - Rig comum: IK das pernas, caminhada em sequência lateral, escápula que rola, cauda e mandíbula.
  - Pelagem própria de cada espécie: rosetas irregulares com pintas internas; listras afiladas e bifurcadas; juba em tufos.
  - Pupilas redondas nos grandes felinos.
- `js/sets.js`: cenários pintados em camadas com profundidade de campo e paralaxe.
  - Mesa de estudos com madeira procedural e o Diário da Criação.
  - Floresta tropical com feixes de luz.
  - Bambuzal com neblina.
  - Savana ao pôr do sol em contraluz.
- `js/shots.js`: os planos, as câmeras, o *motion blur* real (média de 5 subquadros nos movimentos rápidos), os rótulos das espécies com o nome científico, as legendas palavra por palavra e o título com pegadas douradas.
- `audio/mix.py`: trilha e efeitos sintetizados (sem voz), com reverb, −14 LUFS e pico de −1,5 dBTP. Os tempos são lidos do objeto `T` em `js/shots.js`.
- `tools.cjs`: captura com o Chromium do Playwright (`still`, `lab`, `render`).

## Comandos

```sh
cd FELINOS_PILOTO_V2
python3 audio/mix.py
node tools.cjs still out/folha.png 0.5 2.6 5.4 9.4      # quadros de conferência
node tools.cjs lab out/lab.png pingo                    # personagem isolado (pingo, pingoBig, cats)
node tools.cjs render 0 10                              # frames/f_00000.png ...
ffmpeg -framerate 60 -i frames/f_%05d.png -i audio/piloto_mix.wav -c:v libx264 -crf 15 -preset slow -pix_fmt yuv420p -c:a aac -b:a 256k -movflags +faststart -shortest FELINOS_PILOTO_v2.mp4
```

## Pendências

- **Narração:** os tempos das legendas são provisórios. Com a voz do usuário, a transcrição substitui `WORDS`, e a trilha recua 7,5 dB nas falas.
- **Pingo:** foi desenhado a partir do roteiro, porque não havia folha de referência. Lara e Miguel ainda precisam de referência.
- **Insígnia oficial EN-024:** não foi inventada. Só o texto aparece até o usuário enviar a arte.
