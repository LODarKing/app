# Remotion — vídeo piloto (versão 3)

Piloto dos primeiros 10,6 s da cena 1 ("Imagine chegar ao seu clube… Hoje, vamos descobrir"), refeito no **Remotion** (React + SVG) a partir do retorno do usuário.
A duração foi estendida de 10 s para 10,6 s para não cortar a palavra "descobrir" no meio.

## Personagens

As folhas de personagem enviadas pelo usuário (`assets/researched_references/`) são vetorizadas por `tools/vectorize.py`:

1. **Redução de cores:** cada imagem é reduzida às cores reais do desenho (agrupamento k-means no espaço de cor Lab), seguida de um filtro que remove pixels isolados.
2. **Suavização (opcional):** suavização que preserva as bordas, usada no Theo, cuja referência tem degradês suaves.
3. **Divisão em partes:** a imagem é dividida nas partes do boneco por polígonos definidos em `tools/vectorize_configs.py`.
4. **Contorno:** cada área de cor é contornada com o potrace e vira uma camada vetorial (SVG). As camadas se sobrepõem levemente, para que nunca apareçam frestas entre as cores.

| Personagem | Referência usada | Vista |
|---|---|---|
| Gabriel | `gabriel/00_referencia_original.jpeg` | frente |
| Desbravadora | `desbravadora/guia_consistencia.png` (figura grande, vetorizada em 2×) | frente |
| Theo | `theo/03_perfil_original.png` (vetorizado em 2×) | perfil, cadeira de rodas manual |

**O que é desenhado por parâmetros, para poder ser animado:**

| Elemento | Personagem | Arquivo |
|---|---|---|
| Olhos (piscar, direção do olhar), sobrancelhas e boca (sorriso, abertura, preocupação) | todos | `src/chars/Face.tsx` e `src/chars/Theo.tsx` |
| Mão aberta para o aceno | Gabriel e Desbravadora | `src/chars/rigs.tsx` |
| Roda traseira e rodinha dianteira (giram conforme a distância percorrida) | Theo | `src/chars/Theo.tsx` |
| Insígnias da camisa (a imagem de perfil é suave demais para contorná-las com nitidez) | Theo | `src/chars/Theo.tsx` |

**Articulações (rig):**

- **Gabriel e Desbravadora:** cabeça, tronco, quadril ou saia, pernas, e braços divididos em ombro, cotovelo e punho, com "remendos" nas juntas para esconder as emendas.
- **Theo:** inclinação do tronco, cabeça e braço calculado por cinemática inversa de 2 ossos. A mão fica presa ao aro durante o impulso, e a rotação da roda é igual à distância dividida pelo raio, sem patinar.

## Cenário

`src/scene/Clubhouse.tsx` desenha a sede do clube com varanda de 4 degraus e **sem rampa**: a escada é a barreira, e só ela é destacada, nunca a pessoa.

O cenário tem camadas com profundidade (paralaxe): céu, nuvens, morros, fileira de árvores, árvores, cerca, prédio, e arbustos e luz em primeiro plano.

## Áudio

`src/audio/pilot_mix.py` gera `public/piloto_mix.wav`:

- **Voz:** a voz tratada do narrador (`audio/voice_edited.wav`, 0–10,6 s).
- **Música:** abaixada automaticamente durante a fala.
- **Efeitos sonoros:** sintetizados e sincronizados com `src/timing.json` (impulsos na roda, frenagem, a barreira, o "?" e os passos).
- **Volume final:** −14 LUFS, pico real ≤ −1 dBTP.

## Como gerar

```sh
python3 tools/vectorize.py gabriel && python3 tools/vectorize.py girl && python3 tools/vectorize.py theo
python3 src/audio/pilot_mix.py
cd remotion && npm install
npx remotion render src/index.ts Piloto out/piloto_raw.mp4 --codec=h264 --crf=16 --concurrency=4
```

O arquivo `remotion.config.ts` aponta o Remotion para o navegador Chromium já instalado no ambiente.
