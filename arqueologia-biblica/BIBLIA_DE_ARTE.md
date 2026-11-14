# Bíblia de arte: Arqueologia Bíblica (AM-032)

O design system fica em código, em `src/config.js`. Este documento explica as escolhas.

## Conceito
Este é um mural egípcio em papiro, que serve de **moldura narrativa**. Os **objetos históricos mantêm a identidade própria de cada um**:
- a estela de Tel Dan é de basalto, com escrita no estilo aramaico antigo;
- os achados assírios, hebraicos e romanos do vídeo completo seguem cada um o seu estilo.

O egípcio é a moldura, não o disfarce dos objetos.

## Formato
1080×1920 (9:16), 30 q/s, H.264 yuv420p, AAC 48 kHz. As faixas seguras do Reels ficam sem informação crítica:
- topo: 180 px;
- rodapé: 280 px;
- legendas: entre y 1428 e 1610.

## Paleta (pigmentos)
| Papel | Cor | Uso |
|---|---|---|
| Papiro | `#E4CB93` / claro `#F0DFB1` / escuro `#C7A464` | fundo, folhas, rolo |
| Tinta de fuligem | `#26170D` | contornos, texto |
| **Ocre: destaque único de interface** | `#D9962A` (palavra falada em `#E9BC4C`) | palavra falada, sublinhados, "REAL?", "BÍBLICA", fio da descoberta |
| Azul-lápis-lazúli | `#22408A` | palavras-chave da legenda e rótulo "CASA DE DAVI" (pedido no briefing: destaque ocre/azul), mar |
| Turquesa / terracota / ouro | `#2E9C92` / `#A8472A` / `#E9BC4C` | colar, cabo da lupa, carimbo |
| Basalto | `#34373B` | estela (objeto histórico, não egípcio) |
| Areia / terra | `#D7B475` / `#8C5E34` | solo e estratos |

## Tipografia (só duas famílias para texto)
- **Título: Cinzel** (OFL), maiúsculas lapidares, em "E SE FOSSE REAL?" e "ARQUEOLOGIA BÍBLICA".
- **Interface: Inter** (OFL), nos pesos 700, 800 e 900, em legendas, rótulos e avisos.
- As fontes de escrita antiga são grafismo, não tipografia de interface:
  - **Noto Sans Phoenician** (OFL): letras do alfabeto fenício/aramaico antigo na estela;
  - **Noto Sans Egyptian Hieroglyphs** (OFL): sinais só decorativos, em frisos.

## Linguagem visual
- **Recorte (cut-out) 2D/2.5D.** Cada peça tem cor chapada, textura de fibra presa à peça, contorno de tinta de 3 a 5 px e sombra de papel recortado (luz da esquerda, em cima). A profundidade vem da paralaxe do fundo, das camadas de solo e do zoom de câmera.
- **Composição em registros horizontais.** Linhas de registro em lápis + ocre, com friso de sinais (no título e no mecanismo). Não há moldura ao redor do quadro nem etiquetas nos cantos.
- **Personagem egípcio** (`src/personagem.js`), segundo as convenções da pintura egípcia, sem caricatura:
  - cabeça e pernas de perfil, ombros de frente;
  - olho amendoado de frente, com traço de kohl;
  - peruca preta, colar *wesekh*, saiote *shendyt*;
  - pele em ocre-vermelho;
  - pivôs em cintura, pescoço, ombros, cotovelos, punhos, quadris, joelhos (IK) e tornozelos;
  - pupila que se mexe, piscada, respiração e peso;
  - animação **em dois** (12 desenhos/s); a câmera roda a 30 q/s.
- **Escrita da estela:**
  - letras reais do alfabeto fenício/aramaico antigo, em linhas da direita para a esquerda, com pontos separando as palavras;
  - **as linhas são ilustrativas, não são transcrição**;
  - a única sequência intencional é **bytdwd** (בית דוד, "casa de Davi"), com as letras na ordem correta, em posição ilustrativa;
  - na tela aparece "Estela de Tel Dan · séc. IX a.C. — ilustração".
- **Hieróglifos:** só como friso decorativo. Nenhuma frase é composta e nenhuma tradução é sugerida.

## Movimento
- O vídeo é uma função pura do tempo (`window.seek(t)`). O ruído usa semente (mulberry32). Não há CSS transitions, setTimeout nem requestAnimationFrame.
- Os eventos visuais caem na grade de 120 bpm (semicolcheia de 0,125 s). Os eventos ligados a palavras ficam a no máximo ~62 ms da palavra.
- Há uma novidade a cada 1,2 a 2,5 s:
  1. a pedra sobe;
  2. o pincel limpa;
  3. a lupa circula;
  4. o rótulo aparece;
  5. a nuvem de areia passa;
  6. o mapa se desenha;
  7. o personagem aponta;
  8. a seta de tinta corre;
  9. a pedra encaixa;
  10. o carimbo bate;
  11. o rolo se abre;
  12. a câmera desce.
- **Evitados:** título centralizado sobre gradiente, entradas com fade, brilho (glow), explosão genérica de partículas (os grãos de areia escorrem da pedra, com motivo) e zoom repetitivo.

## Som
- Trilha original sintetizada (`audio/timbres.py`, `audio/trilha_piloto.py`):
  - Ré frígio, com bordão, pandeiro de moldura, chocalho, alaúde no estilo oud e flauta de cana;
  - no título, Ré maior.
- Efeitos sintetizados: pedra, areia, pincel, papiro, pena, cliques, sininho, carimbo e trava de bronze. Todos caem na batida medida (`audio/piloto/beats.json`, `acertos.json`).
- Mixagem com a voz à frente e ducking de −9,5 dB na trilha. Meta: −14 LUFS integrado e pico verdadeiro ≤ −1,5 dBTP.
