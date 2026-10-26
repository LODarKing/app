// Filtro de pós-processamento inspirado no visual pintado/impresso do Aranhaverso (WebGL, determinístico):
// pinceladas (Kuwahara generalizado), retícula e hachura nas sombras, cor fora de registro, papel e gradação quente.
// Mesmo visual do piloto aprovado, em 3 passadas para caber no tempo de render sem placa de vídeo:
//   (0) papel/aquarela calculados uma vez só (não mudam de quadro para quadro);
//   (1) Kuwahara em meia resolução (mesmo núcleo de 4x4 amostras a cada 3 px, 1/4 dos pixels);
//   (2) composição em resolução cheia: pinceladas ampliadas + registro + retícula + hachura + papel + gradação.
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
  // (1) pinceladas
  const fsKuw = common + `
  uniform sampler2D img;
  void main(){
    vec2 fc = uv * res, px = 1.0 / res;
    vec2 flow = vec2(n(fc * 0.012), n(fc * 0.012 + 17.0)) - 0.5;
    vec2 u = uv + flow * 6.0 / res;
    vec3 m0 = vec3(0.0), m1 = vec3(0.0), m2 = vec3(0.0), m3 = vec3(0.0), s0 = vec3(0.0), s1 = vec3(0.0), s2 = vec3(0.0), s3 = vec3(0.0);
    for (int j = 0; j <= 3; j++) for (int i = 0; i <= 3; i++) {
      vec2 o = vec2(float(i), float(j)) * 3.0 * px;
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
  uniform sampler2D img; uniform sampler2D kuw; uniform sampler2D paperT; uniform float amt;
  void main(){
    vec2 fc = uv * res;
    vec3 col = mix(texture2D(img, uv).rgb, texture2D(kuw, uv).rgb, amt);
    float r = texture2D(img, uv + vec2(4.0, -1.5) / res).r, b = texture2D(img, uv - vec2(4.0, -1.5) / res).b;
    col.r = mix(col.r, r, 0.45 * amt); col.b = mix(col.b, b, 0.45 * amt);
    float L = dot(col, vec3(0.299, 0.587, 0.114));
    vec2 q = mat2(0.866, -0.5, 0.5, 0.866) * fc / 8.0; vec2 cell = fract(q) - 0.5;
    float dotR = sqrt(clamp(1.0 - L, 0.0, 1.0)) * 0.55;
    float dotMask = 1.0 - smoothstep(dotR - 0.08, dotR + 0.08, length(cell));
    col *= mix(1.0, 0.7, dotMask * smoothstep(0.72, 0.25, L) * amt);
    float hatch = step(0.72, fract((fc.x + fc.y) / 7.0));
    col *= 1.0 - 0.2 * hatch * smoothstep(0.32, 0.08, L) * amt;
    vec3 pp = texture2D(paperT, uv).rgb;
    col *= mix(1.0, 0.93 + 0.1 * pp.r + 0.04 * pp.g, amt);
    col *= mix(1.0, 0.9 + 0.16 * pp.b, amt);
    float g = dot(col, vec3(0.333));
    col = mix(vec3(g), col, 1.0 + 0.18 * amt);
    col = mix(col, col * vec3(1.06, 0.98, 0.95) + vec3(0.02, 0.0, 0.03) * (1.0 - L), amt);
    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  }`;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const prog = (v, f) => { const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, v)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, f)); gl.linkProgram(pr); return pr; };
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const use = (pr) => { gl.useProgram(pr); const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0); gl.uniform2f(gl.getUniformLocation(pr, 'res'), W, H); gl.uniform1f(gl.getUniformLocation(pr, 'seed'), 0); };
  const tex = (w, h) => { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); if (w) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null); return t; };
  const fbo = (t) => { const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0); return f; };
  const pPaper = prog(vsFbo, fsPaper), pKuw = prog(vsFbo, fsKuw), pComp = prog(vs, fsComp);
  const tImg = tex(), tKuw = tex(W / 2, H / 2), tPaper = tex(W, H), fKuw = fbo(tKuw), fPaper = fbo(tPaper);
  // (0) uma vez
  gl.bindFramebuffer(gl.FRAMEBUFFER, fPaper); gl.viewport(0, 0, W, H); use(pPaper); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  return (ctx, amt = 1) => {
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tImg); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ctx.canvas);
    // (1)
    gl.bindFramebuffer(gl.FRAMEBUFFER, fKuw); gl.viewport(0, 0, W / 2, H / 2); use(pKuw); gl.uniform1i(gl.getUniformLocation(pKuw, 'img'), 0); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    // (2)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W, H); use(pComp);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tKuw); gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, tPaper); gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(gl.getUniformLocation(pComp, 'img'), 0); gl.uniform1i(gl.getUniformLocation(pComp, 'kuw'), 1); gl.uniform1i(gl.getUniformLocation(pComp, 'paperT'), 2); gl.uniform1f(gl.getUniformLocation(pComp, 'amt'), amt);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(cv, 0, 0); ctx.restore();
  };
})();
