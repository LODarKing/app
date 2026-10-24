// DESBRAVADORA — red curly hair, khaki shirt, dark-green skirt, white socks, black shoes. 3/4 view facing screen-left.
// Sheet: 4x enlargement of the 3/4 view in assets/researched_references/desbravadora/guia_consistencia.png.
import { Part, shape, curve, ellipse, circle, rrect, poly, f, lerp, scallop } from '../vec.js';
import { createKid, limbD, along } from '../rig2.js';
import { C } from '../palette.js';
import { trianglePatch, worldPatch } from './gabriel.js';

const H = { hair: '#C9431F', hairShade: '#A8341A', hairDeep: '#8E2A14', hairHi: '#DE5A2E', lineHair: '#7E2410' };
const SK = { skirt: '#22442F', skirtShade: '#193524', skirtHi: '#2C563C', line: '#11261A' };

function mouthD(cx, cy, w, open, smile) {
  const bx = cx - w / 2, fx = cx + w / 2;
  const by = cy + 8 - 5 * smile, fy = cy - 4 - 7 * smile;
  const drop = 3 + 46 * open, sag = 3 * Math.max(0, -smile);
  return `M${f(bx)} ${f(by)} C${f(bx + w * 0.3)} ${f(by - 2 + sag)} ${f(fx - w * 0.3)} ${f(fy + 2 + sag)} ${f(fx)} ${f(fy)} `
    + `C${f(fx - 4)} ${f(fy + drop * 0.85)} ${f(cx + w * 0.2)} ${f(cy + drop * 1.15)} ${f(cx - 2)} ${f(cy + drop * 1.1)} `
    + `C${f(cx - w * 0.28)} ${f(cy + drop * 1.05)} ${f(bx + 2)} ${f(by + drop * 0.7)} ${f(bx)} ${f(by)} Z`;
}
function tongue(cx, cy, w, open) {
  const y = cy + 46 * open * 0.6;
  return `M${f(cx - w * 0.38)} ${f(y + 44)} C${f(cx - w * 0.36)} ${f(y)} ${f(cx + w * 0.3)} ${f(y - 8)} ${f(cx + w * 0.4)} ${f(y + 44)} Z`;
}
function brow(x0, x1, y0, y1, raise, worry, innerRight) {
  const wi = 9 * worry, wo = -5 * worry;
  const ya = y0 - raise - (innerRight ? wo : wi), yb = y1 - raise - (innerRight ? wi : wo);
  const t = 8, top = Math.min(ya, yb) - 12;
  return `M${f(x0)} ${f(ya + 4)} C${f(lerp(x0, x1, 0.3))} ${f(top)} ${f(lerp(x0, x1, 0.7))} ${f(top)} ${f(x1)} ${f(yb + 4)} `
    + `C${f(x1 + 2)} ${f(yb + t)} ${f(x1 - 4)} ${f(yb + t + 2)} ${f(x1 - 7)} ${f(yb + t - 1)} C${f(lerp(x0, x1, 0.65))} ${f(top + 11)} ${f(lerp(x0, x1, 0.35))} ${f(top + 11)} ${f(x0 + 7)} ${f(ya + t - 1)} C${f(x0 + 2)} ${f(ya + t + 1)} ${f(x0 - 2)} ${f(ya + t)} ${f(x0)} ${f(ya + 4)} Z`;
}

