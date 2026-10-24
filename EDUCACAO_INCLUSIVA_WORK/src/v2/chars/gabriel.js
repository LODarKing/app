// GABRIEL — Desbravador, 3/4 view facing screen-left.
// Sheet: 4x enlargement of the 3/4 view in assets/researched_references/gabriel/02_model_sheet_expressoes_vistas.png
// (mirrored to face left; insignia placed on the correct sides: triangle on his right sleeve, world patch on his left).
import { Part, shape, curve, ellipse, circle, rrect, poly, f, lerp } from '../vec.js';
import { createKid, limbD } from '../rig2.js';
import { C } from '../palette.js';

const G = { hair: '#4E3324', hairShade: '#3B2519', hairHi: '#6A4630', lineHair: '#2E1C12' };

function mouthD(cx, cy, w, open, smile) {
  const bx = cx - w / 2, fx = cx + w / 2;
  const by = cy - 4 * smile + (smile < 0 ? 4 : 0), fy = cy - 7 * smile + (smile < 0 ? 3 : 0);
  const drop = 3 + 44 * open;
  const sag = 3 * Math.max(0, -smile);
  return `M${f(bx)} ${f(by)} C${f(bx + w * 0.3)} ${f(by + 2 + sag)} ${f(fx - w * 0.3)} ${f(fy + 2 + sag)} ${f(fx)} ${f(fy)} `
    + `C${f(fx - 4)} ${f(fy + drop * 0.8)} ${f(cx + w * 0.22)} ${f(cy + drop * 1.15)} ${f(cx)} ${f(cy + drop * 1.1)} `
    + `C${f(cx - w * 0.25)} ${f(cy + drop * 1.1)} ${f(bx + 2)} ${f(by + drop * 0.75)} ${f(bx)} ${f(by)} Z`;
}
function tongue(cx, cy, w, open) {
  const y = cy + 44 * open * 0.62;
  return `M${f(cx - w * 0.4)} ${f(y + 40)} C${f(cx - w * 0.38)} ${f(y)} ${f(cx + w * 0.3)} ${f(y - 6)} ${f(cx + w * 0.42)} ${f(y + 40)} Z`;
}
function brow(x0, x1, y, raise, worry, flipInner) {
  // inner end = toward the nose. flipInner: inner end is on the right (for the far brow)
  const yi = y - raise - 9 * worry, yo = y - raise + 5 * worry;
  const [ya, yb] = flipInner ? [yo, yi] : [yi, yo];
  const t = 9;
  return `M${f(x0)} ${f(ya + 4)} C${f(lerp(x0, x1, 0.3))} ${f(Math.min(ya, yb) - 14)} ${f(lerp(x0, x1, 0.7))} ${f(Math.min(ya, yb) - 14)} ${f(x1)} ${f(yb + 4)} `
    + `C${f(x1 + 2)} ${f(yb + t)} ${f(x1 - 4)} ${f(yb + t + 2)} ${f(x1 - 7)} ${f(yb + t - 1)} C${f(lerp(x0, x1, 0.65))} ${f(Math.min(ya, yb) - 2)} ${f(lerp(x0, x1, 0.35))} ${f(Math.min(ya, yb) - 2)} ${f(x0 + 7)} ${f(ya + t - 1)} C${f(x0 + 2)} ${f(ya + t + 1)} ${f(x0 - 2)} ${f(ya + t)} ${f(x0)} ${f(ya + 4)} Z`;
}
export function trianglePatch(cx, cy, s, rot = 0) {
  const P = (x, y) => [cx + (x * Math.cos(rot) - y * Math.sin(rot)) * s, cy + (x * Math.sin(rot) + y * Math.cos(rot)) * s, 1];
  return new Part({
    fill: [[shape([P(-1, -0.8), P(1, -0.8), P(0, 1)]), C.red]],
    shade: [[shape([P(-0.72, -0.6), P(0.72, -0.6), P(0, 0.62)]), C.yellow]],
    top: [[shape([P(-0.42, -0.42), P(0.42, -0.42), P(0, 0.3)]), C.white]],
    ol: [C.redDark, 2.2],
  });
}
export function worldPatch(cx, cy, r) {
  return new Part({
    fill: [[circle(cx, cy, r), C.orange]],
    shade: [[circle(cx, cy, r * 0.82), C.red], [circle(cx, cy, r * 0.68), '#2F86C9'], [shape([[cx - r * 0.4, cy - r * 0.3], [cx + r * 0.05, cy - r * 0.5], [cx + r * 0.2, cy - r * 0.1], [cx - r * 0.05, cy + r * 0.25], [cx - r * 0.35, cy + r * 0.1]]), '#58B04A'], [shape([[cx + r * 0.25, cy + r * 0.15], [cx + r * 0.5, cy + r * 0.1], [cx + r * 0.4, cy + r * 0.45]]), '#58B04A']],
    ol: [C.redDark, 2],
  });
}

