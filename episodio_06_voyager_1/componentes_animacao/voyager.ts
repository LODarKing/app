// Modelo 3D programático da Voyager 1 (unidades em metros), a partir das referências públicas da NASA/JPL:
// antena de alto ganho de 3,7 m com sub-refletor, barramento decagonal com mantas térmicas e o Disco de Ouro,
// lança dos 3 RTGs (geradores de radioisótopo, com aletas), lança de ciência com a plataforma de varredura (câmeras),
// lança do magnetômetro (~13 m) e as duas antenas de ondas de plasma/rádio (~10 m) em "V".
// Eixo +Z = eixo da antena (aponta para a Terra — e, a 173 UA, praticamente também para o Sol).
import * as THREE from 'three';

const mat = (c: number, r = 0.6, m = 0.1, extra: THREE.MeshStandardMaterialParameters = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, ...extra });

function tubo(a: THREE.Vector3, b: THREE.Vector3, r: number, m: THREE.Material, lados = 8) {
  const d = b.clone().sub(a), L = d.length(); const g = new THREE.CylinderGeometry(r, r, L, lados, 1);
  const o = new THREE.Mesh(g, m); o.position.copy(a).addScaledVector(d, 0.5); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return o;
}

export function criarVoyager() {
  const V = new THREE.Group();
  const branco = mat(0xe9e7df, 0.55, 0.05, { side: THREE.DoubleSide });
  const brancoV = mat(0xd8d6cf, 0.7, 0.05);
  const ouro = mat(0xc8993c, 0.32, 0.75);
  const preto = mat(0x15161a, 0.85, 0.1);
  const cinza = mat(0x8a8c90, 0.5, 0.5);
  const escuro = mat(0x2d2f34, 0.6, 0.4);
  const disco = mat(0xd9b04f, 0.22, 0.95);

  // --- antena de alto ganho (paraboloide raso, f ≈ 1,2 m, D = 3,66 m)
  const f = 1.2, R = 1.83, pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 40; i++) { const r = (i / 40) * R; pts.push(new THREE.Vector2(Math.max(r, 0.001), (r * r) / (4 * f))); }
  const prato = new THREE.Mesh(new THREE.LatheGeometry(pts, 96), branco); prato.rotation.x = Math.PI / 2; // eixo do torno (Y) -> Z
  V.add(prato);
  const prof = (R * R) / (4 * f);
  const aro = new THREE.Mesh(new THREE.TorusGeometry(R, 0.025, 8, 96), brancoV); aro.position.z = prof; V.add(aro);
  // nervuras radiais no verso
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    const p1 = new THREE.Vector3(c * 0.35, s * 0.35, (0.35 * 0.35) / (4 * f) - 0.03), p2 = new THREE.Vector3(c * R * 0.98, s * R * 0.98, prof - 0.03);
    V.add(tubo(p1, p2, 0.018, brancoV, 5));
  }
  // sub-refletor no foco, preso por 4 hastes; corneta de alimentação no centro
  const sub = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.2, 0.06, 32), brancoV); sub.rotation.x = Math.PI / 2; sub.position.z = f; V.add(sub);
  for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI * 2 + Math.PI / 4; V.add(tubo(new THREE.Vector3(Math.cos(a) * 1.05, Math.sin(a) * 1.05, (1.05 * 1.05) / (4 * f)), new THREE.Vector3(Math.cos(a) * 0.2, Math.sin(a) * 0.2, f), 0.016, brancoV, 5)); }
  const corneta = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, 0.42, 20), brancoV); corneta.rotation.x = Math.PI / 2; corneta.position.z = 0.24; V.add(corneta);
  const lga = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.18, 20, 1, true), brancoV); lga.rotation.x = -Math.PI / 2; lga.position.z = f + 0.12; V.add(lga);

  // --- barramento decagonal (1,78 m entre faces, 0,47 m de altura), logo atrás do prato
  const zb0 = -0.62, zb1 = -0.15, rb = 0.9;
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2, larg = 2 * rb * Math.tan(Math.PI / 10) * 0.995;
    const p = new THREE.Mesh(new THREE.BoxGeometry(larg, zb1 - zb0, 0.03), k % 3 === 0 ? preto : ouro);
    const ap = rb * Math.cos(Math.PI / 10);
    p.position.set(Math.cos(a) * ap, Math.sin(a) * ap, (zb0 + zb1) / 2); p.rotation.z = a + Math.PI / 2; p.rotateX(Math.PI / 2); V.add(p);
    if (k === 6) { // Disco de Ouro, preso numa face do barramento
      const d = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.155, 0.02, 40), disco); d.position.set(Math.cos(a) * (ap + 0.03), Math.sin(a) * (ap + 0.03), (zb0 + zb1) / 2);
      d.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(Math.cos(a), Math.sin(a), 0)); V.add(d);
    }
  }
  for (const z of [zb0, zb1]) { const tampa = new THREE.Mesh(new THREE.CylinderGeometry(rb, rb, 0.03, 10), z === zb0 ? preto : escuro); tampa.rotation.x = Math.PI / 2; tampa.rotation.y = Math.PI / 10; tampa.position.z = z; V.add(tampa); }
  // tanque/propulsores sob o barramento
  const bocal = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 0.25, 20), escuro); bocal.rotation.x = Math.PI / 2; bocal.position.z = zb0 - 0.13; V.add(bocal);

  // --- lança dos RTGs (para -X, levemente para trás) com 3 geradores em linha
  const b0 = new THREE.Vector3(-0.85, -0.1, -0.45), dirR = new THREE.Vector3(-1, -0.12, -0.22).normalize();
  V.add(tubo(b0, b0.clone().addScaledVector(dirR, 3.1), 0.035, cinza, 6));
  V.add(tubo(b0.clone().add(new THREE.Vector3(0, 0.12, 0)), b0.clone().addScaledVector(dirR, 1.4), 0.02, cinza, 5));
  for (let k = 0; k < 3; k++) {
    const c = b0.clone().addScaledVector(dirR, 1.55 + k * 0.56); const g = new THREE.Group(); g.position.copy(c); g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirR);
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.5, 24), escuro));
    for (let j = 0; j < 6; j++) { const fin = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.44, 0.2), escuro); const a = (j / 6) * Math.PI * 2; fin.position.set(Math.cos(a) * 0.29, 0, Math.sin(a) * 0.29); fin.rotation.y = -a; g.add(fin); }
    V.add(g);
  }

  // --- lança de ciência (para +X) com instrumentos e a plataforma de varredura na ponta
  const s0 = new THREE.Vector3(0.85, 0.05, -0.4), dirS = new THREE.Vector3(1, 0.08, -0.12).normalize(), s1 = s0.clone().addScaledVector(dirS, 2.4);
  V.add(tubo(s0, s1, 0.04, cinza, 6));
  const crs = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 0.3), ouro); crs.position.copy(s0.clone().addScaledVector(dirS, 0.9)).add(new THREE.Vector3(0, 0.2, 0)); V.add(crs);
  const lecp = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.3, 16), escuro); lecp.position.copy(s0.clone().addScaledVector(dirS, 1.55)).add(new THREE.Vector3(0, 0.18, 0)); V.add(lecp);
  const plat = new THREE.Group(); plat.position.copy(s1);
  const caixa = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.42, 0.45), preto); plat.add(caixa);
  const nac = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.95, 20), brancoV); nac.rotation.x = Math.PI / 2; nac.position.set(0.1, 0.12, 0.55); plat.add(nac);
  const wac = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.55, 20), brancoV); wac.rotation.x = Math.PI / 2; wac.position.set(-0.12, 0.12, 0.38); plat.add(wac);
  const iris = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.3, 24), ouro); iris.rotation.x = Math.PI / 2; iris.position.set(0.05, -0.18, 0.35); plat.add(iris);
  V.add(plat);

  // --- lança do magnetômetro (~13 m, treliça fina) com sensores
  const m0 = new THREE.Vector3(0.3, 0.85, -0.45), dirM = new THREE.Vector3(0.18, 1, -0.32).normalize(), m1 = m0.clone().addScaledVector(dirM, 13);
  V.add(tubo(m0, m1, 0.03, cinza, 3));
  for (const k of [6.5, 13]) { const sen = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.22, 12), brancoV); sen.position.copy(m0.clone().addScaledVector(dirM, k)); sen.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirM); V.add(sen); }

  // --- antenas de ondas de plasma / radioastronomia (~10 m, em "V", para trás e para baixo)
  const a0 = new THREE.Vector3(-0.2, -0.75, -0.6);
  for (const sx of [-1, 1]) { const d = new THREE.Vector3(sx * 0.7, -0.55, -0.45).normalize(); V.add(tubo(a0, a0.clone().addScaledVector(d, 10), 0.022, brancoV, 4)); }

  V.traverse((o) => { if ((o as THREE.Mesh).isMesh) { (o as THREE.Mesh).castShadow = false; } });
  return V;
}
