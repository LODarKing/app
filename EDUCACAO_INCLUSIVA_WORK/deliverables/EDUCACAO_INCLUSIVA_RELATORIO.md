# EDUCAÇÃO INCLUSIVA — NINGUÉM FICA DE FORA!
### Série Especialidades dos Desbravadores · Relatório de produção

| | |
|---|---|
| Formato | Instagram Reels 9:16 · 1080 × 1920 · **60 fps** · H.264 High · AAC-LC 48 kHz estéreo 256 kb/s |
| Duração | **180,0 s** (voz 0,2–178,2 s + cartela final) |
| Áudio final | **−14,0 LUFS integrados · −1,3 dBTP** (master.wav; os valores medidos depois do AAC estão em QC_FINAL.json) |
| Voz | Somente a gravação do narrador, restaurada e editada; sem voz sintética |
| Imagem | 100% procedural: personagens, cenários, objetos e ícones criados por código em Three.js (câmera ortográfica); composição, títulos e legendas no HyperFrames 0.8.150; codificação final com FFmpeg |

## 1. Entregas

| Arquivo | Conteúdo |
|---|---|
| `EDUCACAO_INCLUSIVA_FINAL.mp4` | Vídeo completo com legendas incorporadas |
| `EDUCACAO_INCLUSIVA_SEM_LEGENDAS.mp4` | Mesmo vídeo, com títulos e sem legendas |
| `EDUCACAO_INCLUSIVA_CAPA.png` | Capa vertical 1080×1920 |
| `voice_edited.wav` | Voz restaurada, editada e masterizada (24 bits, 48 kHz, −16 LUFS, −1,5 dBTP) |
| `voice_comparison.wav` | Comparação A/B original × tratado com loudness igualado (1 bipe = original, 2 bipes = tratado) |
| `final.srt` | 65 legendas sincronizadas e revisadas |
| `EDUCACAO_INCLUSIVA_PROJETO.zip` | Código-fonte Three.js, composição HyperFrames, scripts de áudio, fontes, gravações originais, documentação |
| `EDUCACAO_INCLUSIVA_RELATORIO.md` | Este relatório |

Também ficam na pasta de trabalho: `audio/` (voice_original, voice_clean, voice_edited, voice_comparison, music, sfx, master e voice_edited_natural_tempo.flac), `subtitles/AUDIODESCRICAO.md`, `documentation/` (AUDIO_REPORT, REQUIREMENTS_MATRIX, SCENE_TIMELINE.json, ASSET_MANIFEST.json, QUALITY_REPORT, QC_FINAL.json, transcrições) e `renders/` (teste de personagens, prévias, folhas de controle de qualidade, clipes por cena).

## 2. Fontes consultadas

- **Câmara dos Deputados / Senado:** Decreto nº 3.956/2001 e Decreto Legislativo nº 198/2001, que tratam da Convenção Interamericana (OEA, Guatemala, 7/6/1999).
- **Refworld / OEA:** AG/RES. 1608 (XXIX-O/99), adoção da Convenção Interamericana.
- **Lei nº 13.146/2015 (LBI):** art. 1º, parágrafo único, base na CDPD (Decreto Legislativo 186/2008 e Decreto 6.949/2009); art. 2º, modelo biopsicossocial.
- **Lei nº 14.624/2023:** cordão de girassol, símbolo opcional para deficiências ocultas.
- **OMS:** CIF (2001).
- **History.com / AFB / Perkins / PBS:** Helen Keller (surdocegueira aos 19 meses, Anne Sullivan desde 1887, Radcliffe *cum laude* em 1904) e *The Story of My Life* (1903), episódio W-A-T-E-R na bomba d'água.
- **Bíblia:** João 5:1–18 e 2 Samuel 9.
- **MDAWiki (Especialidade de Educação Inclusiva):** **não acessível** neste ambiente (HTTP 429/406 e timeouts). Veja a seção 3.

## 3. Requisitos abordados

