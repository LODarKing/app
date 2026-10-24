// THEO — Desbravador, cadeira de rodas manual. Side view facing right.
// Drawn in the coordinates of assets/researched_references/theo/03_perfil_original.png (1254 px sheet).
import { Part, Bone, blob, shape, curve, ellipse, circle, ring, rrect, capsule, poly, f, lerp, clamp } from '../vec.js';
import { C } from '../palette.js';
import { solve2 } from '../ik2.js';

const AXLE = [448, 930], R_TIRE = 222, R_RIM = 186, CASTER = [752, 1104], R_CASTER = 56;
export const THEO_GROUND = AXLE[1] + R_TIRE;   // y of the floor in sheet coordinates

// ---------- mouth / brow generators ----------
function mouthD(open, smile, wide = 1) {
  // corners
  const bx = lerp(628, 622, wide), fx = lerp(668, 675, wide);
  const by = 324 - 5 * smile, fy = 331 - 8 * smile;
  const drop = 3 + 34 * open;
  const mx = (bx + fx) / 2, my = (by + fy) / 2;
  const topSag = -1.5 + 3 * Math.max(0, -smile);
  const top = `M${f(bx)} ${f(by)} C${f(bx + 14)} ${f(by + topSag)} ${f(fx - 14)} ${f(fy + topSag)} ${f(fx)} ${f(fy)}`;
  const bot = `C${f(fx - 2)} ${f(fy + drop * 0.9)} ${f(mx + 8)} ${f(my + drop * 1.25)} ${f(mx - 4)} ${f(my + drop * 1.1)} C${f(bx + 6)} ${f(by + drop)} ${f(bx - 2)} ${f(by + drop * 0.45)} ${f(bx)} ${f(by)} Z`;
  return top + ' ' + bot;
}
function tongueD(open, smile) {
  const fx = 668, bx = 630, y = 332 - 6 * smile + 34 * open * 0.62;
  return `M${f(bx)} ${f(y + 30)} C${f(bx)} ${f(y - 2)} ${f(fx - 22)} ${f(y - 14)} ${f(fx + 4)} ${f(y + 4)} L${f(fx)} ${f(y + 40)} Z`;
}
function browD(raise, worry) {
  // raise: px up; worry: inner (front) end up & outer end down
  const y0 = 220 - raise + 6 * worry, y1 = 199 - raise - 8 * worry;
  return `M${f(589)} ${f(y0)} C${f(598)} ${f(y0 - 18)} ${f(620)} ${f(y1 - 6)} ${f(634)} ${f(y1)} C${f(638)} ${f(y1 + 3)} ${f(636)} ${f(y1 + 9)} ${f(631)} ${f(y1 + 8)} C${f(618)} ${f(y1 + 5)} ${f(604)} ${f(y0 - 7)} ${f(596)} ${f(y0 + 3)} C${f(592)} ${f(y0 + 7)} ${f(586)} ${f(y0 + 5)} ${f(589)} ${f(y0)} Z`;
}

