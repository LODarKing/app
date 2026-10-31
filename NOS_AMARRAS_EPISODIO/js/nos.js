// Desenhos de nós (pontos de controle). Cada desenho foi conferido no laboratório (node render.mjs --lab):
// número de cruzamentos, sequência por cima/por baixo e ausência de cruzamento desnecessário.
const NOS = {};
const tf = (pts, s, dx, dy, cx = 540, cy = 600) => pts.map(([x, y]) => [cx + (x - cx) * s + dx, cy + (y - cy) * s + dy]);

// Nó oito (Ashley nº 520), solto. Topologia: parte fixa desce; a volta inferior sobe pela direita e cruza POR CIMA
// da parte fixa (c1); a ponta contorna a parte fixa POR TRÁS (c2), entra na volta por cima (c3) e sai por baixo (c4).
// Diagrama alternado reduzido com 4 cruzamentos = nó oito.
NOS.oitoPontos = () => [
  [540, -80], [540, 120], [540, 300], [540, 450], [545, 580], [585, 700], [690, 762], [800, 705], [832, 565], [788, 450], [684, 412],
  [560, 455], [440, 532], [366, 498], [348, 410], [398, 330], [480, 298], [600, 292], [705, 302], [782, 352], [742, 452], [698, 548], [668, 660], [660, 860],
];
// gancho: nó oito + a ponta que segue para o título (sublinha "NÓS E", vira e sublinha "AMARRAS")
NOS.ganchoPontos = () => {
  const k = tf(NOS.oitoPontos(), 1.05, 0, -30).slice(0, -1);
  return [...k, [676, 836], [640, 912], [520, 932], [250, 932], [150, 968], [118, 1050], [140, 1126], [220, 1150], [560, 1150], [905, 1150], [962, 1184], [966, 1262], [905, 1300], [520, 1300], [206, 1300], [132, 1328], [124, 1394], [182, 1422], [236, 1422], [284, 1422], [330, 1422]];
};
NOS.gancho = () => corda(NOS.ganchoPontos(), { w: 44, cache: 'gancho' });
NOS.oito = () => corda(tf(NOS.oitoPontos(), 1.05, 0, -30), { w: 44, cache: 'oito' });
