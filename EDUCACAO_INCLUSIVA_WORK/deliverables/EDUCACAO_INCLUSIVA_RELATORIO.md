# EDUCAÇÃO INCLUSIVA — NINGUÉM FICA DE FORA!
### Série Especialidades dos Desbravadores · Relatório de produção (versão 3, Remotion)

Reels 9:16 · 1080×1920 · 60 fps · 180 s · H.264 + AAC 48 kHz estéreo · narração original do usuário.

## 1. Entregas

| Arquivo | Conteúdo |
|---|---|
| `EDUCACAO_INCLUSIVA_FINAL.mp4` | Vídeo completo com legendas dinâmicas |
| `EDUCACAO_INCLUSIVA_SEM_LEGENDAS.mp4` | Mesmo vídeo sem legendas |
| `EDUCACAO_INCLUSIVA_CAPA.png` | Capa vertical 1080×1920 |
| `final.srt` | Legendas em arquivo (90 blocos, mesma divisão das legendas na tela) |
| `voice_edited.wav` | Voz tratada e editada (sem trilha) |
| `voice_comparison.wav` | Comparação antes/depois do tratamento da voz |
| `EDUCACAO_INCLUSIVA_PROJETO.zip` | Código-fonte (Remotion, vetorização, áudio), referências, documentação |
| `piloto/EDUCACAO_INCLUSIVA_PILOTO.mp4` | Piloto aprovado (0–10,6 s) |

## 2. Como o visual foi feito

- **Ferramenta principal: Remotion** (React + SVG, renderização quadro a quadro em 60 fps). A versão anterior em Three.js foi substituída depois do retorno do usuário.
- **Personagens (Gabriel, Desbravadora, Theo):** vetorizados a partir das folhas enviadas pelo usuário (`tools/vectorize.py`), em quatro etapas:
  - redução às cores do desenho;
  - contorno vetorial com potrace;
  - divisão em peças articuladas;
  - preenchimento das áreas escondidas atrás de braços e pernas.
- **O que foi desenhado à mão sobre a vetorização:**
  - braços e mangas, com as insígnias da folha;
  - mão aberta para aceno e gesto;
  - olhos, sobrancelhas e boca animáveis, para piscar, olhar e mudar de expressão;
  - rodas da cadeira do Theo, que giram conforme a distância percorrida;
  - mão do Theo, presa ao aro durante o impulso.
- **Cenas 6, 7 e 8 (Bíblia e Helen Keller):** estilo "livro ilustrado" com silhuetas e luz de contorno. Não há folhas de referência para Jesus, Davi, Mefibosete, Anne Sullivan ou Helen Keller, então **nenhum rosto foi inventado**.
- **Mapas (Américas e Brasil):** contornos reais do Natural Earth 1:110m (domínio público).
- **Abertura:**
  - "IMAGINE" letra por letra sobre raios girando;
  - o emblema da especialidade entrando com o título da série;
  - flash, câmera acompanhando o Theo com linhas de velocidade;
  - revelação do clube com confete.
- **Legendas dinâmicas:** palavra por palavra no ritmo da narração, com a palavra falada em destaque e palavras-chave em selos coloridos.

## 3. Roteiro visual

