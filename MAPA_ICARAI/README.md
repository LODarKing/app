# Trilha da Bússola · Icaraí (Amontada-CE)

Kit para a prática da Especialidade de Mapa e Bússola (AR-021): 10 pontos de controle com trechos curtos, contados em passos, numa rua em frente à coordenada **-3.0321153, -39.6609647** (Icaraí de Amontada).

## Entregas (`saida/`)
- `TRILHA_DA_BUSSOLA_ICARAI.pdf`: 9 páginas A4.
  1. Mapa ilustrado (escala 1:750), com pegadas de ponto a ponto. Cada trecho mostra o número da bússola e os passos.
  2. Cartões do desbravador, dois por folha.
  3. Guia do monitor, com montagem da pista, segurança, gabarito com coordenadas, declinação e palavra secreta.
  4. Páginas 4 a 9: placas dos 10 pontos, placa de largada e chegada e placa de aferição do passo.
- `TRILHA_DA_BUSSOLA_ICARAI_mapa.png`: o mapa em imagem, para enviar pelo celular.

## Percurso
- 10 pontos, 254 m no total, trechos de 14 a 27 m (28 a 54 passos de 50 cm).
- A ida é pelo lado sudeste da rua, com uma travessia na curva (com monitor), e a volta é pelo lado noroeste.
- Os rumos são magnéticos, ou seja, a criança gira o limbo da bússola até o número indicado. A declinação usada foi de 20,2° Oeste (WMM-2025, nov/2026).
- Palavra secreta: ORIENTAÇÃO.

## Como refazer
```
python3 scripts/percurso.py     # pontos, rumos, distâncias, coordenadas -> dados/percurso.json e kit/js/dados.js
node render.mjs                 # PDF + PNG em saida/
```
Para mudar um ponto, edite a lista `CTRL` em `scripts/percurso.py`. Cada ponto é dado pela posição ao longo da rua, em metros a partir da largada, e pelo afastamento lateral. Depois, refaça os dois passos acima.

## Fontes
- A rua vem do OpenStreetMap (© colaboradores, ODbL), num recorte salvo em `dados/icarai_osm_area1.osm`.
- Casas, quintais e muros foram traçados à mão sobre imagem aérea (precisão de cerca de 2 m). A imagem não vai no mapa nem no repositório.
- A declinação magnética vem do World Magnetic Model 2025 (pacote `pygeomag`).
- As árvores e os coqueiros desenhados são os mesmos do vídeo (`js/copas.js`).
