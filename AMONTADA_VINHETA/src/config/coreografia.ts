import { cue, cueExact } from './timeline';

/**
 * Coreografia: quando cada movimento começa e termina (em quadros).
 * Todos os acentos partem dos acertos musicais de timeline.json,
 * então mudar o andamento ou um acerto reposiciona imagem e som juntos.
 */
export const T = {
  // CENA 1 — os três pontos (a reticência) chegam antes de tudo, um por acerto
  // (a mola parte 2 quadros antes: o “pop” chega ao tamanho cheio no quadro do acerto)
  pontos: [cueExact('ponto1') - 2, cueExact('ponto2') - 2, cueExact('ponto3') - 2],
  // os pontos se esticam e viram o fio, que atravessa a tela
  fioMorph: [cueExact('linha'), cueExact('linha') + 6],
  // CENA 2 — “Enquanto” e “Isso” sobem de trás do fio (acerto em 0,5 s)
  linha1: cue('enquanto') - 4,
  linha2: cue('enquanto') - 2,
  stagger: 0.55,
  // CENA 3 — o bloco sobe para abrir espaço; o fio vira a régua do “em”
  sobe: [cue('sobe'), cue('sobe') + 8],
  // o “em” só aparece com o bloco já no lugar (nunca encosta em “Isso”)
  emAbre: [cueExact('em') - 1.5, cueExact('em') + 6],
  // a faixa dourada corre da esquerda e pousa no acerto “bloco” (1,5 s)
  blocoEntra: [cue('bloco') - 4, cue('bloco') + 2],
  // a faixa recolhe para a direita e revela “Amontada…” (acerto “revela”, 1,75 s)
  blocoSai: [cue('revela') - 4, cue('revela') + 4],
  cidadeDesliza: [cue('bloco') - 3, cue('revela') + 7],
  // CENA 4 — assinatura: o marcador coral percorre o fio enquanto a composição respira
  marcador: [cue('assinatura') - 1, cue('fimPonto3') + 1],
  // os três pontos da reticência pulam no motivo final
  // (o pulo atinge a altura máxima exatamente no acerto)
  fimPontos: [cueExact('fimPonto1') - 1.7, cueExact('fimPonto2') - 1.7, cueExact('fimPonto3') - 1.7],
  // CENA 5 — saída: o texto ganha impulso e a cortina varre da esquerda para a direita
  saidaTexto: [cue('fimPonto3') - 2, cue('resolucao') + 1],
  cortina: {
    /** borda da frente (coral, logo atrás o dourado): cobre o quadro até o acerto final */
    frente: [cue('resolucao') - 6, cue('resolucao') + 1.5],
    /** borda de trás (dourado, com o coral fechando): revela o que vem depois */
    tras: [cue('resolucao') + 2, cue('resolucao') + 11.5],
  },
} as const;
