# Nomenclatura — decisões e justificativas

Os nomes dos 10 termos do requisito 2 vieram de uma tradução da especialidade em inglês. Essa versão (Pathfinder Wiki, fonte R2) lista os mesmos termos **na mesma ordem**:

| # | Termo no requisito (pt) | Termo na versão inglesa | Como o vídeo apresenta | Por quê |
|---|---|---|---|---|
| 1 | Seio (laçada) | *bight* | Corda dobrada em U, **sem cruzar**. | Coincide em T1 e R2. |
| 2 | Ponta corrediça (vivo) | *running end* | O trecho livre que **se movimenta** para fazer o nó. | R2: "a ponta em que o nó está sendo feito". |
| 3 | Corda restante (ponta fixa) | *standing part* | A parte que **fica parada** ou recebe a carga. | R2 e T1 ("parte restante"). |
| 4 | Nó superior | *overhand* | A ponta cruza **por cima** da parte fixa e passa por dentro da volta. Aparece na tela como **"Nó superior (nó simples)"**. | Os gabaritos brasileiros chamam de "nó simples" e T4 o descreve como a volta cruzada por cima. A mesma animação mostra as duas leituras: primeiro a volta por cima, depois a ponta atravessando. |
| 5 | Alça de azelha (laçada com nó) | *loop* | Alça **fixa** feita com um nó no seio (nó de azelha). Não corre quando puxada. | O parêntese do requisito ("laçada com nó") e a "azelha" dos manuais brasileiros. |
| 6 | Volta (laço) | *turn* | A corda **cruza sobre si mesma** ou envolve um objeto. Contraste direto com o seio, que não cruza. | T1: "laço é o cruzamento de duas partes". R2: *turn* ao redor de objetos ou da própria corda. |
| 7 | Curva (dobra) | *bend* | **Nó que une duas cordas pelas pontas** (exemplo: nó de escota). | Em inglês, *bend* é o nome técnico dos nós de união, e "curva/dobra" é a tradução literal. O vídeo avisa: "aqui, curva é nome técnico". |
| 8 | Amarra | *hitch* | Prende a corda **a um objeto** (mastro, argola). Várias voltas apertadas unindo paus formam as amarras de pioneiria. | R2: *hitch* prende a corda a um mastro. Liga o termo às amarras do requisito 10. |
| 9 | União de cordas | *splice* | **Emenda (costura)**: os cordões de uma corda são entrelaçados nos da outra, **sem nó**. | Mesma posição de *splice* na lista. O requisito 7 da edição brasileira traduz *splice* por "costura". Fica distinto da curva: a curva une com nó, a emenda une entrelaçando. |
| 10 | Chicote (ponta de trabalho) | *whipping* | A **extremidade** da corda. Precisa de acabamento (falcaça ou fusão, nas sintéticas) para não desfiar. | Em português náutico, chicote é a ponta do cabo (T1). *Whipping* é a falcaça que protege o chicote, e o vídeo mostra as duas coisas juntas. |

## Termos próximos — como o vídeo evita confusão

- **Ponta corrediça × chicote.** São vizinhos, não objetos diferentes:
  - o chicote é a extremidade, a "pontinha", e precisa de acabamento;
  - a ponta corrediça (o vivo) é o trecho que se movimenta ao fazer o nó e termina no chicote.

  Na tela, o mesmo trecho da corda acende em amarelo (ponta corrediça) e o chicote ganha um anel de falcaça.
- **Seio × volta × alça.** O vídeo usa o cruzamento como critério visível:
  - o seio não cruza;
  - a volta cruza;
  - a alça de azelha é um seio travado por um nó.
- **"Corda de três fios".** Na especificação brasileira, os "3 fios" são os **três cordões** (também chamados de pernas). Dentro de cada cordão há fios menores e, dentro deles, fibras. A tela mostra "3 fios = 3 cordões" para não confundir com os fios internos.
- **Corda de três fios × trançado triplo.** Na corda de três fios, os cordões são **torcidos juntos**, girando em volta do eixo. No trançado triplo, os cordões **se entrelaçam**, passando por cima e por baixo, como uma trança. A animação mostra os dois lado a lado, com as mesmas três cores.
- **Torções alternadas:** fibra → fio (torção num sentido) → cordão (sentido contrário) → corda (sentido contrário de novo). É isso que impede a corda de se desfazer.

## Pontos para a aprovação do usuário

1. Apresentar **curva** como "nó de união" (*bend*) e **união de cordas** como "emenda/costura" (*splice*). Alguns gabaritos de clube tratam "curva" como "dobra da corda". Se o avaliador do clube usar essa leitura, dá para trocar o texto em `config.js` sem refazer a animação.
2. **Nó superior** aparece como "nó superior (nó simples)".