export function createGabriel() {
  const OLs = [C.lineSkin, 3];
  const art = {
    ground: 1280, rootX: 315, hip: [330, 840], neck: [305, 505],
    legs: {
      far: { hip: [272, 862], knee: [268, 1035], ankle: [262, 1200], bend: 1 },
      near: { hip: [395, 862], knee: [405, 1035], ankle: [420, 1200], bend: 1 },
    },
    arms: {
      far: { sh: [205, 600], el: [192, 760], wr: [196, 880] },
      near: { sh: [490, 612], el: [505, 768], wr: [505, 884] },
    },
    legStyle(side, H, K, A) {
      const r = side === 'near' ? [64, 58, 54] : [60, 55, 51];
      const d = limbD(H, K, A, r[0], r[1], r[2]);
      const col = side === 'near' ? C.pants : C.pantsFar;
      const crease = curve([[lerp(H[0], K[0], 0.4) + 18, lerp(H[1], K[1], 0.4)], [K[0] + 16, K[1]], [lerp(K[0], A[0], 0.7) + 14, lerp(K[1], A[1], 0.7)]]);
      return {
        main: {
          fill: [[d, col]],
          shade: [[limbD([H[0] - r[0] * 0.55, H[1]], [K[0] - r[1] * 0.55, K[1]], [A[0] - r[2] * 0.55, A[1]], r[0] * 0.5, r[1] * 0.5, r[2] * 0.5), C.pantsShade, side === 'near' ? 0.9 : 0.6]],
          line: [[crease, C.pantsShade, 2.6]],
          ol: [C.linePants, 3.2],
        },
      };
    },
    armStyle(side, S, E, W) {
      const d = limbD(S, E, W, 30, 28, 24);
      return { fill: [[d, C.skin]], shade: [[limbD([S[0] - 12, S[1]], [E[0] - 12, E[1]], [W[0] - 10, W[1]], 12, 11, 9), C.skinShade, side === 'far' ? 0.9 : 0.6]], ol: OLs };
    },
    drawShoe(side, b) {
      if (side === 'far') {
        b.draw(new Part({
          fill: [[shape([[222, 1196], [298, 1194], [324, 1222], [322, 1270, 1], [160, 1274, 1], [158, 1246], [186, 1224]]), C.shoe]],
          shade: [[poly([[150, 1258], [330, 1256], [330, 1280], [150, 1280]], true), C.shoeSole], [shape([[190, 1226], [240, 1214], [262, 1222], [220, 1236]]), C.shoeHi, 0.7]],
          ol: [C.lineBlack, 3],
        }));
      } else {
        b.draw(new Part({
          fill: [[shape([[370, 1200], [462, 1200], [486, 1236], [486, 1276, 1], [352, 1278, 1], [350, 1240]]), C.shoe]],
          shade: [[poly([[340, 1260], [492, 1260], [492, 1284], [340, 1284]], true), C.shoeSole], [shape([[372, 1226], [420, 1216], [446, 1224], [404, 1238]]), C.shoeHi, 0.7]],
          ol: [C.lineBlack, 3],
        }));
      }
    },
    drawSleeve(side, b) {
      if (side === 'far') {
        b.draw(new Part({
          fill: [[shape([[214, 562], [244, 560], [246, 622], [236, 722, 1], [166, 720, 1], [160, 662], [176, 600]]), C.shirt]],
          shade: [[shape([[150, 640], [200, 690], [240, 722], [150, 730]]), C.shirtShade], [poly([[162, 704], [240, 706], [240, 726], [160, 726]], true), C.shirtShade]],
          ol: [C.lineShirt, 3],
        }), 0);
        b.draw(trianglePatch(186, 648, 20, 0.15), 1);
      } else {
        b.draw(new Part({
          fill: [[shape([[440, 560], [488, 574], [524, 612], [546, 700], [542, 724, 1], [452, 726, 1], [446, 662]]), C.shirt]],
          shade: [[shape([[500, 600], [530, 640], [548, 726], [520, 726], [516, 660]]), C.shirtShade, 0.8], [poly([[450, 706], [546, 704], [546, 730], [450, 730]], true), C.shirtShade]],
          ol: [C.lineShirt, 3],
        }), 0);
        b.draw(worldPatch(500, 650, 25), 1);
      }
    },
    drawHand(side, b) {
      const x = side === 'far' ? 196 : 505, y = side === 'far' ? 880 : 884;
      const s = side === 'far' ? 0.92 : 1;
      const P = (dx, dy) => [x + dx * s, y + dy * s];
      const rest = b.draw(new Part({
        fill: [[shape([P(-24, -6), P(22, -8), P(30, 22), P(28, 56), P(12, 76), P(-10, 74), P(-26, 54), P(-30, 20)]), C.skin]],
        shade: [[shape([P(-30, 20), P(-14, 40), P(-6, 74), P(-26, 54)]), C.skinShade, 0.7]],
        line: [[curve([P(-6, 50), P(-2, 66)]), C.lineSkin, 2.4], [curve([P(8, 48), P(10, 66)]), C.lineSkin, 2.4]],
        ol: OLs,
      }), 0);
      // open palm (wave): fingers up, palm toward camera; authored pointing "down" the forearm like the rest hand
      const wave = b.draw(new Part({
        fill: [[shape([P(-26, -4), P(24, -6), P(30, 30), P(40, 46), P(44, 64, 1), P(34, 62), P(26, 52), P(24, 92, 1), P(14, 96, 1), P(8, 60), P(6, 104, 1), P(-6, 104, 1), P(-8, 62), P(-14, 100, 1), P(-26, 98, 1), P(-24, 56), P(-34, 86, 1), P(-44, 80, 1), P(-32, 30)]), C.skin]],
        shade: [[shape([P(-32, 30), P(-20, 40), P(-24, 98), P(-44, 80)]), C.skinShade, 0.6]],
        ol: OLs,
      }), 1);
      return { rest, wave };
    },
    drawTorso(torso, pelvis) {
      // neck
      torso.draw(new Part({ fill: [[shape([[272, 470], [338, 470], [342, 552], [268, 552]]), C.skin]], shade: [[shape([[262, 470], [346, 470], [346, 520], [262, 528]]), C.skinShade, 0.9]], ol: OLs }), 0);
      // hips (pants top) — covers the leg tops
      pelvis.draw(new Part({
        fill: [[shape([[214, 820, 1], [458, 818, 1], [470, 900], [400, 912], [330, 900], [262, 912], [208, 900]]), C.pants]],
        shade: [[shape([[214, 820], [458, 818], [458, 846], [214, 848]]), C.pantsShade, 0.7]],
        line: [[curve([[452, 846], [446, 900]]), C.pantsShade, 2.6], [curve([[330, 836], [332, 905]]), C.pantsShade, 2.4]],
        ol: [C.linePants, 3.2],
      }), 0);
      // shirt body
      torso.draw(new Part({
        fill: [[shape([[214, 562], [258, 540], [300, 534], [352, 536], [412, 546], [456, 564], [462, 640], [460, 722], [458, 806, 1], [212, 810, 1], [208, 722], [208, 640]]), C.shirt]],
        shade: [[shape([[200, 560], [240, 600], [252, 700], [262, 812], [200, 812]]), C.shirtShade, 0.85], [shape([[420, 760], [462, 740], [462, 812], [380, 812]]), C.shirtShade, 0.6]],
        line: [[curve([[302, 600], [300, 700], [302, 806]]), C.shirtLine, 2.4]],
        ol: [C.lineShirt, 3],
        top: [[circle(302, 742, 4.5), C.button], [circle(302, 782, 4.5), C.button], [circle(302, 664, 4.5), C.button]],
      }), 1);
      // pockets: tag above his right pocket (screen-left), pins above the left one (screen-right)
      for (const [x0, x1] of [[222, 296], [330, 420]]) {
        torso.draw(new Part({
          fill: [[shape([[x0, 652, 1], [x1, 650, 1], [x1 + 1, 716], [x1 - 8, 726, 1], [x0 + 8, 727, 1], [x0, 718]]), C.shirt]],
          shade: [[shape([[x0 - 2, 646], [x1 + 2, 645], [x1 + 2, 672], [x0 - 2, 674]]), C.shirtShade, 0.8]],
          line: [[poly([[x0, 672], [x1, 670]]), C.shirtLine, 2.4]],
          ol: [C.shirtLine, 2.4], top: [[circle((x0 + x1) / 2, 686, 4.5), C.button]],
        }), 2);
      }
      torso.draw(new Part({ fill: [[rrect(232, 626, 56, 16, 5), C.tag]], shade: [[rrect(232, 635, 56, 7, 3), C.tagShade]] }), 3);
      torso.draw(new Part({ fill: [[circle(346, 634, 7), C.pinRed], [circle(364, 634, 7), C.pinBlue], [circle(382, 634, 7), C.pinBlue]], ol: ['#7a6a55', 1.5] }), 3);
      // epaulettes
      torso.draw(new Part({ fill: [[shape([[216, 552], [250, 540], [258, 566], [222, 578]]), C.epaulette]], shade: [[shape([[218, 568], [256, 558], [258, 566], [222, 578]]), C.epauletteShade]] }), 3);
      torso.draw(new Part({ fill: [[shape([[436, 552], [468, 562], [464, 588], [432, 576]]), C.epaulette]], shade: [[shape([[434, 570], [466, 580], [464, 588], [432, 576]]), C.epauletteShade]] }), 3);
      // belt + buckle
      torso.draw(new Part({ fill: [[shape([[212, 798, 1], [458, 796, 1], [460, 830, 1], [214, 834, 1]]), C.belt]], shade: [[poly([[212, 822], [460, 820], [460, 834], [212, 836]], true), '#000000', 0.4]], ol: [C.lineBlack, 2.4] }), 4);
      torso.draw(new Part({ fill: [[rrect(280, 796, 44, 44, 6), C.gold]], shade: [[rrect(304, 796, 20, 44, 4), C.goldShade]], ol: [C.goldLine, 2] }), 5);
      torso.draw(trianglePatch(302, 816, 12), 6);
      // shirt collar points
      torso.draw(new Part({ fill: [[shape([[266, 540], [300, 562], [288, 590, 1], [252, 566]]), C.shirt], [shape([[342, 540], [306, 562], [322, 590, 1], [358, 564]]), C.shirt]], ol: [C.lineShirt, 2.6] }), 6);
      // scarf
      torso.draw(new Part({
        fill: [[shape([[216, 568], [240, 546], [290, 534], [330, 534], [380, 538], [420, 548], [448, 568], [424, 584], [384, 574], [342, 584], [302, 600], [262, 584], [236, 586]]), C.scarf]],
        shade: [[shape([[216, 568], [250, 560], [300, 566], [350, 562], [414, 562], [448, 568], [424, 584], [384, 574], [342, 584], [302, 600], [262, 584], [236, 586]]), C.scarfShade, 0.8]],
        line: [[curve([[236, 578], [262, 584], [300, 600], [340, 584], [380, 572], [420, 584]]), C.red, 3]],
        ol: [C.lineScarf, 3],
      }), 7);
      torso.draw(new Part({
        fill: [[shape([[284, 598], [304, 600], [306, 690], [292, 762, 1], [266, 702]]), C.scarf], [shape([[300, 600], [322, 596], [332, 680], [320, 746, 1], [302, 690]]), C.scarf]],
        shade: [[shape([[300, 600], [322, 596], [332, 680], [320, 746], [302, 690]]), C.scarfShade, 0.85]],
        line: [[curve([[284, 604], [270, 700], [290, 758]]), C.red, 3], [curve([[322, 600], [330, 680], [320, 744]]), C.red, 3]],
        ol: [C.lineScarf, 3],
      }), 8);
      torso.draw(trianglePatch(302, 598, 22), 9);
    },
    drawHead(head) {
      // hair mass (behind)
      head.draw(new Part({
        fill: [[shape([[150, 58, 1], [172, 84], [196, 66], [238, 50], [290, 40], [350, 34], [410, 38], [452, 52], [468, 70], [480, 56, 1], [490, 84], [502, 102], [522, 132], [536, 160], [552, 198, 1], [536, 204], [538, 250], [530, 300], [524, 336], [508, 404], [472, 478, 1], [458, 440], [440, 300], [300, 300], [160, 300], [140, 312], [128, 304, 1], [112, 256], [100, 232, 1], [96, 200], [88, 168, 1], [104, 140], [126, 108], [114, 92, 1], [136, 82]]), G.hair]],
        shade: [[shape([[460, 200], [540, 200], [534, 300], [508, 400], [472, 478], [458, 400]]), G.hairShade], [shape([[96, 170], [140, 200], [150, 300], [128, 304], [100, 230]]), G.hairShade, 0.8]],
        ol: [G.lineHair, 3],
      }), 0);
      // face
      head.draw(new Part({
        fill: [[shape([[150, 214], [210, 204], [300, 198], [400, 194], [470, 214], [490, 262], [495, 330], [490, 400], [470, 444], [438, 470], [390, 492], [300, 502], [210, 490], [140, 452], [106, 410], [93, 370], [98, 330], [120, 300], [140, 262]]), C.skin]],
        shade: [[shape([[440, 220], [490, 260], [494, 400], [470, 444], [440, 470], [462, 400], [470, 320]]), C.skinShade, 0.55], [shape([[180, 470], [300, 492], [400, 484], [438, 470], [390, 504], [300, 512], [200, 500]]), C.skinShade, 0.6]],
        ol: OLs,
      }), 1);
      // ear (near side = screen-right)
      head.draw(new Part({
        fill: [[shape([[486, 336], [514, 318], [546, 326], [560, 362], [554, 400], [528, 420], [498, 414], [486, 394]]), C.skin]],
        shade: [[shape([[512, 342], [534, 344], [540, 372], [528, 396], [514, 390], [522, 370]]), C.skinShade, 0.9]],
        ol: OLs,
      }), 2);
      // fringe over the forehead
      head.draw(new Part({
        fill: [[shape([[104, 206], [150, 150], [250, 128], [380, 122], [470, 146], [504, 196], [508, 250], [498, 300], [484, 334, 1], [472, 286], [456, 240], [436, 214], [400, 204], [364, 208], [330, 224, 1], [318, 206], [290, 212], [252, 238, 1], [236, 218], [206, 226], [166, 266, 1], [160, 242], [142, 258], [132, 290], [120, 304, 1], [110, 252]]), G.hair]],
        shade: [[shape([[420, 150], [500, 196], [506, 250], [484, 334], [470, 270], [450, 230]]), G.hairShade, 0.9], [shape([[150, 160], [250, 146], [320, 150], [250, 170], [180, 180]]), G.hairHi, 0.7], [shape([[340, 140], [430, 150], [460, 168], [400, 166]]), G.hairHi, 0.6]],
        line: [[curve([[270, 150], [262, 200], [252, 236]]), G.hairShade, 3], [curve([[360, 146], [346, 190], [330, 222]]), G.hairShade, 3], [curve([[200, 170], [184, 220], [168, 262]]), G.hairShade, 3], [curve([[420, 160], [440, 186], [452, 230]]), G.hairShade, 3]],
        ol: [G.lineHair, 3],
      }), 3);
      // eyes
      const eyes = [], pupils = [];
      for (const [cx, cy, rx, ry, px, py, prx, pry] of [[207, 332, 20, 28, 210, 337, 15, 23], [363, 332, 23, 28, 366, 337, 18, 23]]) {
        const e = head.bone(cx, cy, 4);
        e.draw(new Part({ fill: [[ellipse(cx, cy, rx, ry), C.eyeWhite]], ol: [C.lineEye, 2.2] }), 0);
        const p = e.draw(new Part({ fill: [[ellipse(px, py, prx, pry), '#1F1611']], shade: [[ellipse(px, py + pry * 0.5, prx, pry * 0.5), '#3A2A20', 0.8]], top: [[circle(px + prx * 0.4, py - pry * 0.42, prx * 0.33), C.white], [circle(px - prx * 0.35, py + pry * 0.45, prx * 0.16), C.white, 0.8]] }), 1);
        eyes.push(e); pupils.push(p);
      }
      const brows = [head.draw(new Part({ fill: [] }), 5), head.draw(new Part({ fill: [] }), 5)];
      head.draw(new Part({ olFree: [[curve([[268, 362], [254, 374], [262, 388], [282, 386]]), C.lineSkin, 3.4]], top: [[ellipse(272, 372, 7, 5), C.white, 0.35]] }), 5);
      const blush = head.draw(new Part({ top: [[ellipse(150, 404, 22, 12), C.cheek, 0.35], [ellipse(430, 404, 22, 12), C.cheek, 0.35]] }), 5);
      const mouth = head.draw(new Part({}), 6);
      const st = { open: 0.7, smile: 0.8, browUp: 0, worry: 0, blink: 0, look: [0, 0] };
      function setExpr() {
        eyes.forEach((e) => e.scale.set(1, Math.max(0.06, 1 - st.blink), 1));
        pupils.forEach((p) => p.position.set(st.look[0], st.look[1], 0));
        brows[0].set({ fill: [[brow(180, 228, 262, st.browUp, st.worry, true), G.hair]] });
        brows[1].set({ fill: [[brow(346, 402, 266, st.browUp, st.worry, false), G.hair]] });
        const md = mouthD(292, 412, 112, st.open, st.smile);
        mouth.set({ fill: [[md, C.mouth]], shade: st.open > 0.12 ? [[tongue(292, 412, 112, st.open), C.tongue]] : [], ol: [C.lineMouth, 2.4] });
      }
      setExpr();
      return { st, setExpr };
    },
  };
  return createKid(art);
}