export function createGirl() {
  const OLs = [C.lineSkin, 3];
  const art = {
    ground: 1140, rootX: 330, hip: [312, 760], neck: [326, 470],
    legs: {
      far: { hip: [262, 880], knee: [268, 990], ankle: [274, 1090], bend: 1 },
      near: { hip: [368, 880], knee: [372, 990], ankle: [380, 1090], bend: 1 },
    },
    arms: {
      far: { sh: [178, 560], el: [150, 700], wr: [132, 816] },
      near: { sh: [498, 562], el: [512, 702], wr: [516, 818] },
    },
    legStyle(side, Hp, K, A) {
      const d = limbD(Hp, K, A, 33, 30, 25);
      const s0 = along(Hp, K, A, 0.6);
      const sock = limbD(s0, along(Hp, K, A, 0.8), A, 28, 27, 26);
      return {
        main: { fill: [[d, side === 'near' ? C.skin : '#F4B67C']], shade: [[limbD([Hp[0] + 12, Hp[1]], [K[0] + 12, K[1]], [A[0] + 10, A[1]], 14, 12, 10), C.skinShade, 0.6]], ol: OLs },
        extra: { fill: [[sock, '#FFFFFF']], shade: [[limbD([s0[0] + 14, s0[1]], [K[0] + 14, K[1] + 200], [A[0] + 12, A[1]], 12, 12, 12), '#E4E6EA']], line: [[curve([[s0[0] - 26, s0[1] + 14], [s0[0], s0[1] + 18], [s0[0] + 26, s0[1] + 14]]), '#D5D8DE', 3]], ol: ['#B9BEC6', 2.6] },
      };
    },
    armStyle(side, S, E, W) {
      const d = limbD(S, E, W, 29, 27, 24);
      return { fill: [[d, side === 'near' ? C.skin : '#F4B67C']], shade: [[limbD([S[0] + 11, S[1]], [E[0] + 11, E[1]], [W[0] + 9, W[1]], 11, 10, 8), C.skinShade, 0.6]], ol: OLs };
    },
    drawShoe(side, b) {
      // Mary-Jane shoes with a strap, toe pointing screen-left
      const x = side === 'far' ? 274 : 380, y = side === 'far' ? 1090 : 1090;
      const P = (dx, dy) => [x + dx, y + dy];
      b.draw(new Part({
        fill: [[shape([P(-30, -6), P(30, -8), P(48, 18), P(46, 46, 1), P(-74, 48, 1), P(-82, 30), P(-60, 8)]), C.shoe]],
        shade: [[poly([P(-90, 36), P(50, 36), P(50, 54), P(-90, 54)], true), C.shoeSole], [shape([P(-64, 12), P(-30, 4), P(-14, 12), P(-46, 22)]), C.shoeHi, 0.8]],
        top: [[shape([P(-32, -2), P(28, -4), P(26, 8), P(-30, 10)]), '#FFFFFF']],
        ol: [C.lineBlack, 3],
      }));
    },
    drawSleeve(side, b) {
      if (side === 'far') {
        b.draw(new Part({
          fill: [[shape([[186, 520], [222, 520], [226, 580], [214, 656, 1], [138, 652, 1], [134, 600], [150, 548]]), C.shirt]],
          shade: [[shape([[200, 520], [226, 560], [226, 656], [190, 656]]), C.shirtShade, 0.8], [poly([[134, 636], [220, 640], [220, 660], [134, 660]], true), C.shirtShade]],
          ol: [C.lineShirt, 3],
        }), 0);
        b.draw(trianglePatch(160, 592, 17, 0.25), 1);
      } else {
        b.draw(new Part({
          fill: [[shape([[452, 512], [500, 524], [532, 560], [548, 640], [542, 658, 1], [466, 660, 1], [458, 600]]), C.shirt]],
          shade: [[shape([[510, 540], [540, 580], [550, 660], [524, 660], [520, 600]]), C.shirtShade, 0.8], [poly([[460, 640], [548, 638], [548, 664], [460, 664]], true), C.shirtShade]],
          ol: [C.lineShirt, 3],
        }), 0);
        b.draw(worldPatch(500, 586, 27), 1);
      }
    },
    drawHand(side, b) {
      const x = side === 'far' ? 132 : 516, y = side === 'far' ? 816 : 818;
      const P = (dx, dy) => [x + dx * 0.9, y + dy * 0.9];
      const rest = b.draw(new Part({
        fill: [[shape([P(-24, -6), P(22, -8), P(30, 22), P(28, 56), P(12, 76), P(-10, 74), P(-26, 54), P(-30, 20)]), side === 'near' ? C.skin : '#F4B67C']],
        shade: [[shape([P(30, 20), P(14, 40), P(6, 74), P(26, 54)]), C.skinShade, 0.7]],
        line: [[curve([P(-6, 50), P(-2, 66)]), C.lineSkin, 2.2], [curve([P(8, 48), P(10, 66)]), C.lineSkin, 2.2]],
        ol: OLs,
      }), 0);
      const wave = b.draw(new Part({
        fill: [[shape([P(-26, -4), P(24, -6), P(30, 30), P(40, 46), P(44, 64, 1), P(34, 62), P(26, 52), P(24, 92, 1), P(14, 96, 1), P(8, 60), P(6, 104, 1), P(-6, 104, 1), P(-8, 62), P(-14, 100, 1), P(-26, 98, 1), P(-24, 56), P(-34, 86, 1), P(-44, 80, 1), P(-32, 30)]), C.skin]],
        shade: [[shape([P(-32, 30), P(-20, 40), P(-24, 98), P(-44, 80)]), C.skinShade, 0.6]],
        ol: OLs,
      }), 1);
      return { rest, wave };
    },
    drawTorso(torso, pelvis) {
      // big curly hair mass behind the body (rides on the torso so it sways with it)
      const hairBack = torso.bone(torso.pivot[0], torso.pivot[1], -10);
      hairBack.draw(new Part({
        fill: [[scallop([[330, 30], [420, 32], [500, 66], [566, 120], [612, 190], [646, 260], [672, 340], [684, 430], [694, 510], [680, 590], [640, 650], [580, 664], [530, 610], [470, 560], [330, 560], [190, 570], [150, 650], [86, 668], [36, 610], [20, 510], [30, 410], [56, 316], [96, 216], [150, 132], [236, 62]], 24, 26, 7), H.hair]],
        shade: [[shape([[24, 420], [80, 470], [140, 560], [180, 600], [140, 660], [60, 650], [24, 560]]), H.hairShade, 0.9], [shape([[560, 300], [680, 380], [694, 560], [640, 660], [560, 640], [540, 480]]), H.hairShade, 0.9]],
        line: [
          [curve([[60, 470], [80, 500], [66, 540], [86, 580]]), H.hairDeep, 3.4], [curve([[110, 380], [130, 420], [116, 460], [140, 500]]), H.hairDeep, 3.4],
          [curve([[620, 400], [640, 440], [624, 480], [648, 520]]), H.hairDeep, 3.4], [curve([[600, 520], [620, 560], [602, 600], [624, 640]]), H.hairDeep, 3.4],
          [curve([[90, 300], [100, 340], [84, 380]]), H.hairDeep, 3], [curve([[650, 300], [664, 340], [652, 380]]), H.hairDeep, 3],
        ],
        ol: [H.lineHair, 3],
      }), -5);
      torso.draw(new Part({ fill: [[shape([[292, 440], [364, 440], [368, 520], [288, 520]]), C.skin]], shade: [[shape([[282, 440], [372, 440], [372, 494], [282, 500]]), C.skinShade, 0.9]], ol: OLs }), 0);
      // skirt (on the pelvis, sways with steps)
      const skirt = pelvis.draw(new Part({}, true), 0);
      // shirt
      torso.draw(new Part({
        fill: [[shape([[176, 524], [230, 504], [300, 494], [380, 498], [452, 510], [490, 532], [480, 620], [470, 700], [462, 748, 1], [190, 748, 1], [184, 690], [178, 600]]), C.shirt]],
        shade: [[shape([[170, 520], [210, 560], [222, 660], [236, 752], [170, 752]]), C.shirtShade, 0.85], [shape([[430, 700], [480, 680], [470, 752], [390, 752]]), C.shirtShade, 0.6]],
        line: [[curve([[318, 560], [316, 650], [318, 748]]), C.shirtLine, 2.4]],
        ol: [C.lineShirt, 3],
        top: [[circle(318, 690, 4.5), C.button], [circle(318, 726, 4.5), C.button]],
      }), 1);
      for (const [x0, x1] of [[214, 290], [340, 412]]) {
        torso.draw(new Part({
          fill: [[shape([[x0, 600, 1], [x1, 598, 1], [x1 + 1, 654], [x1 - 8, 664, 1], [x0 + 8, 665, 1], [x0, 656]]), C.shirt]],
          shade: [[shape([[x0 - 2, 594], [x1 + 2, 593], [x1 + 2, 618], [x0 - 2, 620]]), C.shirtShade, 0.8]],
          line: [[poly([[x0, 618], [x1, 616]]), C.shirtLine, 2.4]],
          ol: [C.shirtLine, 2.4], top: [[circle((x0 + x1) / 2, 630, 4.5), C.button]],
        }), 2);
      }
      torso.draw(new Part({ fill: [[rrect(222, 576, 50, 15, 5), C.tag]], shade: [[rrect(222, 584, 50, 7, 3), C.tagShade]] }), 3);
      torso.draw(new Part({ fill: [[circle(352, 584, 7), C.pinRed], [circle(370, 584, 7), C.pinBlue], [circle(388, 584, 7), C.pinBlue]] }), 3);
      torso.draw(new Part({ fill: [[shape([[180, 516], [214, 506], [222, 532], [186, 544]]), C.epaulette]] }), 3);
      torso.draw(new Part({ fill: [[shape([[450, 506], [484, 516], [478, 540], [446, 530]]), C.epaulette]] }), 3);
      torso.draw(new Part({ fill: [[shape([[192, 716, 1], [444, 714, 1], [446, 748, 1], [194, 750, 1]]), C.belt]], ol: [C.lineBlack, 2.4] }), 4);
      torso.draw(new Part({ fill: [[rrect(296, 712, 42, 40, 6), C.gold]], shade: [[rrect(318, 712, 20, 40, 4), C.goldShade]], ol: [C.goldLine, 2] }), 5);
      torso.draw(trianglePatch(317, 730, 11), 6);
      torso.draw(new Part({ fill: [[shape([[288, 500], [318, 522], [306, 550, 1], [272, 526]]), C.shirt], [shape([[352, 500], [324, 522], [338, 550, 1], [372, 526]]), C.shirt]], ol: [C.lineShirt, 2.6] }), 6);
      torso.draw(new Part({
        fill: [[shape([[236, 528], [260, 506], [310, 496], [350, 496], [400, 500], [438, 512], [458, 530], [432, 546], [396, 536], [356, 546], [318, 562], [280, 546], [256, 548]]), C.scarf]],
        shade: [[shape([[236, 528], [270, 522], [320, 528], [370, 524], [430, 524], [458, 530], [432, 546], [396, 536], [356, 546], [318, 562], [280, 546], [256, 548]]), C.scarfShade, 0.8]],
        line: [[curve([[256, 540], [282, 548], [318, 564], [356, 548], [396, 538], [432, 548]]), C.red, 3]],
        ol: [C.lineScarf, 3],
      }), 7);
      torso.draw(new Part({
        fill: [[shape([[302, 560], [320, 562], [322, 640], [306, 696, 1], [284, 640]]), C.scarf], [shape([[318, 562], [338, 558], [348, 630], [334, 684, 1], [320, 640]]), C.scarf]],
        shade: [[shape([[318, 562], [338, 558], [348, 630], [334, 684], [320, 640]]), C.scarfShade, 0.85]],
        line: [[curve([[302, 566], [288, 640], [306, 692]]), C.red, 3], [curve([[338, 562], [346, 630], [334, 682]]), C.red, 3]],
        ol: [C.lineScarf, 3],
      }), 8);
      torso.draw(trianglePatch(320, 556, 21), 9);
      // front lock over the far shoulder
      torso.draw(new Part({
        fill: [[scallop([[150, 470], [200, 500], [214, 560], [196, 620], [150, 650], [104, 630], [96, 560], [110, 500]], 12, 13, 3), H.hair]],
        shade: [[shape([[96, 560], [140, 580], [190, 620], [150, 660], [96, 640]]), H.hairShade, 0.9]],
        line: [[curve([[150, 520], [170, 560], [150, 600], [170, 640]]), H.hairDeep, 3]],
        ol: [H.lineHair, 3],
      }), 12);
      skirt.userData.update = (sway) => {
        const s = sway;
        const hem = [[160 + s * 10, 956], [488 + s * 14, 954]];
        const d = shape([[194, 744, 1], [446, 742, 1], [470, 840], [hem[1][0], hem[1][1], 1], [324 + s * 12, 962], [hem[0][0], hem[0][1], 1], [176, 840]]);
        const pleats = [0.18, 0.36, 0.54, 0.72].map((k) => [curve([[lerp(206, 436, k), 752], [lerp(170, 482, k) + s * 12 * k, 950]]), SK.line, 2.4]);
        skirt.set({
          fill: [[d, SK.skirt]],
          shade: [[shape([[194, 744], [446, 742], [446, 772], [194, 774]]), SK.skirtShade, 0.8], ...[0.18, 0.54].map((k) => [shape([[lerp(206, 436, k), 752], [lerp(206, 436, k + 0.17), 752], [lerp(170, 482, k + 0.17) + s * 12, 952], [lerp(170, 482, k) + s * 12, 952]]), SK.skirtShade, 0.8])],
          line: pleats,
          ol: [SK.line, 3],
        });
      };
      skirt.userData.update(0);
      art.skirt = skirt;
    },
    drawHead(head) {
      head.draw(new Part({
        fill: [[shape([[130, 300], [180, 230], [260, 180], [360, 150], [440, 166], [500, 226], [530, 300], [532, 362], [512, 424], [480, 462], [430, 500], [370, 530], [300, 540], [230, 522], [170, 482], [126, 432], [110, 382], [114, 334]]), C.skin]],
        shade: [[shape([[440, 200], [530, 300], [520, 420], [480, 462], [470, 380], [480, 300]]), C.skinShade, 0.5], [shape([[200, 500], [300, 532], [380, 522], [430, 500], [380, 548], [300, 556], [220, 540]]), C.skinShade, 0.6]],
        ol: OLs,
      }), 1);
      head.draw(new Part({
        fill: [[shape([[492, 330], [520, 304], [548, 318], [556, 356], [548, 392], [520, 404], [496, 392]]), C.skin]],
        shade: [[shape([[516, 330], [536, 336], [538, 366], [526, 384], [514, 378], [522, 356]]), C.skinShade, 0.9]],
        ol: OLs,
      }), 2);
      // top of head + sweeping fringe (front)
      head.draw(new Part({
        fill: [[scallop([[120, 260], [150, 170], [220, 90], [330, 40], [440, 46], [530, 96], [580, 170], [600, 260], [590, 330], [556, 300], [524, 330], [508, 284], [474, 236], [430, 196], [390, 158], [350, 196], [300, 226], [250, 250], [200, 272], [160, 300], [130, 330]], 30, 9, 11), H.hair]],
        shade: [[shape([[380, 160], [470, 230], [520, 320], [560, 300], [600, 280], [560, 200], [460, 150]]), H.hairShade, 0.8], [shape([[200, 110], [300, 70], [380, 66], [300, 100], [230, 140]]), H.hairHi, 0.8]],
        line: [[curve([[380, 70], [340, 130], [290, 200], [230, 250]]), H.hairDeep, 3], [curve([[440, 80], [430, 140], [470, 200], [500, 260]]), H.hairDeep, 3], [curve([[250, 110], [220, 170], [170, 230]]), H.hairDeep, 3]],
        ol: [H.lineHair, 3],
      }), 3);
      const eyes = [], pupils = [];
      for (const [cx, cy, rx, ry, px, py, prx, pry] of [[208, 328, 20, 31, 213, 333, 16, 24], [378, 326, 22, 30, 378, 330, 18, 24]]) {
        const e = head.bone(cx, cy, 4);
        e.draw(new Part({ fill: [[ellipse(cx, cy, rx, ry), C.eyeWhite]], ol: [C.lineEye, 2.2] }), 0);
        const p = e.draw(new Part({ fill: [[ellipse(px, py, prx, pry), '#4A2A18']], shade: [[ellipse(px, py + pry * 0.5, prx, pry * 0.5), '#6B4128', 0.8]], top: [[circle(px + prx * 0.4, py - pry * 0.42, prx * 0.33), C.white], [circle(px - prx * 0.35, py + pry * 0.45, prx * 0.16), C.white, 0.8]] }), 1);
        eyes.push(e); pupils.push(p);
      }
      const brows = [head.draw(new Part({}), 5), head.draw(new Part({}), 5)];
      head.draw(new Part({ olFree: [[curve([[284, 350], [270, 362], [278, 374], [298, 372]]), C.lineSkin, 3.2]] }), 5);
      head.draw(new Part({ top: [[ellipse(160, 414, 22, 12), C.cheek, 0.4], [ellipse(440, 410, 22, 12), C.cheek, 0.4]] }), 5);
      const mouth = head.draw(new Part({}), 6);
      const st = { open: 0.7, smile: 0.8, browUp: 0, worry: 0, blink: 0, look: [0, 0] };
      function setExpr() {
        eyes.forEach((e) => e.scale.set(1, Math.max(0.06, 1 - st.blink), 1));
        pupils.forEach((p) => p.position.set(st.look[0], st.look[1], 0));
        brows[0].set({ fill: [[brow(180, 224, 268, 254, st.browUp, st.worry, true), H.hairDeep]] });
        brows[1].set({ fill: [[brow(362, 424, 240, 258, st.browUp, st.worry, false), H.hairDeep]] });
        mouth.set({ fill: [[mouthD(300, 404, 104, st.open, st.smile), C.mouth]], shade: st.open > 0.12 ? [[tongue(300, 404, 104, st.open), C.tongue]] : [], ol: [C.lineMouth, 2.4] });
      }
      setExpr();
      return { st, setExpr };
    },
  };
  const kid = createKid(art);
  const baseApply = kid.apply;
  kid.apply = () => { baseApply(); art.skirt.userData.update(kid.pose.skirtSway || 0); };
  kid.apply();
  return kid;
}
