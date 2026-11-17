// Superfície da Terra em WebGL: malha (λ, φ) a cada 1°, deformada no vertex shader com a MESMA
// matemática de morph.ts; textura equirretangular gerada a partir do Natural Earth 1:50m (domínio público).
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';
import { geoEquirectangular, geoPath } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import { CAM_D, CAM_F, View } from './morph';
import { LON0, R2D, MERC_MAX } from './geo';
import { C } from './theme';

const TW = 4096, TH = 2048;

const VS = `
precision highp float;
attribute vec2 aLL;
uniform float uS, uU, uLatC, uZoom, uRoll, uD, uF;
uniform vec2 uPan, uCenter, uRes;
uniform mat3 uG;
varying vec2 vUV; varying float vFacing; varying float vLight; varying float vRim;
float merc(float p){ return clamp(log(tan(0.7853981634 + p*0.5)), -${MERC_MAX.toFixed(8)}, ${MERC_MAX.toFixed(8)}); }
void main(){
  float lam = aLL.x, lat = aLL.y;
  float Phi = mix(merc(lat), lat, uU), PhiC = mix(merc(uLatC), uLatC, uU);
  float s = max(uS, 1e-4), rho = 1.0/s;
  float a = s*lam, b = s*Phi, bc = s*PhiC;
  float sa2 = sin(a*0.5); sa2 *= sa2; float sd = sin((b-bc)*0.5);
  vec3 P = vec3(rho*sin(a)*cos(b), rho*(sin(b-bc) + 2.0*cos(b)*sin(bc)*sa2), -rho*(2.0*sd*sd + 2.0*cos(b)*cos(bc)*sa2));
  vec3 n = vec3(P.x*s, P.y*s, 1.0 + P.z*s);
  vec3 c0 = vec3(0.0, 0.0, rho);
  vec3 W = uG*P + (uG*c0 - c0);
  n = uG*n;
  W.xy -= uPan;
  float w = uD - W.z;
  vec2 p = uZoom*uF*W.xy/w;
  float cr = cos(uRoll), sr = sin(uRoll);
  p = vec2(p.x*cr - p.y*sr, p.x*sr + p.y*cr);
  vec2 scr = uCenter + vec2(p.x, -p.y);
  vec2 clip = vec2(scr.x/uRes.x*2.0 - 1.0, 1.0 - scr.y/uRes.y*2.0);
  vec3 toCam = normalize(vec3(-W.x, -W.y, uD - W.z));
  vFacing = dot(n, toCam);
  vec3 L = normalize(vec3(-0.45, 0.55, 0.70));
  vLight = mix(1.0, 0.70 + 0.38*max(dot(n, L), 0.0), clamp(uS*1.4 - 0.2, 0.0, 1.0));
  vRim = clamp(uS*1.6 - 0.6, 0.0, 1.0) * (1.0 - clamp(vFacing*2.2, 0.0, 1.0));
  vUV = vec2((lam + 3.14159265)/6.28318531, (1.5707963 - lat)/3.14159265);
  gl_Position = vec4(clip, clamp(w/40.0, 0.0, 1.0)*2.0 - 1.0, 1.0);
}`;
const FS = `
precision highp float;
uniform sampler2D uTex;
varying vec2 vUV; varying float vFacing; varying float vLight; varying float vRim;
void main(){
  vec4 c = texture2D(uTex, vUV);
  vec3 col = c.rgb * vLight;
  col = mix(col, vec3(${hexGL(C.bg)}), vRim*0.55);   // escurece a borda do disco (profundidade, não brilho)
  if (vFacing < 0.0) col = mix(vec3(${hexGL(C.bg)}), c.rgb, 0.28); // verso da folha
  gl_FragColor = vec4(col, 1.0);
}`;
function hexGL(h: string) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((x) => (x / 255).toFixed(4)).join(',');
}