A matriz completa está em `documentation/REQUIREMENTS_MATRIX.md`. As 10 cenas cobrem os 10 blocos do roteiro: barreiras; conceito de deficiência, CIF e CDPD; tipos de deficiência e deficiências ocultas; discriminação e bullying; Convenção Interamericana; João 5; 2 Samuel 9; Helen Keller; LBI; inclusão no clube. As atividades práticas (ler o documento, debater, fazer um resumo; observar barreiras, propor melhorias, apresentar à diretoria) aparecem na tela como passos ①②③. **O vídeo não afirma que assistir equivale a concluir a especialidade.**
**Limitação:** não consegui conferir a redação literal dos dez requisitos no MDAWiki nem obter o emblema oficial. **Nenhum emblema foi desenhado ou simulado**; a tela final traz apenas o texto "Especialidade de Educação Inclusiva • AM-055".

## 4. Arquitetura da animação

- **Mundo Three.js** (`src/`), empacotado com esbuild em `hyperframes/main/world.js`. Câmera ortográfica (1 unidade = 100 px no zoom 1). As formas vetoriais são polígonos preenchidos com **contorno de espessura uniforme** (polígono deslocado desenhado atrás) e **sombreamento cel** calculado no shader (crescente ou semiplano), sem texturas. A ordem de desenho usa faixas de profundidade, de modo que membros da mesma cadeia formam um contorno único.
- **Linha do tempo determinística:** cada quadro é uma função pura de `t = frame / fps`. O HyperFrames envia o evento `hf-seek` (adaptador Three.js do runtime) e `src/main.js` escolhe a cena, roda o `update(t)` e compõe as transições (dissolve, íris, wipe diagonal com faixa amarela, push vertical) por render targets MSAA. Não há relógio nem aleatoriedade não semeada (PRNG mulberry32 com sementes fixas).
- **Camada HTML/GSAP** (`tools/build_overlay.py` → `hyperframes/main/index.html`): títulos, chips informativos e legendas, com Poppins embutida em base64. Timeline GSAP registrada em `window.__timelines.root`. A variável de composição `subs` (on/off) gera as duas versões.
- **Sincronização com a voz:** fronteiras de cena e momentos-chave vêm da transcrição por palavra da voz final (`scene_bounds.json`). Ícones, destaques e gestos entram na palavra correspondente (por exemplo, "barreira", "Américas", "38 anos", "sábado", "eliminar barreiras").

## 5. Personagens construídos

Rig procedural (`src/characters/humanoid.js`) com quadril, coluna, pescoço, cabeça, ombros, braços, antebraços, mãos (aberta, punho, apontar, segurar), coxas, canelas e pés. O rosto tem olhos (com pálpebra e brilho), pupilas que olham, sobrancelhas, nariz, bochechas e boca paramétrica (abertura e sorriso, com língua). Há cabelos em camadas frontal e posterior (11 estilos) e acessórios: aparelho auditivo, óculos, barba, coroa, toucas e mantos, capelo, cordão de girassol. O IK de dois ossos posiciona mãos e pés; a vista 3/4 é parametrizada (`setFacing`).
Elenco (26 definições em `cast.js`): Lucas, Ana, **Pedro** (cadeira de rodas manual), **Clara** (cega, bengala longa), **Rafael** (surdo, aparelho auditivo), **Bia** (deficiência intelectual), **Theo** (deficiência múltipla, cadeira motorizada e CAA), Lia (deficiência oculta), João, Caio, Nina, Diretora Márcia, Professora, Jesus, o homem de Betesda, dois líderes religiosos, Rei Davi, Mefibosete, mensageiro, dois convidados, Helen Keller (criança, adulta, formanda) e Anne Sullivan.
Movimentos: caminhada com pés plantados (inclusive em degraus e rampa), giro de cabeça e corpo, aceno, fala, expressões, olhar, gestos explicativos, apontar, segurar objetos, piscar, bengala com toque em dois pontos, propulsão de cadeira (mão presa ao aro, rodas sem patinar), sentar, ajoelhar (IK), levantar, atividades em grupo. *Segurar Bíblia:* a Bíblia aparece aberta em quadro próprio (cena 6), mas não há personagem segurando uma Bíblia.

## 6. Áudio processado

