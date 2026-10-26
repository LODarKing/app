// Filtro de pós-processamento inspirado no visual pintado/impresso do Aranhaverso (WebGL, determinístico):
// pinceladas (Kuwahara generalizado), retícula e hachura nas sombras, cor fora de registro, papel e gradação quente.
// Mesmo visual do piloto aprovado, refinado, em 4 passadas para caber no tempo de render sem placa de vídeo:
//   (0) papel/aquarela calculados uma vez só (não mudam de quadro para quadro);
//   (T) tensor de estrutura em 1/4 da resolução (direção das bordas da imagem, já suavizado);
//   (1) Kuwahara ANISOTRÓPICO em meia resolução: as pinceladas se alongam ao longo das formas (4 quadrantes girados);
//   (2) composição em resolução cheia: pinceladas + textura de pincel na direção do traço + registro + retícula +
//       hachura + papel + brilho suave nas luzes da cena + gradação (sombras ameixa, luzes quentes) + grão com semente.
'use strict';
const POST = (() => {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const gl = cv.getContext('webgl', { preserveDrawingBuffer: true, premultipliedAlpha: false });
  const vs = `attribute vec2 p; varying vec2 uv; void main(){ uv = vec2(p.x * 0.5 + 0.5, 0.5 - p.y * 0.5); gl_Position = vec4(p, 0.0, 1.0); }`;
  const vsFbo = `attribute vec2 p; varying vec2 uv; void main(){ uv = vec2(p.x * 0.5 + 0.5, 0.5 - p.y * 0.5); gl_Position = vec4(p.x, -p.y, 0.0, 1.0); }`;   // FBO: sem inverter
  const common = `precision highp float;
  varying vec2 uv; uniform vec2 res; uniform float seed;
  float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7)) + seed) * 43758.5453); }
  float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
  float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * n(p); p *= 2.03; a *= 0.5; } return s; }`;
  // (0) papel
  const fsPaper = common + `
  void main(){ vec2 fc = uv * res; gl_FragColor = vec4(fbm(fc * 0.02), n(fc * 0.6), fbm(fc * 0.004 + 3.0), 1.0); }`;
  // (T) tensor de estrutura (Sobel na luminância, média de 4 posições = já suavizado)
  const fsTen = common + `
  uniform sampler2D img;
  float lum(vec2 u){ return dot(texture2D(img, u).rgb, vec3(0.299, 0.587, 0.114)); }
  void main(){
    vec2 px = 1.0 / res; vec3 acc = vec3(0.0);
    for (int k = 0; k < 4; k++) {
      vec2 u = uv + (vec2(float(k / 2), float(k - (k / 2) * 2)) - 0.5) * 6.0 * px, d = 3.0 * px;
      float gx = (lum(u + vec2(d.x, -d.y)) + 2.0 * lum(u + vec2(d.x, 0.0)) + lum(u + d)) - (lum(u - d) + 2.0 * lum(u - vec2(d.x, 0.0)) + lum(u + vec2(-d.x, d.y)));
      float gy = (lum(u + vec2(-d.x, d.y)) + 2.0 * lum(u + vec2(0.0, d.y)) + lum(u + d)) - (lum(u - d) + 2.0 * lum(u - vec2(0.0, d.y)) + lum(u + vec2(d.x, -d.y)));
      acc += vec3(gx * gx, gy * gy, gx * gy);
    }
    acc /= 4.0; gl_FragColor = vec4(acc.x * 4.0, acc.y * 4.0, acc.z * 2.0 + 0.5, 1.0);
  }`;
  // direção do traço a partir do tensor: (cos, sen) da tangente da borda e anisotropia 0..1
  const orient = `
  vec3 orient(vec4 T){ float E = T.r / 4.0, G = T.g / 4.0, F = (T.b - 0.5) / 2.0;
    float tr = E + G, dt = sqrt(max((E - G) * (E - G) + 4.0 * F * F, 0.0)), l1 = 0.5 * (tr + dt), l2 = 0.5 * (tr - dt);
    vec2 v = vec2(l1 - E, -F); float L = length(v); v = L > 1e-6 ? v / L : vec2(0.0, 1.0);
    float A = (l1 + l2) > 1e-5 ? (l1 - l2) / (l1 + l2) : 0.0; return vec3(v, A); }`;
  // (1) pinceladas
  const fsKuw = common + orient + `
  uniform sampler2D img; uniform sampler2D ten;
  void main(){
    vec2 fc = uv * res, px = 1.0 / res;
    vec2 flow = vec2(n(fc * 0.012), n(fc * 0.012 + 17.0)) - 0.5;
    vec2 u = uv + flow * 6.0 / res;
    vec3 o3 = orient(texture2D(ten, uv)); float an = clamp(o3.z, 0.0, 1.0);
    vec2 tg = o3.xy, nr = vec2(-tg.y, tg.x); float sa = 1.0 + 1.5 * an, sb = 1.0 / (1.0 + 0.8 * an);
    mat2 R = mat2(tg * sa, nr * sb);   // grade de amostras girada e esticada ao longo da borda
    vec3 m0 = vec3(0.0), m1 = vec3(0.0), m2 = vec3(0.0), m3 = vec3(0.0), s0 = vec3(0.0), s1 = vec3(0.0), s2 = vec3(0.0), s3 = vec3(0.0);
    for (int j = 0; j <= 3; j++) for (int i = 0; i <= 3; i++) {
      vec2 o = (R * vec2(float(i), float(j))) * 3.6 * px;
      vec3 c0 = texture2D(img, u + vec2(-o.x, -o.y)).rgb; m0 += c0; s0 += c0 * c0;
      vec3 c1 = texture2D(img, u + vec2( o.x, -o.y)).rgb; m1 += c1; s1 += c1 * c1;
      vec3 c2 = texture2D(img, u + vec2(-o.x,  o.y)).rgb; m2 += c2; s2 += c2 * c2;
      vec3 c3 = texture2D(img, u + vec2( o.x,  o.y)).rgb; m3 += c3; s3 += c3 * c3;
    }
    m0 /= 16.0; m1 /= 16.0; m2 /= 16.0; m3 /= 16.0;
    vec3 v0 = abs(s0 / 16.0 - m0 * m0), v1 = abs(s1 / 16.0 - m1 * m1), v2 = abs(s2 / 16.0 - m2 * m2), v3 = abs(s3 / 16.0 - m3 * m3);
    float a0 = v0.r + v0.g + v0.b, a1 = v1.r + v1.g + v1.b, a2 = v2.r + v2.g + v2.b, a3 = v3.r + v3.g + v3.b;
    vec3 best = m0; float bv = a0;
    if (a1 < bv) { bv = a1; best = m1; } if (a2 < bv) { bv = a2; best = m2; } if (a3 < bv) { bv = a3; best = m3; }
    gl_FragColor = vec4(best, 1.0);
  }`;
  // (2) composição
  const fsComp = common + `
  uniform sampler2D img; uniform sampler2D kuw; uniform sampler2D paperT; uniform sampler2D ten; uniform float amt; uniform float frame;
  void main(){
    vec2 fc = uv * res;
    vec3 col = mix(texture2D(img, uv).rgb, texture2D(kuw, uv).rgb, amt);
    // textura de pincel na direção do traço (estrias finas ao longo das formas, mais visíveis nos tons médios)
    vec3 o3 = orient(texture2D(ten, uv)); vec2 q2 = mat2(o3.x, -o3.y, o3.y, o3.x) * fc;
    float streak = n(vec2(q2.x * 0.045, q2.y * 0.55)) * 0.6 + n(vec2(q2.x * 0.09, q2.y * 1.3) + 9.0) * 0.4;
    float Lm = dot(col, vec3(0.299, 0.587, 0.114));
    col *= 1.0 + (streak - 0.5) * 0.17 * amt * (0.35 + 0.65 * smoothstep(0.05, 0.4, Lm) * smoothstep(0.98, 0.6, Lm));
    // brilho suave das luzes da cena (sol, feixes): só onde a cena já é muito clara
    vec3 bl = vec3(0.0);
    for (int k = 0; k < 8; k++) { float a = float(k) * 0.785398; bl += max(texture2D(kuw, uv + vec2(cos(a), sin(a)) * 22.0 / res).rgb - 0.72, 0.0); }
    col += bl / 8.0 * vec3(1.0, 0.86, 0.66) * 0.55 * amt;
    float r = texture2D(img, uv + vec2(4.0, -1.5) / res).r, b = texture2D(img, uv - vec2(4.0, -1.5) / res).b;
    col.r = mix(col.r, r, 0.45 * amt); col.b = mix(col.b, b, 0.45 * amt);
    float L = dot(col, vec3(0.299, 0.587, 0.114));
    vec2 q = mat2(0.866, -0.5, 0.5, 0.866) * fc / 8.0; vec2 cell = fract(q) - 0.5;
    float dotR = sqrt(clamp(1.0 - L, 0.0, 1.0)) * 0.55;
    float dotMask = 1.0 - smoothstep(dotR - 0.08, dotR + 0.08, length(cell));
    col *= mix(1.0, 0.78, dotMask * smoothstep(0.72, 0.25, L) * amt);
    float hatch = step(0.72, fract((fc.x + fc.y) / 7.0));
    col *= 1.0 - 0.16 * hatch * smoothstep(0.32, 0.08, L) * amt;
    vec3 pp = texture2D(paperT, uv).rgb;
    col *= mix(1.0, 0.93 + 0.1 * pp.r + 0.04 * pp.g, amt);
    col *= mix(1.0, 0.9 + 0.16 * pp.b, amt);
    float g = dot(col, vec3(0.333));
    col = mix(vec3(g), col, 1.0 + 0.18 * amt);
    col = mix(col, col * vec3(1.06, 0.98, 0.95) + vec3(0.02, 0.0, 0.03) * (1.0 - L), amt);
    // gradação: sombras puxadas para o ameixa, luzes levemente quentes, curva suave de contraste
    float L2 = dot(col, vec3(0.299, 0.587, 0.114));
    col += amt * (vec3(0.05, 0.015, 0.07) * pow(1.0 - L2, 3.0) + vec3(0.025, 0.012, -0.02) * smoothstep(0.55, 1.0, L2));
    col = mix(col, col * col * (3.0 - 2.0 * col), 0.18 * amt);
    // grão de filme com semente (muda a cada quadro, sempre igual para o mesmo quadro)
    col += (h(fc + vec2(frame * 13.1, frame * 7.7)) - 0.5) * 0.03 * amt;
    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  }`;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const prog = (v, f) => { const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, v)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, f)); gl.linkProgram(pr); return pr; };
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const use = (pr) => { gl.useProgram(pr); const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0); gl.uniform2f(gl.getUniformLocation(pr, 'res'), W, H); gl.uniform1f(gl.getUniformLocation(pr, 'seed'), 0); };
  const tex = (w, h) => { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); if (w) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null); return t; };
  const fbo = (t) => { const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0); return f; };
  const fsCompF = fsComp.replace('void main(){', orient + '\n  void main(){');
  const pPaper = prog(vsFbo, fsPaper), pTen = prog(vsFbo, fsTen), pKuw = prog(vsFbo, fsKuw), pComp = prog(vs, fsCompF);
  const tImg = tex(), tTen = tex(W / 4, H / 4), tKuw = tex(W / 2, H / 2), tPaper = tex(W, H), fTen = fbo(tTen), fKuw = fbo(tKuw), fPaper = fbo(tPaper);
  // (0) uma vez
  gl.bindFramebuffer(gl.FRAMEBUFFER, fPaper); gl.viewport(0, 0, W, H); use(pPaper); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  return (ctx, amt = 1, frame = 0) => {
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tImg); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ctx.canvas);
    // (T)
    gl.bindFramebuffer(gl.FRAMEBUFFER, fTen); gl.viewport(0, 0, W / 4, H / 4); use(pTen); gl.uniform1i(gl.getUniformLocation(pTen, 'img'), 0); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    // (1)
    gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, tTen); gl.activeTexture(gl.TEXTURE0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fKuw); gl.viewport(0, 0, W / 2, H / 2); use(pKuw); gl.uniform1i(gl.getUniformLocation(pKuw, 'img'), 0); gl.uniform1i(gl.getUniformLocation(pKuw, 'ten'), 3); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    // (2)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W, H); use(pComp);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tKuw); gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, tPaper); gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(gl.getUniformLocation(pComp, 'img'), 0); gl.uniform1i(gl.getUniformLocation(pComp, 'kuw'), 1); gl.uniform1i(gl.getUniformLocation(pComp, 'paperT'), 2); gl.uniform1f(gl.getUniformLocation(pComp, 'amt'), amt); gl.uniform1i(gl.getUniformLocation(pComp, 'ten'), 3); gl.uniform1f(gl.getUniformLocation(pComp, 'frame'), frame % 1000);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(cv, 0, 0); ctx.restore();
  };
})();