let texPromise: Promise<HTMLCanvasElement> | null = null;
function buildTexture(): Promise<HTMLCanvasElement> {
  if (texPromise) return texPromise;
  texPromise = (async () => {
    const [land, countries] = await Promise.all([
      fetch(staticFile('land-50m.json')).then((r) => r.json()),
      fetch(staticFile('countries-50m.json')).then((r) => r.json()),
    ]);
    const cv = document.createElement('canvas'); cv.width = TW; cv.height = TH;
    const g = cv.getContext('2d')!;
    const proj = geoEquirectangular().rotate([-LON0 * R2D, 0]).scale(TW / (2 * Math.PI)).translate([TW / 2, TH / 2]).precision(0.1);
    const path = geoPath(proj, g);
    g.fillStyle = C.ocean; g.fillRect(0, 0, TW, TH);
    g.beginPath(); path(feature(land, land.objects.land) as any); g.fillStyle = C.land; g.fill();
    g.beginPath(); path(mesh(countries, countries.objects.countries, (a: any, b: any) => a !== b) as any);
    g.strokeStyle = C.border; g.lineWidth = 1.6; g.stroke();
    g.beginPath(); path(feature(land, land.objects.land) as any); g.strokeStyle = C.coast; g.lineWidth = 2.4; g.stroke();
    return cv;
  })();
  return texPromise;
}

export const GlobeGL: React.FC<{ view: View; width: number; height: number }> = ({ view, width, height }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<{ gl: WebGLRenderingContext; prog: WebGLProgram; n: number } | null>(null);
  const [handle] = useState(() => delayRender('textura e WebGL'));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    buildTexture().then((tex) => {
      const cv = ref.current!;
      const gl = cv.getContext('webgl', { antialias: true, preserveDrawingBuffer: true })!;
      const sh = (t: number, src: string) => {
        const s = gl.createShader(t)!; gl.shaderSource(s, src); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
        return s;
      };
      const prog = gl.createProgram()!;
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(prog); gl.useProgram(prog);
      // malha 1° × 0,5° (φ de -89,9° a 89,9°)
      const NX = 360, NY = 360;
      const verts: number[] = [];
      for (let j = 0; j <= NY; j++) for (let i = 0; i <= NX; i++)
        verts.push(-Math.PI + (2 * Math.PI * i) / NX, (-89.9 + (179.8 * j) / NY) * Math.PI / 180);
      const idx: number[] = [];
      for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
        const a = j * (NX + 1) + i, b = a + 1, c = a + NX + 1, d = c + 1;
        idx.push(a, b, c, b, d, c);
      }
      gl.getExtension('OES_element_index_uint');
      const vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
      const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(idx), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'aLL'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const an = gl.getExtension('EXT_texture_filter_anisotropic');
      if (an) gl.texParameterf(gl.TEXTURE_2D, an.TEXTURE_MAX_ANISOTROPY_EXT, 8);
      glRef.current = { gl, prog, n: idx.length };
      setReady(true);
    }).catch((e) => { console.error(e); throw e; });
  }, []);

  useLayoutEffect(() => {
    const st = glRef.current; if (!st) return;
    const { gl, prog, n } = st;
    gl.viewport(0, 0, width, height);
    const c = parseInt(C.bg.slice(1), 16);
    gl.clearColor(((c >> 16) & 255) / 255, ((c >> 8) & 255) / 255, (c & 255) / 255, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
    const u = (k: string) => gl.getUniformLocation(prog, k);
    gl.uniform1f(u('uS'), view.s); gl.uniform1f(u('uU'), view.u); gl.uniform1f(u('uLatC'), view.latC);
    gl.uniform1f(u('uZoom'), view.zoom); gl.uniform1f(u('uRoll'), view.roll);
    gl.uniform1f(u('uD'), CAM_D); gl.uniform1f(u('uF'), CAM_F);
    gl.uniform2f(u('uPan'), view.panX, view.panY); gl.uniform2f(u('uCenter'), view.cx, view.cy); gl.uniform2f(u('uRes'), width, height);
    const G = view.G; // GLSL mat3 é coluna a coluna
    gl.uniformMatrix3fv(u('uG'), false, new Float32Array([G[0], G[3], G[6], G[1], G[4], G[7], G[2], G[5], G[8]]));
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_INT, 0);
    gl.finish();
  });

  useEffect(() => { if (ready) continueRender(handle); }, [ready, handle]);

  return <canvas ref={ref} width={width} height={height} style={{ position: 'absolute', left: 0, top: 0, width, height }} />;
};
