// Júpiter e Saturno em 3D procedural (faixas com turbulência por ruído com semente; anéis de Saturno com divisões).
// Representações estilizadas, usadas pequenas na linha do tempo — não são imagens reais.
import * as THREE from 'three';

const NOISE = /* glsl */ `
float hash3(vec3 p){ p = fract(p*0.3183099 + vec3(0.11,0.17,0.13)); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float vnoise(vec3 x){ vec3 i=floor(x); vec3 f=fract(x); f=f*f*(3.0-2.0*f);
  return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x), mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x), mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y), f.z); }
float fbm(vec3 p){ float a=0.5, s=0.0; for(int i=0;i<5;i++){ s+=a*vnoise(p); p=p*2.03+vec3(1.7,9.2,3.1); a*=0.5; } return s; }`;

function gigante(cores: [number, number, number][], mancha: boolean, sol: THREE.Vector3) {
  const pal = cores.map((c) => new THREE.Vector3(...c));
  return new THREE.ShaderMaterial({
    uniforms: { uSol: { value: sol.clone().normalize() }, c0: { value: pal[0] }, c1: { value: pal[1] }, c2: { value: pal[2] }, uMancha: { value: mancha ? 1 : 0 } },
    vertexShader: /* glsl */ `varying vec3 vO; varying vec3 vN; varying vec3 vW; void main(){ vO = position; vN = normalize(mat3(modelMatrix)*normal); vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: NOISE + /* glsl */ `varying vec3 vO; varying vec3 vN; varying vec3 vW; uniform vec3 uSol, c0, c1, c2; uniform float uMancha;
      void main(){ vec3 p = normalize(vO); float lat = p.y + 0.06*fbm(p*vec3(3.0,14.0,3.0)) - 0.03;
        float b = sin(lat*22.0) * 0.5 + 0.5; float b2 = sin(lat*47.0 + 1.3) * 0.5 + 0.5;
        vec3 c = mix(c0, c1, b); c = mix(c, c2, b2*0.35);
        if (uMancha > 0.5) { vec2 d = vec2(atan(p.z, p.x) - 0.6, (p.y + 0.38) * 2.2); float m = smoothstep(0.32, 0.18, length(d)); c = mix(c, vec3(0.62,0.28,0.16), m*0.85); }
        float l = max(dot(normalize(vN), uSol), 0.0); vec3 v = normalize(cameraPosition - vW); float limbo = pow(max(dot(normalize(vN), v), 0.0), 0.35);
        gl_FragColor = vec4(c * (0.04 + 1.25*l) * limbo, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}

export function criarJupiter(sol: THREE.Vector3) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), gigante([[0.78, 0.66, 0.52], [0.52, 0.36, 0.24], [0.92, 0.88, 0.8]], true, sol));
  m.rotation.z = 0.05; return m;
}
export function criarSaturno(sol: THREE.Vector3) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), gigante([[0.86, 0.78, 0.58], [0.72, 0.62, 0.42], [0.95, 0.9, 0.76]], false, sol)));
  const anel = new THREE.ShaderMaterial({
    side: THREE.DoubleSide, transparent: true, depthWrite: false, uniforms: { uSol: { value: sol.clone().normalize() } },
    vertexShader: /* glsl */ `varying vec3 vP; varying vec3 vW; void main(){ vP = position; vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: /* glsl */ `varying vec3 vP; varying vec3 vW; uniform vec3 uSol; void main(){ float r = length(vP.xy);
      float a = smoothstep(1.24,1.30,r) * (1.0 - smoothstep(2.20,2.27,r));
      a *= 0.55 + 0.45*sin(r*38.0)*sin(r*11.0+1.0);
      a *= 1.0 - 0.92*(smoothstep(1.93,1.95,r) - smoothstep(2.0,2.02,r));          // divisão de Cassini
      a *= mix(0.35, 1.0, smoothstep(1.5,1.6,r));
      // sombra do planeta no anel (lado oposto ao Sol)
      vec3 w = vW; float t = -dot(w, uSol); float d = length(w + uSol*t); float sombra = (t > 0.0 && d < 1.0) ? 0.25 : 1.0;
      vec3 c = vec3(0.86,0.78,0.62) * sombra; gl_FragColor = vec4(c, a*0.9);
      #include <colorspace_fragment>
    }`,
  });
  const r = new THREE.Mesh(new THREE.RingGeometry(1.2, 2.3, 160, 4), anel); r.rotation.x = Math.PI / 2; g.add(r);
  g.rotation.set(0.47, 0, 0.18); return g;
}
