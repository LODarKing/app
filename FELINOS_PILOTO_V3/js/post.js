// Filtro de pós-processamento inspirado no visual pintado/impresso do Aranhaverso (WebGL, determinístico):
// pinceladas (Kuwahara generalizado), retícula e hachura nas sombras, cor fora de registro, papel e gradação quente.
'use strict';
const POST = (() => {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const gl = cv.getContext('webgl', { preserveDrawingBuffer: true, premultipliedAlpha: false });
  const vs = `attribute vec2 p; varying vec2 uv; void main(){ uv = vec2(p.x * 0.5 + 0.5, 0.5 - p.y * 0.5); gl_Position = vec4(p, 0.0, 1.0); }`;
  const fs = `precision highp float;
  varying vec2 uv; uniform sampler2D img; uniform vec2 res; uniform float amt; uniform float seed;
  float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7)) + seed) * 43758.5453); }
  float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
  float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * n(p); p *= 2.03; a *= 0.5; } return s; }
  // pinceladas: Kuwahara com 4 quadrantes (amostras a cada 2 px, raio ~6 px)
  vec3 kuwahara(vec2 u){
    vec2 px = 1.0 / res; vec3 m[4]; vec3 s[4];
    for (int k = 0; k < 4; k++) { m[k] = vec3(0.0); s[k] = vec3(0.0); }
    for (int j = 0; j <= 3; j++) for (int i = 0; i <= 3; i++) {
      vec2 o = vec2(float(i), float(j)) * 3.0 * px;
      vec3 c0 = texture2D(img, u + vec2(-o.x, -o.y)).rgb; m[0] += c0; s[0] += c0 * c0;
      vec3 c1 = texture2D(img, u + vec2( o.x, -o.y)).rgb; m[1] += c1; s[1] += c1 * c1;
      vec3 c2 = texture2D(img, u + vec2(-o.x,  o.y)).rgb; m[2] += c2; s[2] += c2 * c2;
      vec3 c3 = texture2D(img, u + vec2( o.x,  o.y)).rgb; m[3] += c3; s[3] += c3 * c3;
    }
    vec3 best = vec3(0.0); float bv = 1e9;
    for (int k = 0; k < 4; k++) { vec3 mu = m[k] / 16.0; vec3 v = abs(s[k] / 16.0 - mu * mu); float sv = v.r + v.g + v.b; if (sv < bv) { bv = sv; best = mu; } }
    return best;
  }
  void main(){
    vec2 fc = uv * res;
    // deslocamento de pincelada: o pincel "puxa" a cor ao longo de um campo de fluxo
    vec2 flow = vec2(n(fc * 0.012), n(fc * 0.012 + 17.0)) - 0.5;
    vec2 u = uv + flow * 6.0 / res;
    vec3 col = mix(texture2D(img, uv).rgb, kuwahara(u), amt);
    // cor fora de registro (impressão): vermelho e azul levemente deslocados
    float r = texture2D(img, uv + vec2(4.0, -1.5) / res).r, b = texture2D(img, uv - vec2(4.0, -1.5) / res).b;
    col.r = mix(col.r, r, 0.45 * amt); col.b = mix(col.b, b, 0.45 * amt);
    float L = dot(col, vec3(0.299, 0.587, 0.114));
    // retícula (pontos girados 30°) nos meios-tons e sombras
    vec2 q = mat2(0.866, -0.5, 0.5, 0.866) * fc / 8.0; vec2 cell = fract(q) - 0.5;
    float dotR = sqrt(clamp(1.0 - L, 0.0, 1.0)) * 0.55;
    float dotMask = 1.0 - smoothstep(dotR - 0.08, dotR + 0.08, length(cell));
    col *= mix(1.0, 0.7, dotMask * smoothstep(0.72, 0.25, L) * amt);
    // hachura diagonal nas sombras mais profundas
    float hatch = step(0.72, fract((fc.x + fc.y) / 7.0));
    col *= 1.0 - 0.2 * hatch * smoothstep(0.32, 0.08, L) * amt;
    // papel e granulação de aquarela
    float paperN = fbm(fc * 0.02), grainN = n(fc * 0.6);
    col *= mix(1.0, 0.93 + 0.1 * paperN + 0.04 * grainN, amt);
    col *= mix(1.0, 0.9 + 0.16 * fbm(fc * 0.004 + 3.0), amt);   // manchas de aquarela
    // gradação quente (laranja / rosa / lilás) e um pouco mais de saturação
    float g = dot(col, vec3(0.333));
    col = mix(vec3(g), col, 1.0 + 0.18 * amt);
    col = mix(col, col * vec3(1.06, 0.98, 0.95) + vec3(0.02, 0.0, 0.03) * (1.0 - L), amt);
    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  }`;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform2f(gl.getUniformLocation(pr, 'res'), W, H);
  const uAmt = gl.getUniformLocation(pr, 'amt'), uSeed = gl.getUniformLocation(pr, 'seed');
  gl.viewport(0, 0, W, H);
  return (ctx, amt = 1, seed = 0) => {
    gl.bindTexture(gl.TEXTURE_2D, tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ctx.canvas);
    gl.uniform1f(uAmt, amt); gl.uniform1f(uSeed, seed); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(cv, 0, 0); ctx.restore();
  };
})();