Detalhes em `documentation/AUDIO_REPORT.md`.
- Diagnóstico: 9 tomadas AAC dual-mono, sem repetições nem reinícios; 37 trechos com clipping; ruído muito baixo (SNR de 37–45 dB); sem zumbido; reverberação baixa; ressonância em 315–500 Hz e vale de presença em 3–4 kHz; sibilância alta.
- Tratamentos: declipping AR → −6 dB de headroom → subtração espectral conservadora, escolhida entre 4 métodos por preservar fricativas → passa-altas de 80 Hz → controle dinâmico de plosivas → EQ corretiva (−2 dB em 420 Hz, +0,6 dB em 3,2 kHz, prateleira de −1,5 dB acima de 7,5 kHz) → de-esser dinâmico → compressão 2,5:1 → nivelamento por tomada.
- Cortes: 28 de 65 pausas encurtadas, conforme a pontuação; 28 respirações preservadas; micro-crossfades de 12 ms; nenhuma palavra cortada (verificado pela transcrição da voz final).
- Duração: edição natural de 208,25 s. **Para caber em 180 s foi aplicado time-stretch ×1,168 com preservação de pitch e formantes** (Rubber Band R3), levando a fala de 4,48 para cerca de 5,2 sílabas/s, ritmo ainda calmo. A versão natural foi preservada.
- Trilha original sintetizada em Python (ré maior, 92 BPM; abertura interrogativa, groove leve, trecho contido no bullying, trecho suave nas cenas bíblicas e históricas, clímax de esperança) e 91 efeitos sintetizados, sem samples, usados com moderação.
- Mixagem: *ducking* de −7,5 dB pela voz e voz cerca de 15 LU acima da trilha.

## 7. Medições

Os valores medidos nos MP4 entregues ficam em `documentation/QC_FINAL.json`. Valores de referência:

| Item | Valor |
|---|---|
| master.wav | −14,0 LUFS · LRA 2,0 LU · −1,3 dBTP |
| voice_edited.wav | −16,0 LUFS · LRA 2,1 LU · −1,5 dBTP |
| Inteligibilidade (Whisper) | voz final: confiança média 0,985, 0 palavras < 0,5; master com trilha: 97,9% das palavras iguais à referência |

## 8. Ferramentas

Three.js 0.180 · GSAP 3.13 · HyperFrames 0.8.150 (render local com Chrome headless e SwiftShader, captura beginframe, 4 workers) · esbuild · Playwright (prévias) · FFmpeg 6.1 · Rubber Band 3.3 · faster-whisper (large-v3-turbo) · Pedalboard · NumPy/SciPy/librosa/pyloudnorm · Pillow/Matplotlib.

## 9. Testes realizados

Teste de personagens (vídeo de 10 s e folhas de detalhe); folhas de quadros por cena; prévia em movimento de 8 fps do filme inteiro; varredura de 1 fps; folha das 9 transições; lint da composição no HyperFrames (0 erros, 0 avisos); comparações espectrais e de reconhecimento de fala do áudio; QC automático dos MP4 finais (`tools/qc_final.py`).

## 10. Problemas encontrados e corrigidos (principais)

O detalhamento está em `documentation/QUALITY_REPORT.md`.
1. **Ana parecia empurrar a cadeira de Pedro** na rampa → passou a caminhar à frente.
2. **Braços erguidos cobrindo o rosto** de Pedro e Theo → sinal de rotação corrigido.
3. **Cores escuras durante as transições** → recodificação sRGB no compositor.
4. **Voz clara demais na 1ª versão** (+5 dB em 3–6 kHz) → EQ revista, com o tempo de edição travado para não dessincronizar o vídeo já em renderização.
5. `Limiter` do Pedalboard aplicava ganho implícito → limitador de pico verdadeiro próprio.
6. Ajuste fino da aceleração: na frase "e a audição", "e a" se fundia → mapa de tempo local (×1,05).
7. As duas primeiras renderizações foram canceladas quando o terminal de comando terminou → renderizações em processo de segundo plano gerenciado.

## 11. Limitações (declaradas)

- **Andamento:** a narração completa não cabe em 180 s sem aceleração; foi usado ×1,168 (sem perda medida de inteligibilidade). A versão natural de 208 s está disponível.
- **Escuta humana:** a avaliação do áudio foi objetiva (medições e reconhecimento automático). Recomenda-se uma escuta crítica antes de publicar.
- **Requisitos e emblema oficiais:** não verificados no MDAWiki (site inacessível daqui); nenhum emblema foi simulado.
- **Libras:** não há interpretação em Libras.
- **Uniformes:** representação estilizada (camisa clara, calça ou saia azul-marinho, lenço amarelo), sem insígnias oficiais.

## 12. Resultado final

Veja a seção 13, preenchida depois da codificação e do QC dos arquivos finais.
