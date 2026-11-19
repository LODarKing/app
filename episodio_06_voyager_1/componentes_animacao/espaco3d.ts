// Camada 3D (three.js): renderizador, campo estelar, Via Láctea, poeira com parallax, Terra, Lua e Sol.
// Tudo é posicionado a partir de t — o renderizador não guarda estado entre quadros.
import * as THREE from 'three';
import { W, H, mulberry32 } from './core';

const NOISE = /* glsl */ `
float hash3(vec3 p){ p = fract(p*0.3183099 + vec3(0.11,0.17,0.13)); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float vnoise(vec3 x){ vec3 i=floor(x); vec3 f=fract(x); f=f*f*(3.0-2.0*f);
  return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x), mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x), mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y), f.z); }
float fbm(vec3 p){ float a=0.5, s=0.0; for(int i=0;i<6;i++){ s+=a*vnoise(p); p=p*2.03+vec3(1.7,9.2,3.1); a*=0.5; } return s; }
float fbm3(vec3 p){ float a=0.5, s=0.0; for(int i=0;i<3;i++){ s+=a*vnoise(p); p=p*2.07+vec3(4.1,2.3,7.9); a*=0.5; } return s; }
`;

export class Espaco {
  canvas: HTMLCanvasElement; renderer: THREE.WebGLRenderer; scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(30, W / H, 0.01, 5e6);
  estrelas: THREE.Points; viaLactea: THREE.Mesh; poeira: THREE.Points;
  terra: THREE.Group; terraMat: THREE.ShaderMaterial; atm: THREE.Mesh; lua: THREE.Mesh; luaMat: THREE.ShaderMaterial;
  sol = new THREE.DirectionalLight(0xfff4e6, 3.2); preenche = new THREE.HemisphereLight(0x8fb4ff, 0x090e1a, 0.05);
  solDir = new THREE.Vector3(1, 0, 0);
  apoio = new THREE.DirectionalLight(0xbcd4ff, 0);          // luz de apoio (linguagem de cinema) presa à câmera
  texTerra!: THREE.Texture; texLua!: THREE.Texture;

  static async criar(base: string) {
    const L = new THREE.TextureLoader();
    const [tt, tl] = await Promise.all([L.loadAsync(base + '/terra_blue_marble_2002.jpg'), L.loadAsync(base + '/lua_lroc_2k.jpg')]);
    for (const x of [tt, tl]) { x.colorSpace = THREE.SRGBColorSpace; x.anisotropy = 8; x.generateMipmaps = true; x.minFilter = THREE.LinearMipmapLinearFilter; }
    const e = new Espaco(tt, tl); return e;
  }

  private constructor(tt: THREE.Texture, tl: THREE.Texture) {
    this.texTerra = tt; this.texLua = tl;
    this.canvas = document.createElement('canvas'); this.canvas.width = W; this.canvas.height = H;
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(1); this.renderer.setSize(W, H, false);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace; this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.0;
    this.renderer.setClearColor(new THREE.Color('#090E1A'), 1);
    this.scene.add(this.sol, this.sol.target, this.preenche, this.apoio, this.apoio.target);
    this.estrelas = this.criaEstrelas(); this.viaLactea = this.criaViaLactea(); this.poeira = this.criaPoeira();
    [this.terra, this.terraMat, this.atm] = this.criaTerra(); [this.lua, this.luaMat] = this.criaLua();
    this.scene.add(this.estrelas, this.viaLactea, this.poeira, this.terra, this.lua);
  }