| Cena | Tempo | Conteúdo |
|---|---|---|
| 1 | 0:00–0:13 | Theo chega ao clube; a escada (sem rampa) é a barreira destacada, nunca a pessoa; "Será que isso é inclusão?"; "NINGUÉM FICA DE FORA!" |
| 2 | 0:13–0:34 | Deficiência ≠ incapacidade; a sociedade cria barreiras (muro → rampa); OMS e CIF (saúde, ambiente, participação); Convenção da ONU (2006) |
| 3 | 0:34–0:52 | Tipos de deficiência (física, visual, auditiva, intelectual, múltipla); cordão de girassol (Lei 14.624/2023, uso opcional); habilidades e necessidades; respeitar as diferenças |
| 4 | 0:52–1:10 | Discriminação (tratamento desigual, direitos negados); bullying intencional e repetido: humilhações e apelidos só como rabiscos e símbolos (nunca palavras), exclusão, ataques virtuais; "COMBATER!" |
| 5 | 1:10–1:29 | Convenção Interamericana (OEA, Cidade da Guatemala, 7/6/1999); igualdade, participação, respeito; ① conheça ② debata ③ resuma |
| 6 | 1:29–1:49 | João 5:1-18: Jesus ouve e fala com o homem do tanque de Betesda; a cura narrada; líderes questionam o sábado; atenção à pessoa |
| 7 | 1:49–2:10 | 2 Samuel 9: Davi procura Mefibosete; ele se prostra ("Eis aqui o teu servo"); "Não temas"; lugar à mesa do rei |
| 8 | 2:10–2:25 | Helen Keller: W-A-T-E-R soletrado na mão junto à bomba d'água; escritora; universidade (1904); direitos e oportunidades |
| 9 | 2:25–2:41 | Lei Brasileira de Inclusão (Lei 13.146/2015): direitos, acessibilidade, educação, participação em igualdade; barreira eliminada |
| 10 | 2:41–3:00 | Observar barreiras, propor melhorias (rampa 8,33%) e apresentar à diretoria; rampa com corrimãos duplos; Theo sobe sozinho; "SEJA VOCÊ PARTE DESSA MUDANÇA!" |

**Representação:**
- ninguém empurra a cadeira do Theo;
- o Theo usa a cadeira com autonomia;
- os insultos nunca aparecem em palavras;
- a cura não é apresentada como condição de dignidade;
- Mefibosete não recebe dispositivo de mobilidade inventado.

## 4. Áudio

- **Voz:** a narração original foi restaurada e editada (detalhes em `documentation/AUDIO_REPORT.md`).
- **Música:** original sintetizada, com *ducking* de −7,5 dB durante a fala.
- **Efeitos sonoros:** 288, sintetizados e sincronizados com a animação v3 (`documentation/SFX_CUES_v3.json`). Incluem impulsos na roda, letras, selos, carimbos, transições, água, máquina de escrever e confete.
- **Volume final:** −14 LUFS, pico real ≤ −1 dBTP (`audio/master_v3.wav`).

## 5. Controle de qualidade

Medido nos MP4 entregues por `tools/qc_final.py` (arquivo `documentation/QC_FINAL.json`):

| Arquivo | Tamanho | Duração | Quadros | Vídeo | Áudio | Volume | Pico real | Quadros pretos | Congelamentos | Desvio A/V |
|---|---|---|---|---|---|---|---|---|---|---|
| EDUCACAO_INCLUSIVA_FINAL.mp4 | 76.0 MB | 180.0 s | 10800 | H.264 High 1080×1920 60 fps BT.709 | AAC 48 kHz estéreo 258 kbps | -14.0 LUFS | -1.3 dBTP | 0 | 0 | 0.0 ms |
| EDUCACAO_INCLUSIVA_SEM_LEGENDAS.mp4 | 68.0 MB | 180.0 s | 10800 | H.264 High 1080×1920 60 fps BT.709 | AAC 48 kHz estéreo 258 kbps | -14.0 LUFS | -1.3 dBTP | 0 | 0 | 0.0 ms |

Também foram conferidos:
- uma varredura de 1 quadro por segundo do vídeo inteiro;
- os quadros das 9 transições.

Dois ajustes saíram dessa conferência:
- um trecho de cerca de 2,5 s quase vazio na cena 2 (0:20–0:23) ganhou o selo da OMS;
- um trecho quase parado no fim da cena 7 (2:06), apontado pela detecção de congelamento, ganhou movimento de câmera contínuo.

Os quadros desses trechos foram renderizados de novo e encaixados com contagem exata de quadros.

## 6. Limitações declaradas

- **Fundos e personagens não foram gerados com Runway nem Higgsfield.** Não há conector nem chave de API configurada neste ambiente (`RUNWAYML_API_SECRET`, `HIGGSFIELD_API_KEY`/`HIGGSFIELD_API_SECRET`). Com as chaves cadastradas nas configurações do ambiente, os fundos podem ser trocados por planos gerados.
- **Requisitos oficiais não conferidos.** O texto da especialidade (MDA wiki) não pôde ser lido neste ambiente; o conteúdo segue o roteiro do briefing.
- **Verificação de áudio objetiva.** A conferência do áudio foi feita por medições e transcrição automática; não houve escuta humana.