export function createTheo() {
  const root = new Bone(AXLE[0], AXLE[1]);          // root pivot = rear axle
  const OLs = [C.lineSkin, 3.2];

  // ===================== WHEELCHAIR (back parts) =====================
  const chairBack = root.bone(AXLE[0], AXLE[1], 0);
  // push handle + backrest post (silver), backrest upholstery (black)
  chairBack.draw(new Part({
    fill: [[rrect(368, 470, 50, 420, 18), C.chairBlack]],
    shade: [[rrect(396, 470, 30, 420, 10), C.chairBlack2]],
    ol: [C.lineBlack, 3],
  }), 1);
  chairBack.draw(new Part({ olFree: [[curve([[388, 466], [392, 700], [398, 905], [440, 985], [500, 1000]]), C.lineSteel, 22], [curve([[388, 466], [392, 700], [398, 905], [440, 985], [500, 1000]]), C.steel, 15]] }), 2);
  chairBack.draw(new Part({ fill: [[rrect(272, 456, 118, 30, 15), C.chairBlack]], shade: [[rrect(272, 472, 118, 14, 7), C.chairBlack2]], ol: [C.lineBlack, 3] }), 3);
  // seat sling + side panel (behind the wheel)
  chairBack.draw(new Part({ fill: [[shape([[400, 686], [772, 686], [776, 716], [740, 790], [720, 900, 1], [410, 905, 1]]), C.chairBlack]], ol: [C.lineBlack, 3] }), 4);

  // ===================== BODY =====================
  const hip = root.bone(520, 692, 10);
  // pants: buttock + thigh (static, rests on seat)
  hip.draw(new Part({
    fill: [[shape([[430, 700], [540, 690], [720, 694], [860, 704], [905, 720], [912, 748], [880, 772], [760, 770], [560, 770], [440, 760]]), C.pants]],
    shade: [[shape([[430, 745], [600, 752], [800, 756], [905, 742], [912, 790], [430, 800]]), C.pantsShade], [curve([[600, 702], [760, 704], [880, 712]]) + ' L880 706 L600 696 Z', C.pantsHi, 0.5]],
    line: [[curve([[640, 742], [700, 744], [760, 742]]), C.pantsShade, 3]],
    ol: [C.linePants, 3.2],
  }), 0);
  // shin (front leg) + far shin peeking behind
  hip.draw(new Part({
    fill: [[shape([[862, 726], [910, 724], [924, 760], [948, 1006], [884, 1012], [870, 860]]), C.pantsFar]],
  }), -1);
  hip.draw(new Part({
    fill: [[shape([[846, 740], [904, 726], [920, 770], [946, 1004], [880, 1012], [862, 860]]), C.pants]],
    shade: [[shape([[846, 740], [872, 748], [890, 860], [905, 1012], [880, 1012], [862, 860]]), C.pantsShade]],
    line: [[curve([[910, 800], [922, 880], [930, 960]]), C.pantsShade, 2.6]],
    ol: [C.linePants, 3.2],
  }), 1);
  // shoe
  hip.draw(new Part({
    fill: [[shape([[872, 996], [946, 992], [972, 1010], [1022, 1024], [1038, 1046], [1030, 1064, 1], [870, 1064, 1], [862, 1030]]), C.shoe]],
    shade: [[poly([[860, 1046], [1040, 1046], [1040, 1070], [860, 1070]], true), C.shoeSole], [shape([[900, 1000], [950, 998], [985, 1016], [960, 1018], [915, 1010]]), C.shoeHi, 0.7]],
    ol: [C.lineBlack, 3],
  }), 2);

  // ----- torso (lean pivot at hip) -----
  const torso = hip.bone(520, 690, 2);
  // far arm (behind body), visible only as sleeve edge behind the back
  // neck
  torso.draw(new Part({ fill: [[shape([[528, 372], [588, 380], [594, 452], [522, 452]]), C.skin]], shade: [[shape([[520, 372], [592, 380], [592, 412], [520, 418]]), C.skinShade]], ol: OLs }), 0);
  // shirt
  torso.draw(new Part({
    fill: [[shape([[462, 446], [520, 436], [580, 446], [620, 474], [640, 520], [646, 590], [638, 650], [626, 688, 1], [436, 694, 1], [398, 672], [376, 620], [378, 540], [404, 484]]), C.shirt]],
    shade: [[shape([[370, 560], [440, 610], [470, 650], [520, 700], [370, 700]]), C.shirtShade], [shape([[580, 452], [626, 480], [646, 560], [628, 566], [612, 500]]), C.shirtShade, 0.55]],
    line: [[curve([[520, 600], [522, 640], [530, 682]]), C.shirtLine, 2.4]],
    ol: [C.lineShirt, 3.2],
  }), 1);
  // pocket, tag, pins, button
  torso.draw(new Part({
    fill: [[shape([[558, 552, 1], [620, 548, 1], [624, 604], [612, 612, 1], [566, 614, 1], [560, 604]]), C.shirt]],
    shade: [[shape([[556, 548], [624, 546], [624, 566], [556, 568]]), C.shirtShade, 0.8]],
    line: [[poly([[558, 566], [622, 563]]), C.shirtLine, 2.4]],
    ol: [C.shirtLine, 2.4],
    top: [[circle(592, 578, 4.5), C.button]],
  }), 2);
  torso.draw(new Part({ fill: [[rrect(560, 520, 54, 18, 5), C.tag]], shade: [[rrect(560, 531, 54, 7, 3), C.tagShade]] }), 3);
  torso.draw(new Part({ fill: [[circle(576, 506, 5.5), C.pinRed], [circle(590, 505, 5.5), C.pinGold], [circle(604, 504, 5.5), C.pinBlue]] }), 3);
  // belt + buckle
  torso.draw(new Part({ fill: [[shape([[434, 676, 1], [630, 670, 1], [634, 694, 1], [436, 700, 1]]), C.belt]], ol: [C.lineBlack, 2.5] }), 4);
  torso.draw(new Part({ fill: [[rrect(618, 668, 22, 30, 4), C.gold]], shade: [[rrect(630, 668, 10, 30, 3), C.goldShade]], ol: [C.goldLine, 2] }), 5);
  // scarf: collar wrap, slide, tail
  torso.draw(new Part({
    fill: [[shape([[436, 456], [462, 412], [520, 388], [566, 396], [612, 424], [644, 456], [652, 484], [622, 492], [588, 470], [544, 446], [500, 444], [466, 466]]), C.scarf]],
    shade: [[shape([[436, 456], [470, 428], [530, 424], [590, 446], [652, 484], [622, 492], [588, 470], [544, 446], [500, 444], [466, 466]]), C.scarfShade, 0.85]],
    line: [[curve([[458, 440], [500, 410], [560, 412], [630, 460]]), C.scarfShade, 3]],
    ol: [C.lineScarf, 3],
  }), 6);
  torso.draw(new Part({
    fill: [[shape([[584, 494], [618, 490], [636, 540], [668, 662, 1], [642, 674, 1], [608, 562], [590, 520]]), C.scarf]],
    shade: [[shape([[584, 494], [600, 496], [618, 546], [648, 674, 1], [642, 674, 1], [608, 562], [590, 520]]), C.scarfShade, 0.9]],
    line: [[curve([[622, 500], [638, 560], [662, 662]]), C.red, 3.4]],
    ol: [C.lineScarf, 3],
  }), 7);
  torso.draw(new Part({
    fill: [[shape([[576, 470, 1], [626, 468, 1], [601, 514, 1]]), C.red]],
    shade: [[shape([[586, 476, 1], [616, 475, 1], [601, 502, 1]]), C.yellow]],
    top: [[shape([[592, 480, 1], [610, 479, 1], [601, 495, 1]]), C.white]],
    ol: [C.redDark, 2.4],
  }), 8);

  // ----- head (pivot at the neck) -----
  const head = torso.bone(552, 392, 10);
  head.draw(new Part({
    fill: [[shape([
      [680, 192], [714, 160], [727, 152, 1], [716, 124], [700, 100], [706, 76, 1], [676, 84], [652, 80], [637, 68, 1], [612, 58], [578, 56], [550, 50], [525, 38, 1], [508, 56], [478, 60], [423, 57, 1], [414, 82], [408, 110], [378, 120], [350, 136, 1], [362, 160], [362, 184], [344, 198, 1], [354, 216], [349, 238, 1], [362, 264], [372, 290], [395, 318, 1], [410, 330], [424, 343], [450, 377, 1], [470, 345], [496, 318], [560, 250], [640, 200],
    ]), C.hair]],
    shade: [
      [shape([[349, 238], [380, 300], [430, 350], [450, 377], [500, 320], [470, 290], [420, 250], [380, 200]]), C.hairShade],
      [shape([[408, 110], [440, 130], [470, 175], [500, 230], [470, 200], [430, 160], [400, 140]]), C.hairShade, 0.8],
      [shape([[525, 38], [560, 70], [600, 100], [640, 120], [600, 112], [550, 90]]), C.hairShade, 0.7],
      [shape([[460, 70], [520, 75], [580, 85], [520, 95], [470, 92]]), C.hairHi, 0.85],
      [shape([[620, 90], [672, 96], [700, 104], [676, 110], [640, 106]]), C.hairHi, 0.8],
    ],
    ol: [C.lineHair, 3.2],
  }), 0);
  // face
  head.draw(new Part({
    fill: [[shape([
      [528, 176], [556, 152], [600, 142], [642, 146], [672, 160], [680, 200], [683, 262], [682, 276], [700, 279], [710, 292], [704, 305], [690, 312], [690, 330], [693, 350], [688, 374], [670, 392], [640, 399], [600, 399], [560, 394], [526, 384], [508, 350], [512, 300], [520, 240],
    ]), C.skin]],
    shade: [
      [shape([[540, 150], [600, 140], [676, 160], [680, 196], [640, 186], [590, 182], [545, 186]]), C.skinShade, 0.75],
      [shape([[500, 330], [540, 370], [600, 392], [660, 396], [600, 420], [500, 420]]), C.skinShade, 0.5],
      [ellipse(655, 318, 14, 9), C.cheek, 0.35],
    ],
    ol: OLs,
  }), 1);
  // temple / sideburn lock over the back edge of the face
  head.draw(new Part({
    fill: [[shape([[490, 140], [540, 150], [566, 168], [552, 200], [540, 240], [524, 294, 1], [508, 268], [494, 220]]), C.hair]],
    shade: [[shape([[540, 210], [530, 260], [524, 294], [510, 270], [520, 230]]), C.hairShade, 0.9]],
    olFree: [[curve([[566, 168], [552, 200], [540, 240], [524, 294]]) + ' L508 268', C.lineHair, 3]],
  }), 1.5);
  // ear
  head.draw(new Part({
    fill: [[shape([[500, 282], [478, 262], [448, 266], [438, 298], [450, 336], [480, 352], [500, 340], [504, 318]]), C.skin]],
    shade: [[shape([[470, 290], [455, 296], [455, 318], [466, 332], [478, 330], [474, 318], [466, 308], [474, 298]]), C.skinShade, 0.9]],
    ol: OLs,
  }), 2);
  // front fringe lock
  head.draw(new Part({
    fill: [[shape([[600, 136], [646, 140], [676, 154], [694, 180], [703, 217, 1], [688, 200], [672, 192], [674, 176], [652, 160], [610, 152]]), C.hair]],
    shade: [[shape([[650, 150], [680, 168], [696, 196], [703, 217], [688, 200], [672, 186]]), C.hairShade, 0.8]],
    ol: [C.lineHair, 3],
  }), 3);
  // eye (white, pupil, highlight) — scaled for blinks
  const eye = head.bone(621, 259, 4);
  const eyeW = eye.draw(new Part({ fill: [[ellipse(621, 259, 21, 28), C.eyeWhite]], shade: [[ellipse(616, 246, 22, 9), C.eyeShade, 0.6]], ol: [C.lineEye, 2.6] }), 0);
  const pupil = eye.draw(new Part({ fill: [[ellipse(629, 265, 12, 20), C.pupil]], top: [[ellipse(633, 254, 4, 5), C.white]] }), 1);
  const brow = head.draw(new Part({ fill: [[browD(0, 0), C.brow]] }), 5);
  const mouth = head.draw(new Part({ fill: [[mouthD(0.7, 0.6), C.mouth]], shade: [[tongueD(0.7, 0.6), C.tongue]], ol: [C.lineMouth, 2.4] }), 6);
  const lid = head.draw(new Part({ fill: [] }), 7);

  // ----- near arm -----
  const S = [452, 486], E0 = [402, 650], W0 = [492, 744];
  const upper = torso.bone(S[0], S[1], 20);
  upper.draw(new Part({ fill: [[capsule(S[0], S[1], E0[0], E0[1], 30, 27), C.skin]], shade: [[capsule(S[0] - 16, S[1], E0[0] - 14, E0[1], 16, 14), C.skinShade, 0.6]], ol: OLs }), 0);
  // sleeve with patch
  upper.draw(new Part({
    fill: [[shape([[410, 462], [466, 444], [506, 466], [514, 530], [500, 590], [478, 614, 1], [390, 606, 1], [378, 560], [386, 500]]), C.shirt]],
    shade: [[shape([[386, 520], [430, 560], [470, 604], [400, 604]]), C.shirtShade], [poly([[396, 584], [480, 592], [474, 606], [398, 604]], true), C.shirtShade, 0.9]],
    ol: [C.lineShirt, 3.2],
  }), 1);
  upper.draw(new Part({ fill: [[rrect(454, 444, 44, 20, 9), C.epaulette]], shade: [[rrect(454, 456, 44, 8, 4), C.epauletteShade]] }), 2);
  upper.draw(new Part({
    fill: [[shape([[420, 498, 1], [478, 512, 1], [432, 540, 1]]), C.red]],
    shade: [[shape([[428, 504, 1], [466, 513, 1], [434, 532, 1]]), C.orange]],
    top: [[shape([[434, 508, 1], [458, 514, 1], [437, 526, 1]]), C.white]],
    ol: [C.redDark, 2.2],
  }), 3);
  const fore = upper.bone(E0[0], E0[1], 0);
  fore.userData.dl = 2;   // forearm + hand pass in front of the wheel
  fore.draw(new Part({ fill: [[capsule(E0[0], E0[1], W0[0], W0[1], 27, 24), C.skin]], shade: [[capsule(E0[0], E0[1] + 12, W0[0] - 6, W0[1] + 12, 13, 11), C.skinShade, 0.55]], ol: OLs }), 0);
  const hand = fore.bone(W0[0], W0[1], 1);
  // gripping hand: knuckles over the rim
  const grip = hand.draw(new Part({
    fill: [[shape([[470, 728], [508, 718], [540, 730], [556, 760], [552, 790], [530, 802], [500, 800], [478, 780], [468, 752]]), C.skin]],
    shade: [[shape([[468, 760], [500, 790], [540, 800], [520, 812], [470, 800]]), C.skinShade, 0.7]],
    line: [[curve([[518, 772], [532, 778], [544, 776]]), C.lineSkin, 2.4], [curve([[506, 786], [520, 794], [534, 792]]), C.lineSkin, 2.4]],
    ol: OLs,
  }), 0);
  // open hand for waving, authored along the forearm (u) / across (v)
  const fa = Math.atan2(W0[1] - E0[1], W0[0] - E0[0]);
  const UV = (u, v) => [W0[0] + Math.cos(fa) * u - Math.sin(fa) * v, W0[1] + Math.sin(fa) * u + Math.cos(fa) * v, 0];
  const UVs = (u, v) => { const q = UV(u, v); q[2] = 1; return q; };
  const open = hand.draw(new Part({
    fill: [[shape([UV(-4, -22), UV(30, -26), UV(44, -40), UVs(62, -52), UV(64, -40), UV(52, -22), UVs(92, -22), UV(94, -12), UV(58, -8), UVs(100, -2), UV(100, 8), UV(58, 6), UVs(96, 16), UV(94, 26), UV(54, 18), UVs(84, 32), UV(80, 40), UV(40, 30), UV(-4, 22)]), C.skin]],
    shade: [[shape([UV(-4, 6), UV(40, 14), UV(80, 40), UV(40, 30), UV(-4, 22)]), C.skinShade, 0.6]],
    ol: OLs,
  }), 1);
  open.visible = false;

  // ===================== WHEELCHAIR (front parts) =====================
  const chairFront = root.bone(AXLE[0], AXLE[1], 15);
  chairFront.userData.dl = 1;
  // rear wheel (rotating group)
  const wheel = chairFront.bone(AXLE[0], AXLE[1], 0);
  wheel.draw(new Part({ fill: [[ring(AXLE[0], AXLE[1], R_RIM + 2, R_TIRE), C.tire]], shade: [[ring(AXLE[0], AXLE[1], R_TIRE - 9, R_TIRE - 3), C.tireHi, 0.8]], ol: [C.lineBlack, 2.6] }), 0);
  wheel.draw(new Part({ fill: [[ring(AXLE[0], AXLE[1], R_RIM - 22, R_RIM + 4), C.steel]], shade: [[ring(AXLE[0], AXLE[1], R_RIM - 22, R_RIM - 12), C.steelShade]], ol: [C.lineSteel, 2.2] }), 1);
  const spokes = [];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2, a2 = a + 0.42 * (i % 2 ? 1 : -1);
    spokes.push([poly([[AXLE[0] + Math.cos(a) * 30, AXLE[1] + Math.sin(a) * 30], [AXLE[0] + Math.cos(a2) * (R_RIM - 12), AXLE[1] + Math.sin(a2) * (R_RIM - 12)]]), C.spoke, 5]);
  }
  wheel.draw(new Part({ olFree: spokes }), 2);
  wheel.draw(new Part({ fill: [[circle(AXLE[0], AXLE[1], 40), C.hub]], shade: [[circle(AXLE[0] - 6, AXLE[1] - 6, 30), C.hubHi, 0.6]], top: [[circle(AXLE[0], AXLE[1], 11), C.steelShade]], ol: [C.lineBlack, 2.4] }), 3);
  // push rim (slightly inside the tyre, separate ring on stand-offs)
  wheel.draw(new Part({ olFree: [[ring(AXLE[0], AXLE[1], R_RIM - 26, R_RIM - 26).split(' M')[0], C.lineSteel, 13], [ring(AXLE[0], AXLE[1], R_RIM - 26, R_RIM - 26).split(' M')[0], C.rim, 8]] }), 4);
  // frame tubes, armrest, footrest, caster
  const tube = (pts, w = 16) => [[curve(pts), C.lineSteel, w + 5], [curve(pts), C.steel, w]];
  chairFront.draw(new Part({ olFree: [...tube([[560, 708], [680, 714], [760, 760], [796, 850], [806, 960], [820, 1060]]), ...tube([[480, 1000], [700, 1000], [760, 998], [800, 980]], 14)] }), 5);
  chairFront.draw(new Part({ fill: [[rrect(588, 660, 162, 26, 13), C.chairBlack]], shade: [[rrect(588, 674, 162, 12, 6), C.chairBlack2]], ol: [C.lineBlack, 3] }), 6);
  chairFront.draw(new Part({ olFree: tube([[600, 684], [640, 700]], 12) }), 6);
  chairFront.draw(new Part({ fill: [[rrect(740, 1004, 26, 34, 6), C.chairBlack]], ol: [C.lineBlack, 2.4] }), 7);
  chairFront.draw(new Part({ olFree: tube([[752, 1032], [752, 1100]], 12) }), 7);
  const caster = chairFront.bone(CASTER[0], CASTER[1], 8);
  caster.draw(new Part({ fill: [[circle(CASTER[0], CASTER[1], R_CASTER), C.tire]], shade: [[ring(CASTER[0], CASTER[1], R_CASTER - 8, R_CASTER - 3), C.tireHi, 0.7]], ol: [C.lineBlack, 2.4] }), 0);
  caster.draw(new Part({ fill: [[ring(CASTER[0], CASTER[1], 22, 36), C.steelShade]], top: [[circle(CASTER[0], CASTER[1], 12), C.steel], [rrect(CASTER[0] - 4, CASTER[1] - 34, 8, 14, 3), C.steel]] }), 1);
  chairFront.draw(new Part({ fill: [[shape([[828, 1058, 1], [1040, 1062, 1], [1044, 1090, 1], [832, 1086, 1]]), C.chairBlack]], ol: [C.lineBlack, 2.6] }), 3);

  // shoe must sit in front of the footrest: move feet bone to front layer
  const feet = root.bone(AXLE[0], AXLE[1], 16);
  feet.userData.dl = 1;
  const shoe = hip.art.children.find((p) => p.spec && p.spec.fill && p.spec.fill[0][1] === C.shoe);
  hip.art.remove(shoe); feet.draw(shoe, 0);

  // ---------- pose API ----------
  const rest = {
    S, E0, W0,
    upperLen: Math.hypot(E0[0] - S[0], E0[1] - S[1]),
    foreLen: Math.hypot(W0[0] - E0[0], W0[1] - E0[1]),
    upperA: Math.atan2(E0[1] - S[1], E0[0] - S[0]),
    foreA: Math.atan2(W0[1] - E0[1], W0[0] - E0[0]),
  };
  const st = { lean: 0, headTilt: 0, headX: 0, blink: 0, look: [0, 0], open: 0.7, smile: 0.6, browUp: 0, worry: 0, wide: 1 };

  function setExpr() {
    eye.scale.set(1, Math.max(0.06, 1 - st.blink), 1);
    pupil.position.set(st.look[0], st.look[1], 0);
    brow.set({ fill: [[browD(st.browUp, st.worry), C.brow]] });
    mouth.set({ fill: [[mouthD(st.open, st.smile, st.wide), C.mouth]], shade: st.open > 0.12 ? [[tongueD(st.open, st.smile), C.tongue]] : [], ol: [C.lineMouth, 2.4] });
  }
  /** place the hand on the push rim at angle a (radians, 0 = +x, screen y down) given wheel rotation; returns nothing */
  /** IK: put the gripping hand at (tx,ty) in sheet coordinates (torso lean already applied). */
  function handTo(tx, ty, absDelta = 0, wave = 0) {
    const lean = torso.rotation.z, c = Math.cos(lean), s = Math.sin(lean);
    const sx = 520 + (S[0] - 520) * c - (S[1] - 690) * s, sy = 690 + (S[0] - 520) * s + (S[1] - 690) * c;
    const sol = solve2(sx, sy, tx, ty, rest.upperLen, rest.foreLen, 1);
    upper.rotation.z = (sol.a1 - rest.upperA) - lean;
    fore.rotation.z = (sol.a2 - sol.a1) - (rest.foreA - rest.upperA);
    hand.rotation.z = lerp(absDelta - (sol.a2 - rest.foreA), -0.9 + 0.25 * Math.sin(tx * 0.2), wave);
    grip.visible = wave < 0.4; open.visible = !grip.visible;
  }
  setExpr();
  return {
    root, bones: { chairBack, chairFront, wheel, caster, hip, torso, head, eye, upper, fore, hand }, st, setExpr, handTo,
    AXLE, R_TIRE, R_RIM, CASTER, R_CASTER, ground: THEO_GROUND,
  };
}