  /** estrelas no infinito: só a rotação da câmera as move (como no espaço real) */
  criaEstrelas() {
    const N = 9000, r = mulberry32(1977), pos = new Float32Array(N * 3), cor = new Float32Array(N * 3), tam = new Float32Array(N);
    const nMW = new THREE.Vector3(0.35, 0.82, -0.45).normalize();
    for (let i = 0; i < N; i++) {
      // concentra parte das estrelas na faixa da Via Láctea
      let v: THREE.Vector3;
      for (;;) { v = new THREE.Vector3(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1); const l = v.length(); if (l > 0.05 && l <= 1) { v.divideScalar(l); const lat = v.dot(nMW); if (r() < 0.35 + 0.65 * Math.exp(-lat * lat / 0.03)) break; } }
      pos.set([v.x, v.y, v.z], i * 3);
      const m = Math.pow(r(), 5.5); tam[i] = 1.1 + m * 5.2;                       // poucas estrelas brilhantes, muitas fracas
      const k = r(); const c = k < 0.15 ? [0.75, 0.85, 1.0] : k < 0.8 ? [1.0, 0.98, 0.95] : k < 0.95 ? [1.0, 0.88, 0.7] : [1.0, 0.75, 0.55];
      const b = 0.28 + 0.72 * Math.pow(r(), 2.2) + m * 0.8; cor.set([c[0] * b, c[1] * b, c[2] * b], i * 3);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('cor', new THREE.BufferAttribute(cor, 3)); g.setAttribute('tam', new THREE.BufferAttribute(tam, 1));
    const m = new THREE.ShaderMaterial({
      uniforms: { uBrilho: { value: 1 }, uEscala: { value: 1 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `attribute vec3 cor; attribute float tam; varying vec3 vC; uniform float uEscala;
        void main(){ vC = cor; vec4 mv = vec4(normalize(mat3(viewMatrix) * position) * 4.0e6, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = tam * uEscala; }`,
      fragmentShader: /* glsl */ `varying vec3 vC; uniform float uBrilho; void main(){ vec2 d = gl_PointCoord - 0.5; float r = length(d) * 2.0;
        float a = smoothstep(1.0, 0.0, r); a = a * a; gl_FragColor = vec4(vC * a * uBrilho, 1.0); }`,
    });
    const p = new THREE.Points(g, m); p.frustumCulled = false; p.renderOrder = -10; return p;
  }

  criaViaLactea() {
    const m = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending, uniforms: { uBrilho: { value: 1 } },
      vertexShader: /* glsl */ `varying vec3 vD; void main(){ vD = position; vec4 mv = vec4(normalize(mat3(viewMatrix) * position) * 3.0e6, 1.0); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: NOISE + /* glsl */ `varying vec3 vD; uniform float uBrilho; void main(){ vec3 d = normalize(vD); vec3 n = normalize(vec3(0.35,0.82,-0.45));
        float lat = dot(d, n); float faixa = exp(-lat*lat/0.018); float nuvem = fbm(d*3.5);
        float poeira = smoothstep(0.48, 0.68, fbm(d*7.0 + 3.1)) * exp(-lat*lat/0.004);
        float I = faixa * (0.35 + 0.9*nuvem) * (1.0 - 0.75*poeira) + 0.06*fbm(d*2.0+9.0);
        vec3 c = mix(vec3(0.55,0.62,0.85), vec3(1.0,0.86,0.7), smoothstep(0.4,0.8,nuvem)) * I * 0.075 * uBrilho;
        gl_FragColor = vec4(c, 1.0); }`,
    });
    const s = new THREE.Mesh(new THREE.SphereGeometry(10, 64, 32), m); s.frustumCulled = false; s.renderOrder = -11; return s;
  }

  /** poeira estilizada perto da câmera: dá a sensação de deslocamento (parallax) — recurso de linguagem, não física */
  criaPoeira() {
    const N = 1400, r = mulberry32(77), pos = new Float32Array(N * 3), br = new Float32Array(N);
    for (let i = 0; i < N; i++) { pos.set([r(), r(), r()], i * 3); br[i] = 0.3 + 0.7 * r(); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('br', new THREE.BufferAttribute(br, 1));
    const m = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uCam: { value: new THREE.Vector3() }, uCaixa: { value: 40 }, uBrilho: { value: 0 } },
      vertexShader: /* glsl */ `attribute float br; varying float vB; uniform vec3 uCam; uniform float uCaixa;
        void main(){ vec3 p = mod(position * uCaixa - uCam, uCaixa) - 0.5*uCaixa + uCam; vec4 mv = viewMatrix * vec4(p, 1.0);
          float z = -mv.z; vB = br * smoothstep(uCaixa*0.5, uCaixa*0.15, z) * smoothstep(0.3, 2.0, z); gl_Position = projectionMatrix * mv; gl_PointSize = clamp(60.0 / z, 1.0, 5.0); }`,
      fragmentShader: /* glsl */ `varying float vB; uniform float uBrilho; void main(){ float r = length(gl_PointCoord-0.5)*2.0; float a = smoothstep(1.0,0.0,r);
        gl_FragColor = vec4(vec3(0.75,0.85,1.0) * a * vB * uBrilho * 0.55, 1.0); }`,
    });
    const p = new THREE.Points(g, m); p.frustumCulled = false; return p;
  }

  criaTerra(): [THREE.Group, THREE.ShaderMaterial, THREE.Mesh] {
    const mat = new THREE.ShaderMaterial({
      uniforms: { uSol: { value: new THREE.Vector3(1, 0, 0) }, uNuvem: { value: 0 }, uMapa: { value: this.texTerra } },
      vertexShader: /* glsl */ `varying vec3 vO; varying vec3 vN; varying vec3 vW; varying vec2 vUv;
        void main(){ vO = position; vUv = uv; vN = normalize(mat3(modelMatrix) * normal); vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: NOISE + /* glsl */ `varying vec3 vO; varying vec3 vN; varying vec3 vW; varying vec2 vUv; uniform vec3 uSol; uniform float uNuvem; uniform sampler2D uMapa;
        void main(){ vec3 p = normalize(vO); vec3 n = normalize(vN); vec3 v = normalize(cameraPosition - vW);
          vec3 c = texture2D(uMapa, vUv).rgb;                       // já linear (sRGB decodificado)
          float agua = smoothstep(0.02, 0.10, c.b - max(c.r, c.g) * 0.9) * step(max(c.r,c.g), 0.06);
          c = mix(c, vec3(0.002,0.012,0.04), agua * 0.55);
          // nuvens procedurais com semente (deriva lenta)
          vec3 q = p + vec3(uNuvem, 0.0, 0.0);
          float nv = smoothstep(0.58, 0.8, fbm(q*vec3(2.2,4.5,2.2)) + 0.35*fbm(q*13.0 + 4.0) - 0.1);
          nv *= 0.55 + 0.45*smoothstep(0.0, 0.5, abs(p.y));
          c = mix(c, vec3(0.86,0.88,0.92), nv*0.85);
          float d = dot(n, uSol); float luz = smoothstep(-0.06, 0.3, d);
          vec3 r = reflect(-uSol, n); float esp = pow(max(dot(r, v), 0.0), 45.0) * agua * (1.0-nv) * 0.7;
          vec3 col = c * luz * 1.55 + esp * vec3(1.0,0.92,0.8) * luz;
          float fr = pow(1.0 - max(dot(n, v), 0.0), 2.4); col += vec3(0.18,0.45,1.0) * fr * smoothstep(-0.2, 0.5, d) * 0.85;
          gl_FragColor = vec4(col, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
    const g = new THREE.Group(); const esf = new THREE.Mesh(new THREE.SphereGeometry(1, 160, 100), mat); g.add(esf);
    const atmMat = new THREE.ShaderMaterial({
      side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uSol: { value: new THREE.Vector3(1, 0, 0) } },
      vertexShader: /* glsl */ `varying vec3 vN; varying vec3 vW; void main(){ vN = normalize(mat3(modelMatrix)*normal); vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
      fragmentShader: /* glsl */ `varying vec3 vN; varying vec3 vW; uniform vec3 uSol; void main(){ vec3 v = normalize(cameraPosition - vW); vec3 n = normalize(vN);
        float k = pow(clamp(0.62 + dot(n, v), 0.0, 1.0), 5.0); float d = smoothstep(-0.35, 0.6, dot(-n, uSol) * -1.0 + 0.2);
        gl_FragColor = vec4(vec3(0.3,0.6,1.0) * k * d * 0.55, 1.0);
        #include <colorspace_fragment>
      }`,
    });
    const atm = new THREE.Mesh(new THREE.SphereGeometry(1.035, 96, 64), atmMat); g.add(atm);
    (g as any).atmMat = atmMat; return [g, mat, atm];
  }

  criaLua(): [THREE.Mesh, THREE.ShaderMaterial] {
    const mat = new THREE.ShaderMaterial({
      uniforms: { uSol: { value: new THREE.Vector3(1, 0, 0) }, uMapa: { value: this.texLua } },
      vertexShader: /* glsl */ `varying vec2 vUv; varying vec3 vN; void main(){ vUv = uv; vN = normalize(mat3(modelMatrix)*normal); gl_Position = projectionMatrix*viewMatrix*modelMatrix*vec4(position,1.0); }`,
      fragmentShader: /* glsl */ `varying vec2 vUv; varying vec3 vN; uniform vec3 uSol; uniform sampler2D uMapa; void main(){
        vec3 c = texture2D(uMapa, vUv).rgb; float d = max(dot(normalize(vN), uSol), 0.0); gl_FragColor = vec4(c * pow(d, 0.75) * 1.6, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    });
    return [new THREE.Mesh(new THREE.SphereGeometry(0.2727, 96, 64), mat), mat];
  }

  /** ajusta o centro óptico (px a partir do topo) — permite casar o ponto 3D com a interface 2D */
  centro(yPx: number) { const off = (H / 2 - yPx) * 2; this.camera.setViewOffset(W, H + Math.abs(off), 0, off > 0 ? off : 0, W, H); }

  render(cfg: { estrelas?: number; via?: number; poeira?: number; poeiraCaixa?: number; terra?: boolean; lua?: boolean; extra?: THREE.Object3D[] }) {
    (this.estrelas.material as THREE.ShaderMaterial).uniforms.uBrilho.value = cfg.estrelas ?? 1;
    (this.viaLactea.material as THREE.ShaderMaterial).uniforms.uBrilho.value = cfg.via ?? 1;
    const pm = this.poeira.material as THREE.ShaderMaterial; pm.uniforms.uBrilho.value = cfg.poeira ?? 0; pm.uniforms.uCam.value.copy(this.camera.position); pm.uniforms.uCaixa.value = cfg.poeiraCaixa ?? 40;
    this.poeira.visible = (cfg.poeira ?? 0) > 0; this.terra.visible = !!cfg.terra; this.lua.visible = !!cfg.lua;
    this.terraMat.uniforms.uSol.value.copy(this.solDir); (this.terra as any).atmMat.uniforms.uSol.value.copy(this.solDir); this.luaMat.uniforms.uSol.value.copy(this.solDir);
    this.sol.position.copy(this.solDir).multiplyScalar(100); this.sol.target.position.set(0, 0, 0);
    this.apoio.position.copy(this.camera.position).add(new THREE.Vector3(-8, 6, 0).applyQuaternion(this.camera.quaternion)); this.apoio.target.position.set(0, 0, 0);
    const extras = cfg.extra ?? []; extras.forEach((o) => this.scene.add(o));
    this.camera.updateMatrixWorld(); this.renderer.render(this.scene, this.camera);
    extras.forEach((o) => this.scene.remove(o));
  }

  /** projeta um ponto 3D na tela (px) */
  proj(p: THREE.Vector3) { const v = p.clone().project(this.camera); return { x: (v.x + 1) / 2 * W, y: (1 - v.y) / 2 * H, z: v.z, frente: v.z < 1 }; }

  /** renderiza objetos isolados (fundo transparente) e devolve um canvas recortado — usado uma vez, na inicialização */
  imagem(objs: THREE.Object3D[], cam: { pos: THREE.Vector3; alvo: THREE.Vector3; fov: number }, sol: THREE.Vector3, tam: number, cfg: { terra?: boolean; apoio?: number } = {}) {
    const vis = this.scene.children.map((o) => o.visible); this.scene.children.forEach((o) => { if (!(o as any).isLight) o.visible = false; });
    objs.forEach((o) => { this.scene.add(o); o.visible = true; });
    if (cfg.terra) { this.terra.visible = true; }
    this.solDir.copy(sol).normalize(); this.terraMat.uniforms.uSol.value.copy(this.solDir); (this.terra as any).atmMat.uniforms.uSol.value.copy(this.solDir);
    this.sol.position.copy(this.solDir).multiplyScalar(100); this.sol.intensity = 3.4; this.preenche.intensity = 0.12;
    const c = new THREE.PerspectiveCamera(cam.fov, 1, 0.01, 1e5); c.position.copy(cam.pos); c.lookAt(cam.alvo); c.updateMatrixWorld();
    this.apoio.intensity = cfg.apoio ?? 0.5; this.apoio.position.copy(c.position).add(new THREE.Vector3(-8, 6, 0).applyQuaternion(c.quaternion));
    this.renderer.setSize(tam, tam, false); this.renderer.setClearColor(0x000000, 0); this.renderer.render(this.scene, c);
    const out = document.createElement('canvas'); out.width = tam; out.height = tam; out.getContext('2d')!.drawImage(this.canvas, 0, 0, tam, tam, 0, 0, tam, tam);
    objs.forEach((o) => this.scene.remove(o)); this.scene.children.forEach((o, i) => (o.visible = vis[i] ?? o.visible));
    this.renderer.setSize(W, H, false); this.renderer.setClearColor(new THREE.Color('#090E1A'), 1); this.apoio.intensity = 0;
    return out;
  }
}
