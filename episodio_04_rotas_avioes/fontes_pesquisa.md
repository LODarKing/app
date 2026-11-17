# Fontes de pesquisa — Episódio 04

Consultadas em 17/11/2026. Cada afirmação do roteiro aponta para pelo menos uma fonte abaixo.

## Cartografia e geometria

| Fonte | Status | O que sustenta |
|---|---|---|
| Penn State, GEOG 486, *Projection Properties*: https://courses.ems.psu.edu/geog486/node/856 | ✅ lida | O Mercator é conforme e preserva ângulos locais. Uma reta no Mercator representa uma rota de rumo constante (loxodromia), e as loxodromias "não mostram a menor distância entre dois pontos". Os círculos máximos aparecem curvos em projeções conformes. Nenhuma projeção plana preserva todas as distâncias. |
| Wikipedia, *Great-circle distance*: https://en.wikipedia.org/wiki/Great-circle_distance | ✅ lida | Define a distância de círculo máximo como o menor caminho sobre a superfície da esfera. O raio médio citado é R₁ ≈ 6371,009 km. |
| Wikipedia, *Mercator projection*: https://en.wikipedia.org/wiki/Mercator_projection | ✅ lida (parcial) | Verificado no texto: o Mercator leva as loxodromias a retas e sua escala linear cresce com a latitude. O fator sec φ veio do resumo da página e está conferido pela fórmula usada no código: k = 1/cos φ. |
| Natural Earth 1:50m (via pacote `world-atlas` 2.0.2): https://www.naturalearthdata.com | ✅ | Contornos de terra e fronteiras. Os dados são de domínio público (licença do pacote em `remotion/public/LICENSE_world-atlas.txt`). |

### Coordenadas (Wikipedia, infobox)
- **Nova York:** 40°42′46″N 74°00′22″O, ou seja, 40,7128 / −74,0061.
- **Tóquio:** 35°41′23″N 139°41′32″L, ou seja, 35,68972 / 139,69222.

São coordenadas de referência das cidades, não de aeroportos. A rota é uma **simulação geométrica**, não o registro de um voo.

### Valores calculados (código em `remotion/src/geo.ts`)
- **Modelo:** esfera de raio médio R = 6.371,0 km.
- **Ângulo central:** 97,565°.
- **Círculo máximo (SLERP):** **≈ 10.849 km**, com latitude máxima de 69,84° N.
- **Linha reta no Mercator** (loxodromia pelo Pacífico): **≈ 12.787 km**, cerca de 18% mais longa.
- Num elipsoide (WGS-84) os valores mudam algumas dezenas de quilômetros. Se forem exibidos no vídeo, a legenda informará "modelo esférico".
- **Antimeridiano:** o mapa é centrado no meio do círculo máximo (153,66° O). As duas rotas ficam contínuas, e a costura do mapa (26,3° L) fica longe delas. O recorte dos polígonos na costura é feito pelo `d3-geo`.

## Aviação e meteorologia (cena 5, ainda não produzida)

| Fonte | Status | Observação |
|---|---|---|
| FAA, *How Air Traffic Works*: https://www.faa.gov/podcasts/the-air-up-there/how-air-traffic-works | ❌ **inacessível** (HTTP 403 para acesso automatizado) | O conteúdo **não** foi usado nem presumido. Antes da cena 5 vou buscar uma referência substituta oficial (outra página da FAA, da ICAO ou da EUROCONTROL sobre controle de tráfego e espaço aéreo restrito) e registrá-la aqui. |
| NOAA/NWS Glossary, *Jet Stream*: https://marine.weather.gov/glossary.php?word=Jet+Stream | ✅ lida | Define a corrente de jato como "ventos relativamente fortes concentrados numa faixa estreita da atmosfera, normalmente horizontais e em grande altitude". Sua posição e orientação variam dia a dia. Isso sustenta "ventos influenciam as rotas" sem citar condições atuais. |

## Políticas do YouTube

| Fonte | Status | Consequência para o projeto |
|---|---|---|
| Políticas de monetização: https://support.google.com/youtube/answer/1311392 | ✅ lida | O conteúdo "inautêntico" (nome adotado em 15/07/2025) inclui material produzido em massa, genérico ou repetitivo. Mitigação: animação original calculada, roteiro autoral e arquivos editáveis preservados. |
| Divulgação de conteúdo gerado por IA: https://support.google.com/youtube/answer/14328491 | ✅ lida | A divulgação é exigida para conteúdo realista que possa enganar. Animação claramente não realista dispensa. A página não trata diretamente de narrador sintético. **Recomendação:** marcar "conteúdo alterado ou sintético" por prudência e citar a voz por IA na descrição. Os metadados de proveniência do MP4 são mantidos. |
